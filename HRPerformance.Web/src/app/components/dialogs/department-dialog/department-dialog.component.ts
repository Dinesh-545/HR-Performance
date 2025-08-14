import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../services/api.service';
import { Department } from '../../../models/employee';

export interface DepartmentDialogData {
  department?: Department;
  isEdit: boolean;
}

@Component({
  selector: 'app-department-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './department-dialog.component.html',
  styleUrl: './department-dialog.component.scss'
})
export class DepartmentDialogComponent implements OnInit {
  departmentForm!: FormGroup;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<DepartmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DepartmentDialogData,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });

    if (this.data.department && this.data.isEdit) {
      this.departmentForm.patchValue({
        name: this.data.department.name
      });
    }
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      this.loading = true;
      const formData = this.departmentForm.value;
      
      // Convert to PascalCase for backend compatibility
      const departmentData = {
        Name: formData.name
      };

      if (this.data.isEdit && this.data.department) {
        // Update existing department
        const updateData = {
          Id: this.data.department.id,
          Name: formData.name
        };
        
        this.apiService.updateDepartment(this.data.department.id, updateData as any).subscribe({
          next: (updatedDepartment) => {
            this.loading = false;
            this.dialogRef.close(updatedDepartment);
          },
          error: (error) => {
            console.error('Error updating department:', error);
            this.loading = false;
          }
        });
      } else {
        // Create new department
        this.apiService.createDepartment(departmentData as any).subscribe({
          next: (newDepartment) => {
            this.loading = false;
            this.dialogRef.close(newDepartment);
          },
          error: (error) => {
            console.error('Error creating department:', error);
            this.loading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.departmentForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }
} 