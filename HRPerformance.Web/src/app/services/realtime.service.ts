import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { Chart } from 'chart.js';

export interface LiveDataPoint {
  timestamp: Date;
  value: number;
  label: string;
  category: string;
}

export interface LiveMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface LiveActivity {
  id: string;
  type: 'goal_completed' | 'review_submitted' | 'employee_added' | 'skill_updated';
  message: string;
  timestamp: Date;
  employee?: string;
  department?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  message: string;
  timestamp: Date;
  department?: string;
  employee?: string;
  actionRequired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {

  private liveMetricsSubject = new BehaviorSubject<LiveMetric[]>([]);
  private liveActivitiesSubject = new BehaviorSubject<LiveActivity[]>([]);
  private performanceAlertsSubject = new BehaviorSubject<PerformanceAlert[]>([]);
  private chartDataSubject = new BehaviorSubject<any>({});

  private updateSubscription?: Subscription;
  private isLive = false;

  // Observables
  public liveMetrics$ = this.liveMetricsSubject.asObservable();
  public liveActivities$ = this.liveActivitiesSubject.asObservable();
  public performanceAlerts$ = this.performanceAlertsSubject.asObservable();
  public chartData$ = this.chartDataSubject.asObservable();

  constructor() { }

  // Start real-time updates
  startLiveUpdates(intervalMs: number = 5000): void {
    if (this.isLive) {
      this.stopLiveUpdates();
    }

    this.isLive = true;
    this.updateSubscription = interval(intervalMs)
      .pipe(
        startWith(0),
        switchMap(() => this.generateLiveData())
      )
      .subscribe(data => {
        this.updateLiveMetrics(data.metrics);
        this.updateLiveActivities(data.activities);
        this.updatePerformanceAlerts(data.alerts);
        this.updateChartData(data.chartData);
      });
  }

  // Stop real-time updates
  stopLiveUpdates(): void {
    this.isLive = false;
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  // Get current live status
  isLiveActive(): boolean {
    return this.isLive;
  }

  // Update live metrics
  private updateLiveMetrics(metrics: LiveMetric[]): void {
    this.liveMetricsSubject.next(metrics);
  }

  // Update live activities
  private updateLiveActivities(activities: LiveActivity[]): void {
    const currentActivities = this.liveActivitiesSubject.value;
    const updatedActivities = [...activities, ...currentActivities].slice(0, 50); // Keep last 50
    this.liveActivitiesSubject.next(updatedActivities);
  }

  // Update performance alerts
  private updatePerformanceAlerts(alerts: PerformanceAlert[]): void {
    const currentAlerts = this.performanceAlertsSubject.value;
    const updatedAlerts = [...alerts, ...currentAlerts].slice(0, 20); // Keep last 20
    this.performanceAlertsSubject.next(updatedAlerts);
  }

  // Update chart data
  private updateChartData(chartData: any): void {
    this.chartDataSubject.next(chartData);
  }

  // Generate live data
  private generateLiveData(): Observable<any> {
    return new Observable(observer => {
      const data = {
        metrics: this.generateLiveMetrics(),
        activities: this.generateLiveActivities(),
        alerts: this.generatePerformanceAlerts(),
        chartData: this.generateLiveChartData()
      };
      observer.next(data);
      observer.complete();
    });
  }

  // Generate live metrics
  private generateLiveMetrics(): LiveMetric[] {
    const metrics: LiveMetric[] = [
      {
        id: 'overall_performance',
        name: 'Overall Performance',
        value: this.getRandomValue(75, 95),
        previousValue: this.getRandomValue(70, 90),
        change: 0,
        trend: 'up',
        color: '#4caf50'
      },
      {
        id: 'goal_completion',
        name: 'Goal Completion Rate',
        value: this.getRandomValue(60, 85),
        previousValue: this.getRandomValue(55, 80),
        change: 0,
        trend: 'up',
        color: '#2196f3'
      },
      {
        id: 'employee_satisfaction',
        name: 'Employee Satisfaction',
        value: this.getRandomValue(80, 95),
        previousValue: this.getRandomValue(75, 90),
        change: 0,
        trend: 'stable',
        color: '#ff9800'
      },
      {
        id: 'department_efficiency',
        name: 'Department Efficiency',
        value: this.getRandomValue(70, 90),
        previousValue: this.getRandomValue(65, 85),
        change: 0,
        trend: 'up',
        color: '#9c27b0'
      }
    ];

    // Calculate changes and trends
    metrics.forEach(metric => {
      metric.change = metric.value - metric.previousValue;
      if (metric.change > 2) {
        metric.trend = 'up';
      } else if (metric.change < -2) {
        metric.trend = 'down';
      } else {
        metric.trend = 'stable';
      }
    });

    return metrics;
  }

  // Generate live activities
  private generateLiveActivities(): LiveActivity[] {
    const activities: LiveActivity[] = [];
    const activityTypes: LiveActivity['type'][] = [
      'goal_completed',
      'review_submitted',
      'employee_added',
      'skill_updated'
    ];

    const messages = {
      goal_completed: [
        'John Doe completed "Q3 Sales Target"',
        'Jane Smith achieved "Project Alpha Milestone"',
        'Mike Johnson finished "Leadership Training"',
        'Sarah Connor completed "Technical Certification"'
      ],
      review_submitted: [
        'Sarah Connor submitted a review for Kyle Reese',
        'David Lee completed a self-review',
        'Emily White reviewed Mark Brown',
        'Alex Green submitted peer review'
      ],
      employee_added: [
        'New employee Alex Green joined HR',
        'Welcome Lisa Ray to Marketing',
        'Tom Wilson joined Engineering',
        'Maria Garcia added to Sales'
      ],
      skill_updated: [
        'Chris Evans updated his Angular skills',
        'Patty O\'Malley gained new DevOps certification',
        'Sam Wilson improved leadership skills',
        'Natasha Romanoff updated project management'
      ]
    };

    const departments = ['HR', 'Marketing', 'Engineering', 'Sales', 'Finance'];
    const employees = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Connor', 'David Lee'];

    // Generate 1-3 random activities
    const numActivities = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numActivities; i++) {
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const messageList = messages[type];
      const message = messageList[Math.floor(Math.random() * messageList.length)];
      
      const activity: LiveActivity = {
        id: `activity_${Date.now()}_${i}`,
        type,
        message,
        timestamp: new Date(),
        employee: employees[Math.floor(Math.random() * employees.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      };
      
      activities.push(activity);
    }

    return activities;
  }

  // Generate performance alerts
  private generatePerformanceAlerts(): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    const alertTypes: PerformanceAlert['type'][] = ['warning', 'error', 'success', 'info'];

    const alertMessages = {
      warning: [
        'Performance below target in Engineering department',
        'Goal completion rate dropping in Sales',
        'Employee satisfaction declining in Marketing'
      ],
      error: [
        'Critical performance issue detected',
        'System alert: Data synchronization failed',
        'Emergency: High turnover rate detected'
      ],
      success: [
        'All departments meeting performance targets',
        'Employee satisfaction at all-time high',
        'Goal completion rate exceeded expectations'
      ],
      info: [
        'Monthly review cycle starting next week',
        'New performance metrics available',
        'System maintenance scheduled for tonight'
      ]
    };

    const departments = ['HR', 'Marketing', 'Engineering', 'Sales', 'Finance'];
    const employees = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Connor'];

    // Generate 0-2 random alerts
    const numAlerts = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numAlerts; i++) {
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const messageList = alertMessages[type];
      const message = messageList[Math.floor(Math.random() * messageList.length)];
      
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${i}`,
        type,
        message,
        timestamp: new Date(),
        department: departments[Math.floor(Math.random() * departments.length)],
        employee: employees[Math.floor(Math.random() * employees.length)],
        actionRequired: type === 'error' || type === 'warning'
      };
      
      alerts.push(alert);
    }

    return alerts;
  }

  // Generate live chart data
  private generateLiveChartData(): any {
    return {
      performanceTrend: {
        labels: this.getLast12Months(),
        datasets: [{
          label: 'Performance Score',
          data: Array.from({ length: 12 }, () => this.getRandomValue(70, 95)),
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        }]
      },
      goalCompletion: {
        labels: ['Completed', 'In Progress', 'Not Started', 'On Hold'],
        datasets: [{
          data: [
            this.getRandomValue(40, 60),
            this.getRandomValue(20, 35),
            this.getRandomValue(10, 25),
            this.getRandomValue(5, 15)
          ],
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336']
        }]
      },
      departmentComparison: {
        labels: ['HR', 'Marketing', 'Engineering', 'Sales', 'Finance'],
        datasets: [{
          label: 'Performance Score',
          data: Array.from({ length: 5 }, () => this.getRandomValue(70, 95)),
          backgroundColor: 'rgba(76, 192, 192, 0.8)'
        }]
      }
    };
  }

  // Helper methods
  private getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getLast12Months(): string[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const result = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      result.push(months[monthIndex]);
    }
    
    return result;
  }

  // Update chart with live data
  updateChartWithLiveData(chart: Chart, newData: any): void {
    if (chart && newData) {
      chart.data = newData;
      chart.update('none'); // Update without animation for real-time
    }
  }

  // Add custom live data point
  addCustomDataPoint(chart: Chart, dataPoint: LiveDataPoint): void {
    if (chart && chart.data.labels && chart.data.datasets[0].data) {
      chart.data.labels.push(dataPoint.label);
      chart.data.datasets[0].data.push(dataPoint.value);
      
      // Keep only last 20 data points for performance
      if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
      }
      
      chart.update('none');
    }
  }

  // Get current live data
  getCurrentLiveData(): any {
    return {
      metrics: this.liveMetricsSubject.value,
      activities: this.liveActivitiesSubject.value,
      alerts: this.performanceAlertsSubject.value,
      chartData: this.chartDataSubject.value
    };
  }

  // Clear all live data
  clearLiveData(): void {
    this.liveMetricsSubject.next([]);
    this.liveActivitiesSubject.next([]);
    this.performanceAlertsSubject.next([]);
    this.chartDataSubject.next({});
  }
} 