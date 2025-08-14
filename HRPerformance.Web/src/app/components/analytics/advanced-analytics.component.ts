import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ApiService } from '../../services/api.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ChartService } from '../../services/chart.service';
import { RealtimeService } from '../../services/realtime.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-advanced-analytics',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatProgressBarModule, MatChipsModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTabsModule, MatOptionModule, MatButtonModule, MatMenuModule, MatSlideToggleModule
  ],
  templateUrl: './advanced-analytics.component.html',
  styleUrl: './advanced-analytics.component.scss'
})
export class AdvancedAnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('goalChart') goalChartRef!: ElementRef;
  @ViewChild('performanceChart') performanceChartRef!: ElementRef;
  @ViewChild('departmentChart') departmentChartRef!: ElementRef;
  @ViewChild('employeeChart') employeeChartRef!: ElementRef;
  @ViewChild('skillChart') skillChartRef!: ElementRef;
  @ViewChild('trendsChart') trendsChartRef!: ElementRef;
  @ViewChild('bubbleChart') bubbleChartRef!: ElementRef;
  @ViewChild('scatterChart') scatterChartRef!: ElementRef;
  @ViewChild('polarChart') polarChartRef!: ElementRef;
  @ViewChild('stackedChart') stackedChartRef!: ElementRef;
  @ViewChild('areaChart') areaChartRef!: ElementRef;

  // Chart instances
  private goalChart?: Chart;
  private performanceChart?: Chart;
  private departmentChart?: Chart;
  private employeeChart?: Chart;
  private skillChart?: Chart;
  private trendsChart?: Chart;
  private bubbleChart?: Chart;
  private scatterChart?: Chart;
  private polarChart?: Chart;
  private stackedChart?: Chart;
  private areaChart?: Chart;

  // Data properties
  employees: any[] = [];
  goals: any[] = [];
  reviews: any[] = [];
  skills: any[] = [];
  departments: any[] = [];
  loading = true;

  // Real-time properties
  isLive = false;
  selectedTheme: 'light' | 'dark' | 'brand' = 'light';
  
  // Export properties
  exportFormat = 'pdf';

  // Live data
  liveMetrics: any[] = [];
  liveActivities: any[] = [];
  performanceAlerts: any[] = [];

  constructor(
    private apiService: ApiService,
    private analyticsService: AnalyticsService,
    private chartService: ChartService,
    private realtimeService: RealtimeService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.setupRealtimeSubscriptions();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data loads
  }

  ngOnDestroy(): void {
    this.destroyAllCharts();
    this.realtimeService.stopLiveUpdates();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.apiService.getEmployees().toPromise(),
      this.apiService.getGoals().toPromise(),
      this.apiService.getReviews().toPromise(),
      this.apiService.getSkills().toPromise(),
      this.apiService.getDepartments().toPromise()
    ]).then(([employees, goals, reviews, skills, departments]) => {
      this.employees = employees || [];
      this.goals = goals || [];
      this.reviews = reviews || [];
      this.skills = skills || [];
      this.departments = departments || [];
      this.loading = false;
      this.generateCharts();
    }).catch(error => {
      console.error('Error loading data:', error);
      this.loading = false;
      this.snackBar.open('Error loading data', 'Close', { duration: 3000 });
    });
  }

  setupRealtimeSubscriptions(): void {
    this.realtimeService.liveMetrics$.subscribe(metrics => {
      this.liveMetrics = metrics;
    });

    this.realtimeService.liveActivities$.subscribe(activities => {
      this.liveActivities = activities;
    });

    this.realtimeService.performanceAlerts$.subscribe(alerts => {
      this.performanceAlerts = alerts;
    });
  }

  generateCharts(): void {
    this.destroyAllCharts();
    setTimeout(() => {
      this.createGoalChart();
      this.createPerformanceChart();
      this.createDepartmentChart();
      this.createEmployeeChart();
      this.createSkillChart();
      this.createTrendsChart();
      this.createBubbleChart();
      this.createScatterChart();
      this.createPolarChart();
      this.createStackedChart();
      this.createAreaChart();
    }, 100);
  }

  createGoalChart(): void {
    if (this.goalChartRef?.nativeElement) {
      const chartData = this.analyticsService.generateGoalCompletionChart(this.goals);
      this.goalChart = this.chartService.createGoalCompletionChart(
        this.goalChartRef.nativeElement,
        chartData
      );
    }
  }

  createPerformanceChart(): void {
    if (this.performanceChartRef?.nativeElement) {
      const chartData = this.analyticsService.generatePerformanceTrendChart(this.employees, this.reviews);
      this.performanceChart = this.chartService.createPerformanceTrendChart(
        this.performanceChartRef.nativeElement,
        chartData
      );
    }
  }

  createDepartmentChart(): void {
    if (this.departmentChartRef?.nativeElement) {
      const chartData = this.analyticsService.generateDepartmentComparisonChart(this.departments);
      this.departmentChart = this.chartService.createDepartmentComparisonChart(
        this.departmentChartRef.nativeElement,
        chartData
      );
    }
  }

  createEmployeeChart(): void {
    if (this.employeeChartRef?.nativeElement) {
      // Create sample employee performance data
      const employeeData = {
        labels: ['Goal Completion', 'Average Rating', 'Skill Coverage', 'Team Collaboration', 'Innovation'],
        datasets: [{
          label: 'Employee Performance',
          data: [85, 4.2, 78, 90, 75]
        }]
      };
      
      this.employeeChart = this.chartService.createEmployeePerformanceChart(
        this.employeeChartRef.nativeElement,
        employeeData
      );
    }
  }

  createSkillChart(): void {
    if (this.skillChartRef?.nativeElement) {
      // Create sample skill distribution data
      const skillData = {
        labels: ['JavaScript', 'Angular', 'C#', 'SQL', 'DevOps', 'UI/UX', 'Testing', 'Agile'],
        datasets: [{
          label: 'Skill Distribution',
          data: [25, 20, 18, 15, 12, 10, 8, 7]
        }]
      };
      
      this.skillChart = this.chartService.createSkillDistributionChart(
        this.skillChartRef.nativeElement,
        skillData
      );
    }
  }

  createTrendsChart(): void {
    if (this.trendsChartRef?.nativeElement) {
      // Create sample monthly trends data
      const trendsData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Goal Completion Rate',
            data: [65, 70, 75, 80, 85, 88]
          },
          {
            label: 'Average Rating',
            data: [3.8, 3.9, 4.0, 4.1, 4.2, 4.3]
          }
        ]
      };
      
      this.trendsChart = this.chartService.createMonthlyTrendsChart(
        this.trendsChartRef.nativeElement,
        trendsData
      );
    }
  }

  // NEW: Create bubble chart
  createBubbleChart(): void {
    if (this.bubbleChartRef?.nativeElement) {
      const chartData = this.generateBubbleChartData();
      this.bubbleChart = this.chartService.createEmployeeBubbleChart(
        this.bubbleChartRef.nativeElement,
        chartData
      );
    }
  }

  // NEW: Create scatter chart
  createScatterChart(): void {
    if (this.scatterChartRef?.nativeElement) {
      const chartData = this.generateScatterChartData();
      this.scatterChart = this.chartService.createSkillPerformanceScatterChart(
        this.scatterChartRef.nativeElement,
        chartData
      );
    }
  }

  // NEW: Create polar chart
  createPolarChart(): void {
    if (this.polarChartRef?.nativeElement) {
      const chartData = this.generatePolarChartData();
      this.polarChart = this.chartService.createDepartmentSkillsPolarChart(
        this.polarChartRef.nativeElement,
        chartData
      );
    }
  }

  // NEW: Create stacked chart
  createStackedChart(): void {
    if (this.stackedChartRef?.nativeElement) {
      const chartData = this.generateStackedChartData();
      this.stackedChart = this.chartService.createMonthlyPerformanceStackedChart(
        this.stackedChartRef.nativeElement,
        chartData
      );
    }
  }

  // NEW: Create area chart
  createAreaChart(): void {
    if (this.areaChartRef?.nativeElement) {
      const chartData = this.generateAreaChartData();
      this.areaChart = this.chartService.createCumulativePerformanceAreaChart(
        this.areaChartRef.nativeElement,
        chartData
      );
    }
  }

  // Generate bubble chart data
  private generateBubbleChartData(): any {
    const data = this.employees.slice(0, 10).map(emp => ({
      x: Math.floor(Math.random() * 10) + 1, // Goals completed
      y: Math.floor(Math.random() * 5) + 1,   // Average rating
      r: Math.floor(Math.random() * 10) + 5,  // Number of skills
      label: this.getEmployeeName(emp)
    }));

    return {
      datasets: [{
        data: data
      }]
    };
  }

  // Generate scatter chart data
  private generateScatterChartData(): any {
    const data = this.employees.slice(0, 15).map(emp => ({
      x: Math.floor(Math.random() * 100) + 1, // Skill level
      y: Math.floor(Math.random() * 5) + 1,   // Performance rating
      label: this.getEmployeeName(emp)
    }));

    return {
      datasets: [{
        data: data
      }]
    };
  }

  // Generate polar chart data
  private generatePolarChartData(): any {
    const skills = ['Leadership', 'Technical', 'Communication', 'Problem Solving', 'Teamwork', 'Innovation'];
    const data = skills.map(() => Math.floor(Math.random() * 100) + 20);

    return {
      labels: skills,
      datasets: [{
        data: data
      }]
    };
  }

  // Generate stacked chart data
  private generateStackedChartData(): any {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const excellent = months.map(() => Math.floor(Math.random() * 20) + 10);
    const good = months.map(() => Math.floor(Math.random() * 30) + 15);
    const average = months.map(() => Math.floor(Math.random() * 25) + 10);
    const belowAverage = months.map(() => Math.floor(Math.random() * 15) + 5);

    return {
      labels: months,
      datasets: [
        { data: excellent },
        { data: good },
        { data: average },
        { data: belowAverage }
      ]
    };
  }

  // Generate area chart data
  private generateAreaChartData(): any {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let cumulative = 0;
    const data = months.map(() => {
      cumulative += Math.floor(Math.random() * 20) + 10;
      return cumulative;
    });

    return {
      labels: months,
      datasets: [{
        data: data
      }]
    };
  }

  // Helper method to get employee name
  private getEmployeeName(employee: any): string {
    return employee.firstName && employee.lastName 
      ? `${employee.firstName} ${employee.lastName}`
      : employee.name || 'Unknown Employee';
  }

  // Toggle real-time updates
  toggleLiveUpdates(): void {
    if (this.isLive) {
      this.realtimeService.stopLiveUpdates();
      this.isLive = false;
    } else {
      this.realtimeService.startLiveUpdates();
      this.isLive = true;
    }
  }

  // Apply custom theme
  applyTheme(theme: 'light' | 'dark' | 'brand'): void {
    this.selectedTheme = theme;
    const charts = [
      this.goalChart, this.performanceChart, this.departmentChart,
      this.employeeChart, this.skillChart, this.trendsChart,
      this.bubbleChart, this.scatterChart, this.polarChart,
      this.stackedChart, this.areaChart
    ];

    charts.forEach(chart => {
      if (chart) {
        this.chartService.applyCustomTheme(chart, theme);
      }
    });

    this.snackBar.open(`Theme applied: ${theme}`, 'Close', { duration: 2000 });
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
    this.snackBar.open('Data refreshed', 'Close', { duration: 2000 });
  }

  // Export charts
  exportCharts(): void {
    const charts = [
      this.goalChart, this.performanceChart, this.departmentChart,
      this.employeeChart, this.skillChart, this.trendsChart,
      this.bubbleChart, this.scatterChart, this.polarChart,
      this.stackedChart, this.areaChart
    ];

    charts.forEach((chart, index) => {
      if (chart) {
        const canvas = chart.canvas;
        const link = document.createElement('a');
        link.download = `chart-${index + 1}.${this.exportFormat}`;
        
        if (this.exportFormat === 'png') {
          link.href = canvas.toDataURL('image/png');
          link.click();
        } else {
          // For PDF and Excel, show a message (would need additional libraries)
          this.snackBar.open(`${this.exportFormat.toUpperCase()} export not implemented yet`, 'Close', { duration: 3000 });
        }
      }
    });

    this.snackBar.open('Charts exported successfully', 'Close', { duration: 2000 });
  }

  // Destroy all charts
  destroyAllCharts(): void {
    const charts = [
      this.goalChart, this.performanceChart, this.departmentChart,
      this.employeeChart, this.skillChart, this.trendsChart,
      this.bubbleChart, this.scatterChart, this.polarChart,
      this.stackedChart, this.areaChart
    ];

    charts.forEach(chart => {
      if (chart) {
        this.chartService.destroyChart(chart);
      }
    });
  }
} 