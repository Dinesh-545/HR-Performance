import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Employee, Goal, Review, Department } from '../../models/employee';
import { interval, Subscription } from 'rxjs';

interface RealTimeMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: string;
}

interface LiveActivity {
  id: string;
  type: 'goal_completed' | 'review_submitted' | 'employee_added' | 'performance_alert';
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-real-time-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatSnackBarModule
  ],
  templateUrl: './real-time-analytics.component.html',
  styleUrl: './real-time-analytics.component.scss'
})
export class RealTimeAnalyticsComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  goals: Goal[] = [];
  reviews: Review[] = [];
  departments: Department[] = [];

  realTimeMetrics: RealTimeMetric[] = [];
  liveActivities: LiveActivity[] = [];
  alerts: LiveActivity[] = [];

  loading = true;
  isLive = true;
  private updateSubscription?: Subscription;

  // Real-time counters
  activeUsers = 0;
  goalsCompletedToday = 0;
  reviewsSubmittedToday = 0;
  performanceAlerts = 0;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.startRealTimeUpdates();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  loadInitialData(): void {
    this.loading = true;
    
    Promise.all([
      this.apiService.getEmployees().toPromise(),
      this.apiService.getGoals().toPromise(),
      this.apiService.getReviews().toPromise(),
      this.apiService.getDepartments().toPromise()
    ]).then(([employees, goals, reviews, departments]) => {
      this.employees = employees || [];
      this.goals = goals || [];
      this.reviews = reviews || [];
      this.departments = departments || [];
      
      this.initializeRealTimeMetrics();
      this.generateLiveActivities();
      this.loading = false;
    }).catch(error => {
      console.error('Error loading real-time data:', error);
      this.loading = false;
    });
  }

  startRealTimeUpdates(): void {
    this.updateSubscription = interval(5000).subscribe(() => {
      if (this.isLive) {
        this.updateRealTimeMetrics();
        this.generateNewActivity();
        this.checkPerformanceAlerts();
      }
    });
  }

  initializeRealTimeMetrics(): void {
    this.realTimeMetrics = [
      {
        name: 'Active Users',
        value: this.employees.length,
        change: Math.floor(Math.random() * 10) - 5,
        trend: 'up',
        color: '#4caf50',
        icon: 'people'
      },
      {
        name: 'Goals Completed Today',
        value: this.goals.filter(g => (g.Status || g.status) === 'Completed').length,
        change: Math.floor(Math.random() * 5),
        trend: 'up',
        color: '#2196f3',
        icon: 'flag'
      },
      {
        name: 'Reviews Submitted',
        value: this.reviews.length,
        change: Math.floor(Math.random() * 3),
        trend: 'up',
        color: '#ff9800',
        icon: 'assessment'
      },
      {
        name: 'Performance Alerts',
        value: this.performanceAlerts,
        change: Math.floor(Math.random() * 2),
        trend: 'stable',
        color: '#f44336',
        icon: 'warning'
      }
    ];
  }

  updateRealTimeMetrics(): void {
    this.realTimeMetrics.forEach(metric => {
      // Simulate real-time updates
      const change = Math.floor(Math.random() * 6) - 3;
      metric.value = Math.max(0, metric.value + change);
      metric.change = change;
      metric.trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
    });
  }

  generateLiveActivities(): void {
    const activities: LiveActivity[] = [
      {
        id: '1',
        type: 'goal_completed',
        message: 'John Doe completed goal: "Improve team collaboration"',
        timestamp: new Date(),
        priority: 'medium'
      },
      {
        id: '2',
        type: 'review_submitted',
        message: 'Performance review submitted for Sarah Johnson',
        timestamp: new Date(Date.now() - 300000),
        priority: 'high'
      },
      {
        id: '3',
        type: 'employee_added',
        message: 'New employee Mike Wilson added to Engineering team',
        timestamp: new Date(Date.now() - 600000),
        priority: 'low'
      },
      {
        id: '4',
        type: 'performance_alert',
        message: 'Performance alert: Goal completion rate below target',
        timestamp: new Date(Date.now() - 900000),
        priority: 'high'
      }
    ];

    this.liveActivities = activities;
    this.alerts = activities.filter(a => a.priority === 'high');
  }

  generateNewActivity(): void {
    const activityTypes = ['goal_completed', 'review_submitted', 'employee_added', 'performance_alert'] as const;
    const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    const messages: Record<string, string[]> = {
      goal_completed: [
        'Goal completed: "Increase sales by 20%"',
        'Milestone achieved: "Complete project phase 1"',
        'Objective met: "Improve customer satisfaction"'
      ],
      review_submitted: [
        'Quarterly review submitted for Marketing team',
        'Annual performance review completed',
        'Peer review submitted for technical assessment'
      ],
      employee_added: [
        'New hire: Senior Developer joined Development team',
        'Welcome: HR Specialist added to HR team',
        'New team member: Sales Representative joined Sales team'
      ],
      performance_alert: [
        'Alert: Department performance below target',
        'Warning: Goal completion rate declining',
        'Notice: Employee satisfaction score dropped'
      ]
    };

    const newActivity: LiveActivity = {
      id: Date.now().toString(),
      type: randomType,
      message: messages[randomType][Math.floor(Math.random() * messages[randomType].length)],
      timestamp: new Date(),
      priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    };

    this.liveActivities.unshift(newActivity);
    if (newActivity.priority === 'high') {
      this.alerts.unshift(newActivity);
      this.showAlert(newActivity.message);
    }

    // Keep only last 20 activities
    if (this.liveActivities.length > 20) {
      this.liveActivities = this.liveActivities.slice(0, 20);
    }
  }

  checkPerformanceAlerts(): void {
    const goalCompletionRate = this.goals.length > 0 
              ? (this.goals.filter(g => (g.Status || g.status) === 'Completed').length / this.goals.length) * 100 
      : 0;

    if (goalCompletionRate < 60) {
      const alert: LiveActivity = {
        id: Date.now().toString(),
        type: 'performance_alert',
        message: `Performance Alert: Goal completion rate is ${goalCompletionRate.toFixed(1)}%`,
        timestamp: new Date(),
        priority: 'high'
      };

      this.alerts.unshift(alert);
      this.showAlert(alert.message);
    }
  }

  showAlert(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['alert-snackbar']
    });
  }

  toggleLiveUpdates(): void {
    this.isLive = !this.isLive;
    if (this.isLive) {
      this.startRealTimeUpdates();
    } else if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'goal_completed': return 'flag';
      case 'review_submitted': return 'assessment';
      case 'employee_added': return 'person_add';
      case 'performance_alert': return 'warning';
      default: return 'info';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'goal_completed': return '#4caf50';
      case 'review_submitted': return '#2196f3';
      case 'employee_added': return '#ff9800';
      case 'performance_alert': return '#f44336';
      default: return '#757575';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
} 