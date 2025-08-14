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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../services/api.service';
import { Goal, Employee } from '../../../models/employee';

export interface GoalDialogData {
  goal?: Goal;
  employees: Employee[];
  managers: Employee[];
  isEdit: boolean;
}

@Component({
  selector: 'app-goal-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './goal-dialog.component.html',
  styleUrl: './goal-dialog.component.scss'
})
export class GoalDialogComponent implements OnInit {
  goalForm!: FormGroup;
  employees: Employee[] = [];
  managers: Employee[] = [];
  loading = false;

  statusOptions = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' }
  ];

  constructor(
    private dialogRef: MatDialogRef<GoalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GoalDialogData,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.employees = data.employees;
    this.managers = data.managers;
  }

  ngOnInit(): void {
    this.employees = this.data.employees || [];
    this.managers = this.data.managers || [];
    
    console.log('Employees passed to dialog:', this.employees);
    console.log('Managers passed to dialog:', this.managers);
    
    // If employees are not provided, load them
    if (this.employees.length === 0) {
      this.apiService.getEmployees().subscribe({
        next: (employees) => {
          this.employees = employees;
          this.managers = employees.filter(emp => (emp.Role || emp.role) === 'Manager');
          console.log('Employees loaded from API:', this.employees);
        },
        error: (error) => {
          console.error('Error loading employees:', error);
        }
      });
    }
    
    this.initForm();
    console.log('Goal dialog initialized');
  }

  initForm(): void {
    this.goalForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.minLength(10)]], // Remove required validator
      employeeId: ['', [Validators.required, this.employeeIdValidator]], // Add custom validator
      managerId: [''],
      status: ['Not Started', Validators.required],
      startDate: [new Date(), Validators.required], // Set default to today
      endDate: [new Date(), Validators.required], // Set default to today
      notes: ['']
    });

    if (this.data.goal && this.data.isEdit) {
      this.goalForm.patchValue({
        title: this.data.goal.Title || this.data.goal.title || '',
        description: this.data.goal.Description || this.data.goal.description || '',
        employeeId: this.data.goal.EmployeeId || this.data.goal.employeeId || '',
        managerId: this.data.goal.ManagerId || this.data.goal.managerId || '',
        status: this.data.goal.Status || this.data.goal.status || '',
        startDate: (this.data.goal.StartDate || this.data.goal.startDate) ? new Date(this.data.goal.StartDate || this.data.goal.startDate || '') : new Date(),
        endDate: (this.data.goal.EndDate || this.data.goal.endDate) ? new Date(this.data.goal.EndDate || this.data.goal.endDate || '') : new Date(),
        notes: this.data.goal.Notes || this.data.goal.notes || ''
      });
    }
    
    console.log('Goal form initialized:', this.goalForm.value);
  }

  onSubmit(): void {
    console.log('=== GOAL FORM SUBMISSION START ==='); // Debug log
    console.log('Form validity:', this.goalForm.valid);
    console.log('Form errors:', this.goalForm.errors);
    console.log('EmployeeId errors:', this.goalForm.get('employeeId')?.errors);
    console.log('Form value:', this.goalForm.value);
    console.log('EmployeeId value:', this.goalForm.get('employeeId')?.value);
    console.log('EmployeeId type:', typeof this.goalForm.get('employeeId')?.value);
    console.log('Is edit mode:', this.data.isEdit); // Debug log
    console.log('Goal data:', this.data.goal); // Debug log
    
    if (this.goalForm.valid) {
      this.loading = true;
      const formData = this.goalForm.value;
      
      // Convert to PascalCase for backend compatibility
      const goalData = {
        Title: formData.title,
        Description: formData.description,
        EmployeeId: parseInt(formData.employeeId) || null,
        ManagerId: formData.managerId ? parseInt(formData.managerId) : null,
        Status: formData.status,
        StartDate: formData.startDate,
        EndDate: formData.endDate,
        Notes: formData.notes || ''
      };

      if (this.data.isEdit && this.data.goal) {
        // Update existing goal - include the Id
        const updateData = {
          Id: this.data.goal?.Id || this.data.goal?.id || 0, // Include the Id for updates
          Title: formData.title,
          Description: formData.description,
          EmployeeId: parseInt(formData.employeeId) || null,
          ManagerId: formData.managerId ? parseInt(formData.managerId) : null,
          Status: formData.status,
          StartDate: formData.startDate,
          EndDate: formData.endDate,
          Notes: formData.notes || ''
        };
        
        const goalId = this.data.goal?.Id || this.data.goal?.id || 0;
        console.log('Updating goal with ID:', goalId); // Debug log
        console.log('Update data:', updateData); // Debug log
        
        this.apiService.updateGoal(goalId, updateData as any).subscribe({
          next: (updatedGoal) => {
            console.log('API returned updated goal:', updatedGoal); // Debug log
            console.log('Closing dialog with result'); // Debug log
            this.loading = false;
            this.dialogRef.close(updatedGoal);
          },
          error: (error) => {
            console.error('Error updating goal:', error);
            this.loading = false;
            // Don't close dialog on error, let user try again
          }
        });
      } else {
        // Create new goal
        console.log('Creating new goal with data:', goalData); // Debug log
        
        this.apiService.createGoal(goalData as any).subscribe({
          next: (newGoal) => {
            console.log('API returned new goal:', newGoal); // Debug log
            console.log('Closing dialog with result'); // Debug log
            this.loading = false;
            this.dialogRef.close(newGoal);
          },
          error: (error) => {
            console.error('Error creating goal:', error);
            this.loading = false;
            // Don't close dialog on error, let user try again
          }
        });
      }
    }
  }

  onCancel(): void {
    console.log('Goal dialog cancelled'); // Debug log
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.goalForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    if (field?.hasError('invalidEmployeeId')) {
      return 'Please select a valid employee';
    }
    return '';
  }

  getEmployeeName(employee: Employee): string {
    if (!employee) return '';
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || '';
  }

  // Custom validator for employeeId
  employeeIdValidator(control: any) {
    if (!control.value) {
      return { required: true };
    }
    const value = parseInt(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidEmployeeId: true };
    }
    return null;
  }
} 