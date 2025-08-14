import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatOptionModule } from '@angular/material/core';
import { ApiService } from '../../services/api.service';
import { RecommendationService, Recommendation } from '../../services/recommendation.service';
import { ChartService } from '../../services/chart.service';
import { Employee, Goal, Review, Department, Skill } from '../../models/employee';
import { Chart } from 'chart.js';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatChipsModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTabsModule, MatOptionModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('overviewChart') overviewChartRef!: ElementRef;
  @ViewChild('performanceChart') performanceChartRef!: ElementRef;

  metrics = {
    totalEmployees: 0,
    goalCompletionRate: 0,
    averageRating: 0,
    pendingReviews: 0,
    topPerformers: [] as Employee[],
    departmentPerformance: [] as any[],
    skillGaps: [] as any[],
    recommendations: [] as Recommendation[]
  };

  employees: Employee[] = [];
  goals: Goal[] = [];
  reviews: Review[] = [];
  departments: Department[] = [];
  skills: Skill[] = [];
  loading = true;
  selectedDepartment = 'all';

  // Chart instances
  private overviewChart?: Chart;
  private performanceChart?: Chart;

  constructor(
    private apiService: ApiService,
    private recommendationService: RecommendationService,
    private chartService: ChartService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data loads
  }

  ngOnDestroy(): void {
    // Clean up charts to prevent memory leaks
    this.destroyCharts();
  }

  loadData(): void {
    this.loading = true;
    forkJoin([
      this.apiService.getEmployees(),
      this.apiService.getGoals(),
      this.apiService.getReviews(),
      this.apiService.getDepartments(),
      this.apiService.getSkills()
    ]).subscribe({
      next: ([employees, goals, reviews, departments, skills]) => {
        this.employees = employees;
        this.goals = goals;
        this.reviews = reviews;
        this.departments = departments;
        this.skills = skills;
        this.calculateMetrics();
        this.generateRecommendations();
        this.createCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics data:', error);
        this.loading = false;
      }
    });
  }

  calculateMetrics(): void {
    this.metrics.totalEmployees = this.employees.length;

    const completedGoals = this.goals.filter(g => (g.Status || g.status) === 'Completed').length;
    this.metrics.goalCompletionRate = this.metrics.totalEmployees > 0
      ? Math.round((completedGoals / this.goals.length) * 100)
      : 0;

    const totalRatings = this.reviews.filter(r => r.rating > 0).reduce((sum, r) => sum + r.rating, 0);
    const ratedReviewsCount = this.reviews.filter(r => r.rating > 0).length;
    this.metrics.averageRating = ratedReviewsCount > 0
      ? parseFloat((totalRatings / ratedReviewsCount).toFixed(1))
      : 0;

    this.metrics.pendingReviews = this.reviews.filter(r => r.rating === 0).length;

    this.metrics.topPerformers = this.employees.filter(emp => {
      const empReviews = this.reviews.filter(r => r.revieweeId === emp.id && r.rating > 0);
      if (empReviews.length === 0) return false;
      const avgRating = empReviews.reduce((sum, r) => sum + r.rating, 0) / empReviews.length;
      return avgRating >= 4;
    });

    this.metrics.departmentPerformance = this.departments.map(dept => {
      const deptEmployees = this.employees.filter(emp => (emp.DepartmentId || emp.departmentId) === dept.id);
      const deptGoals = this.goals.filter(goal => deptEmployees.some(emp => (emp.Id || emp.id) === goal.EmployeeId));
      const deptCompletedGoals = deptGoals.filter(g => (g.Status || g.status) === 'Completed').length;
      const completionRate = deptGoals.length > 0 ? Math.round((deptCompletedGoals / deptGoals.length) * 100) : 0;
      return {
        id: dept.id,
        name: dept.name,
        employeeCount: deptEmployees.length,
        goalCount: deptGoals.length,
        completionRate: completionRate
      };
    });

    this.metrics.skillGaps = this.identifySkillGaps();
  }

  generateRecommendations(): void {
    this.metrics.recommendations = this.recommendationService.generateRecommendations(
      this.employees,
      this.goals,
      this.reviews,
      this.departments
    );
  }

  createCharts(): void {
    // Destroy existing charts
    this.destroyCharts();

    // Create new charts
    setTimeout(() => {
      this.createOverviewChart();
      this.createPerformanceChart();
    }, 100);
  }

  createOverviewChart(): void {
    if (this.overviewChartRef?.nativeElement) {
      const chartData = {
        labels: ['Completed', 'In Progress', 'Not Started', 'On Hold'],
        datasets: [{
          label: 'Goals by Status',
          data: [
                    this.goals.filter(g => (g.Status || g.status) === 'Completed').length,
        this.goals.filter(g => (g.Status || g.status) === 'In Progress').length,
        this.goals.filter(g => (g.Status || g.status) === 'Not Started').length,
        this.goals.filter(g => (g.Status || g.status) === 'On Hold').length
          ],
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336']
        }]
      };
      
      this.overviewChart = this.chartService.createGoalCompletionChart(
        this.overviewChartRef.nativeElement,
        chartData
      );
    }
  }

  createPerformanceChart(): void {
    if (this.performanceChartRef?.nativeElement) {
      const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Average Rating',
          data: [3.8, 3.9, 4.0, 4.1, 4.2, 4.3]
        }]
      };
      
      this.performanceChart = this.chartService.createPerformanceTrendChart(
        this.performanceChartRef.nativeElement,
        chartData
      );
    }
  }

  destroyCharts(): void {
    if (this.overviewChart) this.chartService.destroyChart(this.overviewChart);
    if (this.performanceChart) this.chartService.destroyChart(this.performanceChart);
  }

  getEmployeeName(employeeId?: number): string {
    if (!employeeId) return 'N/A';
    const employee = this.employees.find(emp => (emp.Id || emp.id) === employeeId);
    if (!employee) return 'N/A';
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  }

  getDepartmentName(departmentId?: number): string {
    if (!departmentId) return 'N/A';
    const department = this.departments.find(d => (d.Id || d.id) === departmentId);
    return department ? department.name : 'N/A';
  }

  getGoalStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'accent';
      case 'In Progress': return 'primary';
      case 'Not Started': return 'warn';
      case 'Overdue': return 'warn';
      default: return '';
    }
  }

  getReviewRatingText(rating: number): string {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Below Average';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Not Rated';
    }
  }

  identifySkillGaps(): any[] {
    const skillGaps: any[] = [];

    this.departments.forEach(dept => {
      const requiredSkills = this.skills;
      const deptEmployees = this.employees.filter(emp => (emp.DepartmentId || emp.departmentId) === dept.id);

      requiredSkills.forEach(skill => {
        const employeesWithSkill = deptEmployees.filter(emp =>
          this.apiService.getEmployeeSkills(emp.id).pipe(
            map(empSkills => empSkills.some(es => es.skillId === skill.id))
          )
        );
        
        if (employeesWithSkill.length / deptEmployees.length < 0.5) {
          skillGaps.push({
            department: dept.name,
            skill: skill.name,
            description: skill.description,
            gapPercentage: Math.round((1 - (employeesWithSkill.length / deptEmployees.length)) * 100)
          });
        }
      });
    });
    return skillGaps;
  }
} 