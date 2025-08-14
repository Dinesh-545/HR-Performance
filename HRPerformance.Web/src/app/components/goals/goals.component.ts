import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from '../../services/api.service';
import { Goal, Employee } from '../../models/employee';
import { GoalDialogComponent } from '../dialogs/goal-dialog/goal-dialog.component';
import { GoalProgressDialogComponent } from '../dialogs/goal-progress-dialog/goal-progress-dialog.component';


@Component({
  selector: 'app-goals',
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
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  goals$ = this.goalsSubject.asObservable();
  
  goals: Goal[] = [];
  employees: Employee[] = [];
  filteredGoals: Goal[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = '';
  selectedEmployee = '';

  displayedColumns: string[] = ['id', 'title', 'employee', 'status', 'progress', 'dueDate', 'actions'];

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' }
  ];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGoals();
    this.loadEmployees();
    
    // Subscribe to goals changes
    this.goals$.pipe(takeUntil(this.destroy$)).subscribe(goals => {
      console.log('Goals subject updated:', goals.length, 'goals'); // Debug log
      this.goals = goals;
      this.filterGoals();
      this.cdr.detectChanges();
      console.log('Change detection triggered for goals'); // Debug log
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGoals(): void {
    this.loading = true;
    console.log('Loading goals...'); // Debug log
    this.apiService.getGoals().subscribe({
      next: (goals) => {
        console.log('Goals loaded successfully:', goals.length); // Debug log
        console.log('Goals data:', goals); // Debug log
        this.goalsSubject.next(goals); // Update the subject
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        this.loading = false;
        this.showSnackBar('Error loading goals', 'error');
      }
    });
  }

  loadEmployees(): void {
    console.log('Loading employees for goals...'); // Debug log
    this.apiService.getEmployees().subscribe({
      next: (employees) => {
        console.log('Employees loaded for goals:', employees.length); // Debug log
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees for goals:', error);
        this.showSnackBar('Error loading employees', 'error');
      }
    });
  }

  openAddGoalDialog(): void {
    const dialogRef = this.dialog.open(GoalDialogComponent, {
      width: '600px',
      data: {
        employees: this.employees,
        managers: this.employees.filter(emp => this.getEmployeeRole(emp) === 'Manager'),
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Goal dialog closed with result:', result); // Debug log
      if (result) {
        // Add the new goal to the current list
        const currentGoals = this.goalsSubject.value;
        this.goalsSubject.next([result, ...currentGoals]);
        this.showSnackBar('Goal created successfully', 'success');
      } else {
        console.log('Goal dialog returned null/undefined result'); // Debug log
        // If dialog returns null, force a reload to ensure data consistency
        this.loadGoals();
      }
    });
  }

  openEditGoalDialog(goal: Goal): void {
    const dialogRef = this.dialog.open(GoalDialogComponent, {
      width: '600px',
      data: {
        goal: goal,
        employees: this.employees,
        managers: this.employees.filter(emp => this.getEmployeeRole(emp) === 'Manager'),
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Goal dialog closed with result:', result); // Debug log
      if (result) {
        // Update the goal in the current list
        const currentGoals = this.goalsSubject.value;
        const index = currentGoals.findIndex(g => this.getGoalId(g) === this.getGoalId(result));
        if (index !== -1) {
          currentGoals[index] = result;
          this.goalsSubject.next([...currentGoals]);
        } else {
          // If not found, reload all goals
          this.loadGoals();
        }
        this.showSnackBar('Goal updated successfully', 'success');
      } else {
        console.log('Goal dialog returned null/undefined result'); // Debug log
        // If dialog returns null, force a reload to ensure data consistency
        this.loadGoals();
      }
    });
  }

  deleteGoal(goal: Goal): void {
    if (confirm(`Are you sure you want to delete the goal "${this.getGoalTitle(goal)}"?`)) {
      this.apiService.deleteGoal(this.getGoalId(goal)).subscribe({
              next: () => {
        // Remove the goal from the current list
        const currentGoals = this.goalsSubject.value;
        const filteredGoals = currentGoals.filter(g => this.getGoalId(g) !== this.getGoalId(goal));
        this.goalsSubject.next(filteredGoals);
        this.showSnackBar('Goal deleted successfully', 'success');
      },
        error: (error) => {
          console.error('Error deleting goal:', error);
          this.showSnackBar('Error deleting goal', 'error');
        }
      });
    }
  }

  filterGoals(): void {
    this.filteredGoals = this.goals.filter(goal => {
      const matchesSearch = !this.searchTerm || 
        this.getGoalTitle(goal).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getGoalDescription(goal).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || 
        this.getGoalStatus(goal) === this.selectedStatus;
      
      const matchesEmployee = !this.selectedEmployee || 
        this.getGoalEmployeeId(goal).toString() === this.selectedEmployee;
      
      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => (emp.Id || emp.id) === employeeId);
    if (!employee) return 'N/A';
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  }

  // Helper methods to get goal properties with fallback support
  getGoalId(goal: Goal): number {
    return goal.Id || goal.id || 0;
  }

  getGoalTitle(goal: Goal): string {
    return goal.Title || goal.title || '';
  }

  getGoalDescription(goal: Goal): string {
    return goal.Description || goal.description || '';
  }

  getGoalStatus(goal: Goal): string {
    return goal.Status || goal.status || '';
  }

  getGoalStartDate(goal: Goal): string {
    return goal.StartDate || goal.startDate || '';
  }

  getGoalEndDate(goal: Goal): string {
    return goal.EndDate || goal.endDate || '';
  }

  getGoalEmployeeId(goal: Goal): number {
    return goal.EmployeeId || goal.employeeId || 0;
  }

  getGoalEmployee(goal: Goal): Employee | undefined {
    return goal.Employee || goal.employee;
  }

  getEmployeeRole(employee: Employee): string {
    return employee.Role || employee.role || 'N/A';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'On Hold': return 'warn';
      case 'Not Started': return 'accent';
      default: return 'primary';
    }
  }

  getProgressPercentage(goal: Goal): number {
    // If there's a stored progress value, use it
    const storedProgress = goal.Progress || goal.progress;
    if (storedProgress !== undefined && storedProgress !== null) {
      return storedProgress;
    }
    
    // Otherwise calculate based on time
    const start = new Date(this.getGoalStartDate(goal)).getTime();
    const end = new Date(this.getGoalEndDate(goal)).getTime();
    const now = new Date().getTime();
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  }

  

  getDaysRemaining(goal: Goal): number {
    const end = new Date(this.getGoalEndDate(goal));
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  onSearchChange(): void {
    this.filterGoals();
  }

  onStatusChange(): void {
    this.filterGoals();
  }

  onEmployeeChange(): void {
    this.filterGoals();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedEmployee = '';
    this.filterGoals();
  }

  getGoalsByStatus(status: string): number {
    return this.goals.filter(goal => (goal.Status || goal.status) === status).length;
  }

  getTotalGoals(): number {
    return this.goals.length;
  }

  // Team Performance Methods
  isManager(): boolean {
    // This would typically come from auth service
    // For now, we'll check if user has access to multiple employees
    return this.employees.length > 1;
  }

  getTeamCompletionRate(): number {
    const completedGoals = this.goals.filter(g => (g.Status || g.status) === 'Completed').length;
    return this.goals.length > 0 ? Math.round((completedGoals / this.goals.length) * 100) : 0;
  }

  getOverdueGoalsCount(): number {
    return this.goals.filter(g => {
      const status = g.Status || g.status;
      const endDate = new Date(g.EndDate || g.endDate || '');
      return status !== 'Completed' && endDate < new Date();
    }).length;
  }

  getTeamMembersCount(): number {
    const teamMemberIds = new Set(this.goals.map(g => g.EmployeeId || g.employeeId));
    return teamMemberIds.size;
  }

  updateGoalProgress(goal: Goal): void {
    const dialogRef = this.dialog.open(GoalProgressDialogComponent, {
      width: '400px',
      data: { goal: goal }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Progress updated:', result);
        // Update the goal with new progress
        const updatedGoal = { ...goal, ...result };
        this.apiService.updateGoal(this.getGoalId(goal), updatedGoal).subscribe({
          next: (response) => {
            // Update local goal data
            const currentGoals = this.goalsSubject.value;
            const index = currentGoals.findIndex(g => this.getGoalId(g) === this.getGoalId(goal));
            if (index !== -1) {
              currentGoals[index] = response;
              this.goalsSubject.next([...currentGoals]);
            }
            this.showSnackBar('Goal progress updated successfully', 'success');
          },
          error: (error) => {
            console.error('Error updating goal progress:', error);
            this.showSnackBar('Error updating goal progress', 'error');
          }
        });
      }
    });
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
