import { Injectable } from '@angular/core';
import { Employee, Goal, Review, Department, Skill } from '../models/employee';

export interface TrendData {
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    borderSkipped?: boolean;
    pointBorderWidth?: number;
    hoverBorderWidth?: number;
    pointBorderColor?: string;
    pointBackgroundColor?: string;
    pointRadius?: number;
    pointHoverRadius?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface PerformanceMetrics {
  overallScore: number;
  goalCompletionRate: number;
  averageRating: number;
  employeeSatisfaction: number;
  departmentEfficiency: number;
  skillGapIndex: number;
}

export interface DepartmentAnalytics {
  departmentId: number;
  departmentName: string;
  employeeCount: number;
  goalCompletionRate: number;
  averageRating: number;
  skillCoverage: number;
  performanceScore: number;
  trends: TrendData[];
}

export interface EmployeeAnalytics {
  employeeId: number;
  employeeName: string;
  department: string;
  goalCompletionRate: number;
  averageRating: number;
  skillCount: number;
  performanceTrend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor() { }

  // Advanced Performance Metrics
  calculatePerformanceMetrics(
    employees: Employee[],
    goals: Goal[],
    reviews: Review[],
    departments: Department[]
  ): PerformanceMetrics {
    const totalEmployees = employees.length;
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => (g.Status || g.status) === 'Completed').length;
    const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    const ratings = reviews.map(r => r.rating).filter(r => r > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    const employeeSatisfaction = this.calculateEmployeeSatisfaction(employees, reviews);
    const departmentEfficiency = this.calculateDepartmentEfficiency(departments, employees, goals);
    const skillGapIndex = this.calculateSkillGapIndex(employees, departments);

    const overallScore = (
      goalCompletionRate * 0.3 +
      averageRating * 20 + // Convert to percentage
      employeeSatisfaction * 0.2 +
      departmentEfficiency * 0.2 +
      (100 - skillGapIndex) * 0.1
    );

    return {
      overallScore: Math.round(overallScore),
      goalCompletionRate: Math.round(goalCompletionRate),
      averageRating: Math.round(averageRating * 10) / 10,
      employeeSatisfaction: Math.round(employeeSatisfaction),
      departmentEfficiency: Math.round(departmentEfficiency),
      skillGapIndex: Math.round(skillGapIndex)
    };
  }

  // Department Analytics
  generateDepartmentAnalytics(
    departments: Department[],
    employees: Employee[],
    goals: Goal[],
    reviews: Review[]
  ): DepartmentAnalytics[] {
    return departments.map(dept => {
      const deptEmployees = employees.filter(emp => 
        emp.DepartmentId === dept.id || emp.departmentId === dept.id
      );
      
      const deptGoals = goals.filter(goal => 
        deptEmployees.some(emp => (emp.Id || emp.id) === goal.EmployeeId)
      );
      
      const deptReviews = reviews.filter(review => 
        deptEmployees.some(emp => (emp.Id || emp.id) === (review.RevieweeId || review.revieweeId))
      );

      const goalCompletionRate = deptGoals.length > 0 
        ? (deptGoals.filter(g => (g.Status || g.status) === 'Completed').length / deptGoals.length) * 100 
        : 0;

      const ratings = deptReviews.map(r => r.rating).filter(r => r > 0);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      const skillCoverage = this.calculateSkillCoverage(deptEmployees);
      const performanceScore = this.calculateDepartmentPerformanceScore(
        goalCompletionRate,
        averageRating,
        skillCoverage,
        deptEmployees.length
      );

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        employeeCount: deptEmployees.length,
        goalCompletionRate: Math.round(goalCompletionRate),
        averageRating: Math.round(averageRating * 10) / 10,
        skillCoverage: Math.round(skillCoverage),
        performanceScore: Math.round(performanceScore),
        trends: this.generateTrendData(dept.id, goals, reviews)
      };
    });
  }

  // Employee Analytics
  generateEmployeeAnalytics(
    employees: Employee[],
    goals: Goal[],
    reviews: Review[],
    departments: Department[]
  ): EmployeeAnalytics[] {
    return employees.map(employee => {
      const employeeGoals = goals.filter(g => g.EmployeeId === employee.id);
      const employeeReviews = reviews.filter(r => r.revieweeId === employee.id);
      
      const goalCompletionRate = employeeGoals.length > 0 
        ? (employeeGoals.filter(g => (g.Status || g.status) === 'Completed').length / employeeGoals.length) * 100 
        : 0;

      const ratings = employeeReviews.map(r => r.rating).filter(r => r > 0);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      const department = departments.find(d => 
        (d.Id || d.id) === (employee.DepartmentId || employee.departmentId)
      );

      const performanceTrend = this.calculatePerformanceTrend(employee.id, reviews);
      const recommendations = this.generateEmployeeRecommendations(
        goalCompletionRate,
        averageRating,
        employeeGoals.length,
        employeeReviews.length
      );

      return {
        employeeId: employee.id,
        employeeName: `${employee.FirstName || employee.firstName || ''} ${employee.LastName || employee.lastName || ''}`.trim(),
        department: department?.name || 'Unknown',
        goalCompletionRate: Math.round(goalCompletionRate),
        averageRating: Math.round(averageRating * 10) / 10,
        skillCount: 0, // Would be calculated from skill data
        performanceTrend,
        recommendations
      };
    });
  }

  // Chart Data Generation
  generateGoalCompletionChart(goals: Goal[]): ChartData {
    const statusCounts = {
      'Not Started': goals.filter(g => (g.Status || g.status) === 'Not Started').length,
      'In Progress': goals.filter(g => (g.Status || g.status) === 'In Progress').length,
      'Completed': goals.filter(g => (g.Status || g.status) === 'Completed').length,
      'On Hold': goals.filter(g => (g.Status || g.status) === 'On Hold').length
    };

    return {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: 'Goals by Status',
        data: Object.values(statusCounts),
        backgroundColor: ['#ff6384', '#36a2eb', '#4bc0c0', '#ffcd56'],
        fill: false
      }]
    };
  }

  generatePerformanceTrendChart(employees: Employee[], reviews: Review[]): ChartData {
    const monthlyData = this.groupReviewsByMonth(reviews);
    
    return {
      labels: monthlyData.map(d => d.month),
      datasets: [{
        label: 'Average Rating',
        data: monthlyData.map(d => d.averageRating),
        borderColor: '#36a2eb',
        fill: false
      }]
    };
  }

  generateDepartmentComparisonChart(departmentAnalytics: DepartmentAnalytics[]): ChartData {
    return {
      labels: departmentAnalytics.map(d => d.departmentName),
      datasets: [
        {
          label: 'Performance Score',
          data: departmentAnalytics.map(d => d.performanceScore),
          backgroundColor: ['#4bc0c0'],
          fill: false
        },
        {
          label: 'Goal Completion Rate',
          data: departmentAnalytics.map(d => d.goalCompletionRate),
          backgroundColor: ['#ff6384'],
          fill: false
        }
      ]
    };
  }

  // Trend Analysis
  generateTrendData(departmentId: number, goals: Goal[], reviews: Review[]): TrendData[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends: TrendData[] = [];

    months.forEach((month, index) => {
      const monthGoals = goals.filter(g => {
        const goalDate = new Date(g.StartDate || g.startDate || '');
        return goalDate.getMonth() === index;
      });

      const monthReviews = reviews.filter(r => {
        // Simplified logic - in real app would use actual review dates
        return Math.random() > 0.5; // Simulate data
      });

              const completionRate = monthGoals.length > 0 
          ? (monthGoals.filter(g => (g.Status || g.status) === 'Completed').length / monthGoals.length) * 100 
          : 0;

      const ratings = monthReviews.map(r => r.rating).filter(r => r > 0);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      trends.push({
        period: month,
        value: Math.round(completionRate),
        change: Math.round((Math.random() - 0.5) * 20), // Simulate change
        trend: completionRate > 70 ? 'up' : completionRate < 50 ? 'down' : 'stable'
      });
    });

    return trends;
  }

  // Export Functions
  exportAnalyticsData(
    employees: Employee[],
    goals: Goal[],
    reviews: Review[],
    departments: Department[]
  ): string {
    const data = {
      timestamp: new Date().toISOString(),
      summary: this.calculatePerformanceMetrics(employees, goals, reviews, departments),
      departments: this.generateDepartmentAnalytics(departments, employees, goals, reviews),
      employees: this.generateEmployeeAnalytics(employees, goals, reviews, departments),
      goals: goals,
      reviews: reviews
    };

    return JSON.stringify(data, null, 2);
  }

  // Generate monthly trends chart data
  generateMonthlyTrendsChart(employees: any[], reviews: any[]): ChartData {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const goalCompletionData = months.map(() => Math.floor(Math.random() * 30) + 60);
    const avgRatingData = months.map(() => (Math.floor(Math.random() * 10) + 35) / 10);

    return {
      labels: months,
      datasets: [
        {
          label: 'Goal Completion Rate',
          data: goalCompletionData,
          borderColor: '#4caf50',
          backgroundColor: ['rgba(76, 175, 80, 0.1)'],
          borderWidth: 3,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Average Rating',
          data: avgRatingData,
          borderColor: '#ff9800',
          backgroundColor: ['rgba(255, 152, 0, 0.1)'],
          borderWidth: 3,
          fill: false,
          tension: 0.4
        }
      ]
    };
  }

  // NEW: Generate bubble chart data for employee performance analysis
  generateEmployeeBubbleChartData(employees: any[]): any {
    const data = employees.slice(0, 15).map(emp => ({
      x: Math.floor(Math.random() * 15) + 1, // Goals completed
      y: Math.floor(Math.random() * 5) + 1,   // Average rating
      r: Math.floor(Math.random() * 15) + 5,  // Number of skills
      label: this.getEmployeeName(emp)
    }));

    return {
      datasets: [{
        label: 'Employee Performance',
        data: data,
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: '#2196f3',
        borderWidth: 1
      }]
    };
  }

  // NEW: Generate scatter chart data for skill vs performance correlation
  generateSkillPerformanceScatterData(employees: any[]): any {
    const data = employees.slice(0, 20).map(emp => ({
      x: Math.floor(Math.random() * 100) + 1, // Skill level
      y: Math.floor(Math.random() * 5) + 1,   // Performance rating
      label: this.getEmployeeName(emp)
    }));

    return {
      datasets: [{
        label: 'Skill vs Performance',
        data: data,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: '#ff6384',
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 10
      }]
    };
  }

  // NEW: Generate polar chart data for department skills overview
  generateDepartmentSkillsPolarData(): any {
    const skills = ['Leadership', 'Technical', 'Communication', 'Problem Solving', 'Teamwork', 'Innovation'];
    const data = skills.map(() => Math.floor(Math.random() * 100) + 20);

    return {
      labels: skills,
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          '#ff6384',
          '#36a2eb',
          '#ffce56',
          '#4bc0c0',
          '#9966ff',
          '#ff9f40'
        ],
        borderWidth: 2
      }]
    };
  }

  // NEW: Generate stacked chart data for monthly performance distribution
  generateMonthlyPerformanceStackedData(): any {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const excellent = months.map(() => Math.floor(Math.random() * 20) + 10);
    const good = months.map(() => Math.floor(Math.random() * 30) + 15);
    const average = months.map(() => Math.floor(Math.random() * 25) + 10);
    const belowAverage = months.map(() => Math.floor(Math.random() * 15) + 5);

    return {
      labels: months,
      datasets: [
        {
          label: 'Excellent',
          data: excellent,
          backgroundColor: '#4caf50',
          stack: 'Stack 0'
        },
        {
          label: 'Good',
          data: good,
          backgroundColor: '#2196f3',
          stack: 'Stack 0'
        },
        {
          label: 'Average',
          data: average,
          backgroundColor: '#ff9800',
          stack: 'Stack 0'
        },
        {
          label: 'Below Average',
          data: belowAverage,
          backgroundColor: '#f44336',
          stack: 'Stack 0'
        }
      ]
    };
  }

  // NEW: Generate area chart data for cumulative performance
  generateCumulativePerformanceAreaData(): any {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let cumulative = 0;
    const data = months.map(() => {
      cumulative += Math.floor(Math.random() * 20) + 10;
      return cumulative;
    });

    return {
      labels: months,
      datasets: [{
        label: 'Cumulative Performance',
        data: data,
        borderColor: '#9c27b0',
        backgroundColor: 'rgba(156, 39, 176, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };
  }

  // Helper Methods
  private calculateEmployeeSatisfaction(employees: Employee[], reviews: Review[]): number {
    const ratings = reviews.map(r => r.rating).filter(r => r > 0);
    if (ratings.length === 0) return 70; // Default value
    
    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Math.min(100, averageRating * 20); // Convert to percentage
  }

  private calculateDepartmentEfficiency(departments: Department[], employees: Employee[], goals: Goal[]): number {
    if (departments.length === 0) return 70;

    const departmentScores = departments.map(dept => {
      const deptEmployees = employees.filter(emp => 
        emp.DepartmentId === dept.id || emp.departmentId === dept.id
      );
      const deptGoals = goals.filter(goal => 
        deptEmployees.some(emp => (emp.Id || emp.id) === goal.EmployeeId)
      );
      
      return deptGoals.length > 0 
        ? (deptGoals.filter(g => g.Status === 'Completed').length / deptGoals.length) * 100 
        : 70;
    });

    return departmentScores.reduce((a, b) => a + b, 0) / departmentScores.length;
  }

  private calculateSkillGapIndex(employees: Employee[], departments: Department[]): number {
    // Simplified calculation - in real app would use actual skill data
    const totalEmployees = employees.length;
    const totalDepartments = departments.length;
    
    if (totalEmployees === 0 || totalDepartments === 0) return 30;
    
    // Simulate skill gap calculation
    return Math.max(0, Math.min(100, 30 + (totalDepartments * 5) - (totalEmployees * 2)));
  }

  private calculateSkillCoverage(employees: Employee[]): number {
    // Simplified calculation
    return Math.min(100, employees.length * 15);
  }

  private calculateDepartmentPerformanceScore(
    goalCompletionRate: number,
    averageRating: number,
    skillCoverage: number,
    employeeCount: number
  ): number {
    const employeeFactor = Math.min(100, employeeCount * 10);
    
    return (
      goalCompletionRate * 0.4 +
      averageRating * 10 + // Convert to percentage
      skillCoverage * 0.3 +
      employeeFactor * 0.1
    );
  }

  private calculatePerformanceTrend(employeeId: number, reviews: Review[]): 'improving' | 'declining' | 'stable' {
    const employeeReviews = reviews.filter(r => r.revieweeId === employeeId);
    if (employeeReviews.length < 2) return 'stable';
    
    // Simplified trend calculation
    const recentRating = employeeReviews[employeeReviews.length - 1]?.rating || 0;
    const previousRating = employeeReviews[employeeReviews.length - 2]?.rating || 0;
    
    if (recentRating > previousRating + 0.5) return 'improving';
    if (recentRating < previousRating - 0.5) return 'declining';
    return 'stable';
  }

  private generateEmployeeRecommendations(
    goalCompletionRate: number,
    averageRating: number,
    goalCount: number,
    reviewCount: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (goalCompletionRate < 70) {
      recommendations.push('Focus on goal completion and time management');
    }
    
    if (averageRating < 3.5) {
      recommendations.push('Seek feedback and improve performance areas');
    }
    
    if (goalCount < 3) {
      recommendations.push('Set more challenging goals to drive growth');
    }
    
    if (reviewCount < 2) {
      recommendations.push('Request more frequent performance feedback');
    }
    
    return recommendations;
  }

  private groupReviewsByMonth(reviews: Review[]): { month: string; averageRating: number }[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      averageRating: 3.5 + Math.random() * 1.5 // Simulate data
    }));
  }

  // Helper method to get employee name
  private getEmployeeName(employee: any): string {
    if (employee.firstName && employee.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    } else if (employee.FirstName && employee.LastName) {
      return `${employee.FirstName} ${employee.LastName}`;
    } else if (employee.name) {
      return employee.name;
    }
    return 'Unknown Employee';
  }
} 