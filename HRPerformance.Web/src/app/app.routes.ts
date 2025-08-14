import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { GoalsComponent } from './components/goals/goals.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { SkillsComponent } from './components/skills/skills.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { AdvancedAnalyticsComponent } from './components/analytics/advanced-analytics.component';
import { RealTimeAnalyticsComponent } from './components/analytics/real-time-analytics.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'employees', 
    component: EmployeesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Employee', 'Manager', 'HR Admin'] }
  },
  { 
    path: 'goals', 
    component: GoalsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Employee', 'Manager', 'HR Admin'] }
  },
  { 
    path: 'reviews', 
    component: ReviewsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Employee', 'Manager', 'HR Admin'] }
  },
  { 
    path: 'skills', 
    component: SkillsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Employee', 'Manager', 'HR Admin'] }
  },
  { 
    path: 'departments', 
    component: DepartmentsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Employee', 'Manager', 'HR Admin'] }
  },
  { 
    path: 'analytics', 
    component: AnalyticsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Manager', 'HR Admin'] }
  },
  { 
    path: 'advanced-analytics', 
    component: AdvancedAnalyticsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['HR Admin'] }
  },
  { 
    path: 'real-time-analytics', 
    component: RealTimeAnalyticsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['HR Admin'] }
  },
  { path: '**', redirectTo: '/login' }
];
