import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../services/api.service';
import { Employee, Department } from '../../../models/employee';

export interface EmployeeDialogData {
  employee?: Employee;
  departments: Department[];
  managers: Employee[];
  isEdit: boolean;
}

@Component({
  selector: 'app-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './employee-dialog.component.html',
  styleUrl: './employee-dialog.component.scss'
})
export class EmployeeDialogComponent implements OnInit {
  employeeForm!: FormGroup;
  departments: Department[] = [];
  managers: Employee[] = [];
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<EmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeeDialogData,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.departments = data.departments;
    this.managers = data.managers;
    console.log('EmployeeDialog - Departments:', this.departments);
    console.log('EmployeeDialog - Managers:', this.managers);
  }

  ngOnInit(): void {
    this.initForm();
    
    // If departments are not provided, load them
    if (!this.departments || this.departments.length === 0) {
      console.log('Loading departments in dialog...');
      this.apiService.getDepartments().subscribe({
        next: (departments) => {
          console.log('Departments loaded in dialog:', departments);
          this.departments = departments;
        },
        error: (error) => {
          console.error('Error loading departments in dialog:', error);
        }
      });
    }
    
    // If managers are not provided, load them
    if (!this.managers || this.managers.length === 0) {
      console.log('Loading employees for managers in dialog...');
      this.apiService.getEmployees().subscribe({
        next: (employees) => {
          console.log('Employees loaded in dialog:', employees);
          this.managers = employees.filter(emp => (emp.Role || emp.role) === 'Manager');
        },
        error: (error) => {
          console.error('Error loading employees in dialog:', error);
        }
      });
    }
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['Employee', Validators.required],
      departmentId: ['', Validators.required],
      managerId: ['']
    });

    if (this.data.employee && this.data.isEdit) {
      this.employeeForm.patchValue({
        firstName: this.data.employee.FirstName || this.data.employee.firstName || '',
        lastName: this.data.employee.LastName || this.data.employee.lastName || '',
        email: this.data.employee.Email || this.data.employee.email || '',
        role: this.data.employee.Role || this.data.employee.role || 'Employee',
        departmentId: this.data.employee.DepartmentId || this.data.employee.departmentId || null,
        managerId: this.data.employee.ManagerId || this.data.employee.managerId || null
      });
    }
  }

  onSubmit(): void {
    console.log('=== EMPLOYEE FORM SUBMISSION START ==='); // Debug log
    console.log('Form validity:', this.employeeForm.valid); // Debug log
    console.log('Form errors:', this.employeeForm.errors); // Debug log
    console.log('Form value:', this.employeeForm.value); // Debug log
    console.log('Is edit mode:', this.data.isEdit); // Debug log
    console.log('Employee data:', this.data.employee); // Debug log
    
    if (this.employeeForm.valid) {
      this.loading = true;
      const formData = this.employeeForm.value;
      
      // Map form data to match C# backend property names
      const employeeData = {
        Id: this.data.employee?.id || 0, // Use PascalCase Id
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        Role: formData.role,
        DepartmentId: formData.departmentId || null,
        ManagerId: formData.managerId || null
      } as any;

      if (this.data.isEdit && this.data.employee) {
        // Update existing employee
        const employeeId = this.data.employee.Id || this.data.employee.id;
        console.log('Updating employee with ID:', employeeId); // Debug log
        this.apiService.updateEmployee(employeeId, employeeData).subscribe({
          next: (updatedEmployee) => {
            console.log('API returned updated employee:', updatedEmployee); // Debug log
            console.log('Closing dialog with result'); // Debug log
            this.loading = false;
            this.dialogRef.close(updatedEmployee);
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            this.loading = false;
            // Don't close dialog on error, let user try again
          }
        });
      } else {
        // Create new employee
        console.log('Creating new employee with data:', employeeData); // Debug log
        
        this.apiService.createEmployee(employeeData).subscribe({
          next: (newEmployee) => {
            console.log('API returned new employee:', newEmployee); // Debug log
            console.log('Closing dialog with result'); // Debug log
            this.loading = false;
            this.dialogRef.close(newEmployee);
          },
          error: (error) => {
            console.error('Error creating employee:', error);
            this.loading = false;
            // Don't close dialog on error, let user try again
          }
        });
      }
    }
  }

  onCancel(): void {
    console.log('Employee dialog cancelled'); // Debug log
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 2 characters`;
    }
    return '';
  }

  getEmployeeName(employee: Employee): string {
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || '';
  }
} 