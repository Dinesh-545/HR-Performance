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
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { Employee, Department } from '../../models/employee';
import { EmployeeDialogComponent } from '../dialogs/employee-dialog/employee-dialog.component';

@Component({
  selector: 'app-employees',
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
    MatOptionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  departments: Department[] = [];
  filteredEmployees: Employee[] = [];
  loading = true;
  searchTerm = '';
  selectedDepartment = '';

  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'department', 'manager', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees(): void {
    this.loading = true;
    console.log('Loading employees...'); // Debug log
    this.apiService.getEmployees().subscribe({
      next: (employees) => {
        console.log('Employees loaded successfully:', employees.length); // Debug log
        this.employees = employees;
        this.filteredEmployees = employees;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
        this.showSnackBar('Error loading employees', 'error');
      }
    });
  }

  loadDepartments(): void {
    console.log('Loading departments...'); // Debug log
    this.apiService.getDepartments().subscribe({
      next: (departments) => {
        console.log('Departments loaded successfully:', departments.length); // Debug log
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.showSnackBar('Error loading departments', 'error');
      }
    });
  }

  openAddEmployeeDialog(): void {
    console.log('Opening Add Employee Dialog - Departments:', this.departments);
    console.log('Opening Add Employee Dialog - Employees:', this.employees);
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '600px',
      data: {
        departments: this.departments,
        managers: this.employees.filter(emp => this.getEmployeeRole(emp) === 'Manager'),
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employees.unshift(result);
        this.filterEmployees();
        this.showSnackBar('Employee created successfully', 'success');
      }
    });
  }

  openEditEmployeeDialog(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '600px',
      data: {
        employee: employee,
        departments: this.departments,
        managers: this.employees.filter(emp => this.getEmployeeRole(emp) === 'Manager' && (emp.Id || emp.id) !== (employee.Id || employee.id)),
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.employees.findIndex(emp => (emp.Id || emp.id) === (result.Id || result.id));
        if (index !== -1) {
          this.employees[index] = result;
          this.filterEmployees();
          this.showSnackBar('Employee updated successfully', 'success');
        }
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    if (confirm(`Are you sure you want to delete ${firstName} ${lastName}?`)) {
      this.apiService.deleteEmployee(employee.Id || employee.id).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => (emp.Id || emp.id) !== (employee.Id || employee.id));
          this.filterEmployees();
          this.showSnackBar('Employee deleted successfully', 'success');
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          this.showSnackBar('Error deleting employee', 'error');
        }
      });
    }
  }

  filterEmployees(): void {
    this.filteredEmployees = this.employees.filter(employee => {
      const firstName = employee.FirstName || employee.firstName || '';
      const lastName = employee.LastName || employee.lastName || '';
      const email = employee.Email || employee.email || '';
      
      const matchesSearch = !this.searchTerm || 
        firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = !this.selectedDepartment || 
        this.getEmployeeDepartmentId(employee)?.toString() === this.selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }

  getEmployeeName(employee: Employee): string {
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  }

  getDepartmentName(employee: Employee): string {
    if (employee.department) {
      return employee.department.Name || employee.department.name || 'N/A';
    }
    // Fallback to ID lookup if department object is not available
    const departmentId = employee.DepartmentId || employee.departmentId;
    if (!departmentId) return 'N/A';
    const department = this.departments.find(d => (d.Id || d.id) === departmentId);
    return department ? (department.Name || department.name) : 'N/A';
  }

  getManagerName(managerId?: number): string {
    if (!managerId) return 'N/A';
    const manager = this.employees.find(e => (e.Id || e.id) === managerId);
    if (!manager) return 'N/A';
    const firstName = manager.FirstName || manager.firstName || '';
    const lastName = manager.LastName || manager.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  }

  getEmployeeEmail(employee: Employee): string {
    return employee.Email || employee.email || 'N/A';
  }

  getEmployeeRole(employee: Employee): string {
    return employee.Role || employee.role || 'N/A';
  }

  getEmployeeDepartmentId(employee: Employee): number | undefined {
    return employee.DepartmentId || employee.departmentId;
  }

  getEmployeeManagerId(employee: Employee): number | undefined {
    return employee.ManagerId || employee.managerId;
  }

  onSearchChange(): void {
    this.filterEmployees();
  }

  onDepartmentChange(): void {
    this.filterEmployees();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.filterEmployees();
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
