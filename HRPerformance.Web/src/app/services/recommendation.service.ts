import { Injectable } from '@angular/core';
import { Employee, Goal, Review, Department } from '../models/employee';

export interface Recommendation {
  id: string;
  type: 'performance' | 'goal' | 'skill' | 'review' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  impact: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  constructor() { }

  generateRecommendations(
    employees: Employee[],
    goals: Goal[],
    reviews: Review[],
    departments: Department[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Performance-based recommendations
    recommendations.push(...this.generatePerformanceRecommendations(employees, reviews));
    
    // Goal-based recommendations
    recommendations.push(...this.generateGoalRecommendations(goals, employees));
    
    // Skill-based recommendations
    recommendations.push(...this.generateSkillRecommendations(employees, departments));
    
    // Review-based recommendations
    recommendations.push(...this.generateReviewRecommendations(reviews, employees));
    
    // General recommendations
    recommendations.push(...this.generateGeneralRecommendations(employees, goals, reviews));

    return recommendations.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
  }

  private generatePerformanceRecommendations(employees: Employee[], reviews: Review[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Identify low performers
    const lowPerformers = this.identifyLowPerformers(employees, reviews);
    if (lowPerformers.length > 0) {
      recommendations.push({
        id: 'perf-001',
        type: 'performance',
        priority: 'high',
        title: 'Support Low Performers',
        description: `${lowPerformers.length} employees are showing below-average performance. Consider providing additional support and development opportunities.`,
        actionItems: [
          'Schedule one-on-one meetings with low performers',
          'Create personalized development plans',
          'Provide additional training resources',
          'Set up mentoring programs'
        ],
        impact: 'Improve overall team performance and employee retention',
        category: 'Performance Management'
      });
    }

    // Identify high performers for recognition
    const highPerformers = this.identifyHighPerformers(employees, reviews);
    if (highPerformers.length > 0) {
      recommendations.push({
        id: 'perf-002',
        type: 'performance',
        priority: 'medium',
        title: 'Recognize Top Performers',
        description: `${highPerformers.length} employees are consistently exceeding expectations. Consider recognition and advancement opportunities.`,
        actionItems: [
          'Implement recognition programs',
          'Consider promotions or role expansions',
          'Provide leadership development opportunities',
          'Share best practices across teams'
        ],
        impact: 'Boost morale and retain top talent',
        category: 'Employee Recognition'
      });
    }

    return recommendations;
  }

  private generateGoalRecommendations(goals: Goal[], employees: Employee[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const completedGoals = goals.filter(g => (g.Status || g.status) === 'Completed').length;
    const totalGoals = goals.length;
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    if (completionRate < 70) {
      recommendations.push({
        id: 'goal-001',
        type: 'goal',
        priority: 'high',
        title: 'Improve Goal Completion Rate',
        description: `Goal completion rate is ${completionRate.toFixed(1)}%, below the target of 70%. Focus on goal management and support.`,
        actionItems: [
          'Implement regular goal check-ins',
          'Provide resources and support for goal achievement',
          'Break down complex goals into smaller milestones',
          'Offer training on goal setting and time management'
        ],
        impact: 'Increase productivity and employee satisfaction',
        category: 'Goal Management'
      });
    }

    // Identify overdue goals
    const overdueGoals = goals.filter(g => 
      (g.Status || g.status) !== 'Completed' && 
      new Date(g.EndDate || g.endDate || '') < new Date()
    );

    if (overdueGoals.length > 0) {
      recommendations.push({
        id: 'goal-002',
        type: 'goal',
        priority: 'high',
        title: 'Address Overdue Goals',
        description: `${overdueGoals.length} goals are past their due date. Review and update these goals.`,
        actionItems: [
          'Review overdue goals with employees',
          'Update goal timelines where appropriate',
          'Provide additional support for challenging goals',
          'Consider goal reprioritization'
        ],
        impact: 'Maintain goal accountability and progress tracking',
        category: 'Goal Management'
      });
    }

    return recommendations;
  }

  private generateSkillRecommendations(employees: Employee[], departments: Department[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Identify skill gaps by department
    const skillGaps = this.identifySkillGaps(employees, departments);
    
    if (skillGaps.length > 0) {
      recommendations.push({
        id: 'skill-001',
        type: 'skill',
        priority: 'medium',
        title: 'Address Skill Gaps',
        description: `Identified skill gaps in ${skillGaps.length} departments. Consider training and development initiatives.`,
        actionItems: [
          'Develop department-specific training programs',
          'Partner with external training providers',
          'Implement skill assessment tools',
          'Create internal knowledge sharing programs'
        ],
        impact: 'Improve team capabilities and project success rates',
        category: 'Learning & Development'
      });
    }

    return recommendations;
  }

  private generateReviewRecommendations(reviews: Review[], employees: Employee[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const pendingReviews = reviews.filter(r => !r.isLocked).length;
    const totalEmployees = employees.length;

    if (pendingReviews > totalEmployees * 0.3) {
      recommendations.push({
        id: 'review-001',
        type: 'review',
        priority: 'high',
        title: 'Complete Pending Reviews',
        description: `${pendingReviews} reviews are pending completion. Schedule review sessions and send reminders.`,
        actionItems: [
          'Send review completion reminders',
          'Schedule dedicated review sessions',
          'Provide review training for managers',
          'Set up automated review reminders'
        ],
        impact: 'Ensure timely feedback and performance management',
        category: 'Performance Reviews'
      });
    }

    return recommendations;
  }

  private generateGeneralRecommendations(employees: Employee[], goals: Goal[], reviews: Review[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Employee engagement recommendations
    const activeEmployees = employees.filter(e => e.Role !== 'Inactive').length;
    const totalEmployees = employees.length;
    const engagementRate = totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0;

    if (engagementRate < 90) {
      recommendations.push({
        id: 'gen-001',
        type: 'general',
        priority: 'medium',
        title: 'Improve Employee Engagement',
        description: `Employee engagement rate is ${engagementRate.toFixed(1)}%. Focus on improving workplace satisfaction.`,
        actionItems: [
          'Conduct employee satisfaction surveys',
          'Implement team building activities',
          'Improve communication channels',
          'Recognize employee achievements'
        ],
        impact: 'Increase retention and productivity',
        category: 'Employee Engagement'
      });
    }

    return recommendations;
  }

  private identifyLowPerformers(employees: Employee[], reviews: Review[]): Employee[] {
    const employeeRatings = new Map<number, { total: number, count: number }>();
    
    reviews.forEach(review => {
      const revieweeId = review.RevieweeId || review.revieweeId;
      const rating = review.Rating || review.rating;
      if (revieweeId && rating && rating > 0) {
        const current = employeeRatings.get(revieweeId) || { total: 0, count: 0 };
        current.total += rating;
        current.count += 1;
        employeeRatings.set(revieweeId, current);
      }
    });

    const lowPerformers = Array.from(employeeRatings.entries())
      .filter(([_, rating]) => rating.count >= 2) // At least 2 reviews
      .map(([employeeId, rating]) => ({
        employee: employees.find(e => (e.Id || e.id) === employeeId),
        averageRating: rating.total / rating.count
      }))
      .filter(item => item.employee && item.averageRating < 3.0)
      .map(item => item.employee!);

    return lowPerformers;
  }

  private identifyHighPerformers(employees: Employee[], reviews: Review[]): Employee[] {
    const employeeRatings = new Map<number, { total: number, count: number }>();
    
    reviews.forEach(review => {
      const revieweeId = review.RevieweeId || review.revieweeId;
      const rating = review.Rating || review.rating;
      if (revieweeId && rating && rating > 0) {
        const current = employeeRatings.get(revieweeId) || { total: 0, count: 0 };
        current.total += rating;
        current.count += 1;
        employeeRatings.set(revieweeId, current);
      }
    });

    const highPerformers = Array.from(employeeRatings.entries())
      .filter(([_, rating]) => rating.count >= 2) // At least 2 reviews
      .map(([employeeId, rating]) => ({
        employee: employees.find(e => (e.Id || e.id) === employeeId),
        averageRating: rating.total / rating.count
      }))
      .filter(item => item.employee && item.averageRating >= 4.5)
      .map(item => item.employee!);

    return highPerformers;
  }

  private identifySkillGaps(employees: Employee[], departments: Department[]): any[] {
    // This is a simplified implementation
    // In a real application, you would have skill data and requirements
    const gaps: any[] = [];
    
    departments.forEach(dept => {
      const deptEmployees = employees.filter(emp => 
        emp.DepartmentId === dept.id || emp.departmentId === dept.id
      );
      
      if (deptEmployees.length < 3) {
        gaps.push({
          department: dept,
          issue: 'Understaffed',
          priority: 'high'
        });
      }
    });
    
    return gaps;
  }

  private getPriorityScore(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
} 