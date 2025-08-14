import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { ApiService } from '../../services/api.service';
import { Department, Employee } from '../../models/employee';
import { DepartmentDialogComponent } from '../dialogs/department-dialog/department-dialog.component';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatOptionModule
  ],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss'
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  employees: Employee[] = [];
  filteredDepartments: Department[] = [];
  loading = true;
  searchTerm = '';
  displayedColumns: string[] = ['id', 'name', 'employeeCount', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments(): void {
    this.loading = true;
    console.log('Loading departments...');
    this.apiService.getDepartments().subscribe({
      next: (departments) => {
        console.log('Departments loaded successfully:', departments.length);
        this.departments = departments;
        this.filteredDepartments = departments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.loading = false;
        this.showSnackBar('Error loading departments', 'error');
      }
    });
  }

  loadEmployees(): void {
    this.apiService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  filterDepartments(): void {
    this.filteredDepartments = this.departments.filter(department => {
      const matchesSearch = !this.searchTerm || 
        department.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }

  onSearchChange(): void {
    this.filterDepartments();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterDepartments();
  }

  openAddDepartmentDialog(): void {
    const dialogRef = this.dialog.open(DepartmentDialogComponent, {
      width: '500px',
      data: {
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.departments.unshift(result);
        this.filterDepartments();
        this.showSnackBar('Department added successfully', 'success');
      }
    });
  }

  openEditDepartmentDialog(department: Department): void {
    const dialogRef = this.dialog.open(DepartmentDialogComponent, {
      width: '500px',
      data: {
        department: department,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.departments.findIndex(d => (d.Id || d.id) === (result.Id || result.id));
        if (index !== -1) {
          this.departments[index] = result;
          this.filterDepartments();
          this.showSnackBar('Department updated successfully', 'success');
        }
      }
    });
  }

  deleteDepartment(department: Department): void {
    if (confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      this.apiService.deleteDepartment(department.id).subscribe({
        next: () => {
          this.departments = this.departments.filter(d => (d.Id || d.id) !== (department.Id || department.id));
          this.filterDepartments();
          this.showSnackBar('Department deleted successfully', 'success');
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          this.showSnackBar('Error deleting department', 'error');
        }
      });
    }
  }

  getEmployeeCount(departmentId: number): number {
    return this.employees.filter(emp => emp.DepartmentId === departmentId).length;
  }

  getAverageEmployeesPerDepartment(): number {
    if (this.departments.length === 0) return 0;
    return Math.round(this.employees.length / this.departments.length);
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
} 