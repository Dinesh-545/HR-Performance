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
import { Skill } from '../../../models/employee';

export interface SkillDialogData {
  skill?: Skill;
  isEdit: boolean;
}

@Component({
  selector: 'app-skill-dialog',
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
  templateUrl: './skill-dialog.component.html',
  styleUrl: './skill-dialog.component.scss'
})
export class SkillDialogComponent implements OnInit {
  skillForm!: FormGroup;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<SkillDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SkillDialogData,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.skillForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });

    if (this.data.skill && this.data.isEdit) {
      this.skillForm.patchValue({
        name: this.data.skill.name,
        description: this.data.skill.description
      });
    }
  }

  onSubmit(): void {
    if (this.skillForm.valid) {
      this.loading = true;
      const formData = this.skillForm.value;
      
      // Convert to PascalCase for backend compatibility
      const skillData = {
        Name: formData.name,
        Description: formData.description
      };

      if (this.data.isEdit && this.data.skill) {
        // Update existing skill
        const updateData = {
          Id: this.data.skill.id,
          Name: formData.name,
          Description: formData.description
        };
        
        this.apiService.updateSkill(this.data.skill.id, updateData as any).subscribe({
          next: (updatedSkill) => {
            this.loading = false;
            this.dialogRef.close(updatedSkill);
          },
          error: (error) => {
            console.error('Error updating skill:', error);
            this.loading = false;
          }
        });
      } else {
        // Create new skill
        this.apiService.createSkill(skillData as any).subscribe({
          next: (newSkill) => {
            this.loading = false;
            this.dialogRef.close(newSkill);
          },
          error: (error) => {
            console.error('Error creating skill:', error);
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
    const field = this.skillForm.get(fieldName);
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