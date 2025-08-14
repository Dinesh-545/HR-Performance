import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { Employee, Goal, Skill } from '../../models/employee';
import { Chart, ChartConfiguration, ChartData } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('goalChartCanvas') goalChartCanvas!: ElementRef;
  @ViewChild('employeeChartCanvas') employeeChartCanvas!: ElementRef;
  @ViewChild('skillChartCanvas') skillChartCanvas!: ElementRef;
  
  employees: Employee[] = [];
  goals: Goal[] = [];
  skills: Skill[] = [];
  departments: any[] = [];
  totalEmployees = 0;
  activeGoals = 0;
  completedGoals = 0;
  pendingReviews = 0;
  loading = true;
  
  private goalChart?: Chart;
  private employeeChart?: Chart;
  private skillChart?: Chart;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load employees
    this.apiService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.totalEmployees = employees.length;
      },
      error: (error) => console.error('Error loading employees:', error)
    });

    // Load goals
    this.apiService.getGoals().subscribe({
      next: (goals) => {
        this.goals = goals;
              this.activeGoals = goals.filter(g => (g.Status || g.status) === 'In Progress').length;
      this.completedGoals = goals.filter(g => (g.Status || g.status) === 'Completed').length;
      },
      error: (error) => console.error('Error loading goals:', error)
    });

    // Load departments
    this.apiService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => console.error('Error loading departments:', error)
    });

    // Load skills
    this.apiService.getSkills().subscribe({
      next: (skills) => {
        this.skills = skills;
        this.loading = false;
        // Initialize charts after data is loaded
        setTimeout(() => {
          this.initializeCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading skills:', error);
        this.loading = false;
      }
    });
  }

  getGoalProgress(): number {
    if (this.goals.length === 0) return 0;
    return (this.completedGoals / this.goals.length) * 100;
  }

  getRecentEmployees(): Employee[] {
    return this.employees.slice(0, 5);
  }

  getRecentGoals(): Goal[] {
    return this.goals.slice(0, 3);
  }

  getEmployeeName(employee: Employee): string {
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  }

  getEmployeeRole(employee: Employee): string {
    return employee.Role || employee.role || 'N/A';
  }

  getEmployeeEmail(employee: Employee): string {
    return employee.Email || employee.email || 'N/A';
  }

  private initializeCharts(): void {
    this.createGoalChart();
    this.createEmployeeChart();
    this.createSkillChart();
  }

  private createGoalChart(): void {
    if (!this.goalChartCanvas) return;
    
    const ctx = this.goalChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const goalData: ChartData<'doughnut'> = {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [{
        data: [
          this.completedGoals,
          this.activeGoals,
          this.goals.length - this.completedGoals - this.activeGoals
        ],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(158, 158, 158, 0.8)'
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(158, 158, 158, 1)'
        ],
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(158, 158, 158, 1)'
        ]
      }]
    };

    this.goalChart = new Chart(ctx, {
      type: 'doughnut',
      data: goalData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 12,
                weight: 'bold'
              },
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Goal Status Distribution',
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#2c3e50'
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  private createEmployeeChart(): void {
    if (!this.employeeChartCanvas) return;
    
    const ctx = this.employeeChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Group employees by department
    const departmentCounts = new Map<string, number>();
    this.employees.forEach(emp => {
      const deptId = emp.DepartmentId || emp.departmentId;
      if (deptId) {
        const deptName = this.getDepartmentName(deptId);
        departmentCounts.set(deptName, (departmentCounts.get(deptName) || 0) + 1);
      }
    });

    const employeeData: ChartData<'bar'> = {
      labels: Array.from(departmentCounts.keys()),
      datasets: [{
        label: 'Employees per Department',
        data: Array.from(departmentCounts.values()),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(102, 126, 234, 1)',
        hoverBorderColor: 'rgba(102, 126, 234, 1)',
        hoverBorderWidth: 3
      }]
    };

    this.employeeChart = new Chart(ctx, {
      type: 'bar',
      data: employeeData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Employees by Department',
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#2c3e50'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(127, 140, 141, 0.2)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(127, 140, 141, 0.2)'
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  private createSkillChart(): void {
    if (!this.skillChartCanvas) return;
    
    const ctx = this.skillChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const skillData: ChartData<'pie'> = {
      labels: this.skills.map(skill => skill.Name || skill.name),
      datasets: [{
        data: this.skills.map(() => Math.floor(Math.random() * 20) + 1), // Random data for demo
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(102, 126, 234, 0.8)',
          'rgba(201, 203, 207, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 152, 0, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(102, 126, 234, 1)',
          'rgba(201, 203, 207, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(255, 152, 0, 1)'
        ],
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(102, 126, 234, 1)',
          'rgba(201, 203, 207, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(255, 152, 0, 1)'
        ]
      }]
    };

    this.skillChart = new Chart(ctx, {
      type: 'pie',
      data: skillData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 12,
                weight: 'bold'
              },
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Skills Distribution',
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#2c3e50'
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  private getDepartmentName(departmentId: number): string {
    const department = this.departments.find(d => (d.Id || d.id) === departmentId);
    return department ? (department.Name || department.name) : `Department ${departmentId}`;
  }
}
