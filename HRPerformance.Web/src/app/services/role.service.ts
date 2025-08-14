import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, map } from 'rxjs';

export interface Permission {
  resource: string;
  action: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private permissions: Permission[] = [
    // Employee permissions
    { resource: 'employees', action: 'view', roles: ['Employee', 'Manager', 'HR Admin'] },
    { resource: 'employees', action: 'edit', roles: ['Manager', 'HR Admin'] },
    { resource: 'employees', action: 'create', roles: ['HR Admin'] },
    { resource: 'employees', action: 'delete', roles: ['HR Admin'] },
    
    // Goals permissions
    { resource: 'goals', action: 'view', roles: ['Employee', 'Manager', 'HR Admin'] },
    { resource: 'goals', action: 'create', roles: ['Employee', 'Manager', 'HR Admin'] },
    { resource: 'goals', action: 'edit', roles: ['Employee', 'Manager', 'HR Admin'] },
    { resource: 'goals', action: 'delete', roles: ['HR Admin'] },
    
    // Reviews permissions
    { resource: 'reviews', action: 'view', roles: ['Employee', 'Manager', 'HR Admin'] },
    { resource: 'reviews', action: 'create', roles: ['Manager', 'HR Admin'] },
    { resource: 'reviews', action: 'edit', roles: ['Manager', 'HR Admin'] },
    { resource: 'reviews', action: 'delete', roles: ['HR Admin'] },
    
    // Skills permissions
    { resource: 'skills', action: 'view', roles: ['Employee', 'Manager', 'HR Admin'] },
    { resource: 'skills', action: 'edit', roles: ['Employee', 'Manager', 'HR Admin'] },
    { resource: 'skills', action: 'manage', roles: ['HR Admin'] },
    
    // Departments permissions
    { resource: 'departments', action: 'view', roles: ['Employee', 'Manager', 'HR Admin'] },
    { resource: 'departments', action: 'manage', roles: ['HR Admin'] },
    
    // Analytics permissions
    { resource: 'analytics', action: 'view', roles: ['Manager', 'HR Admin'] },
    { resource: 'analytics', action: 'advanced', roles: ['HR Admin'] }
  ];

  constructor(private authService: AuthService) {}

  hasPermission(resource: string, action: string): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        
        const permission = this.permissions.find(p => 
          p.resource === resource && p.action === action
        );
        
        return permission ? permission.roles.includes(user.role) : false;
      })
    );
  }

  hasRole(role: string | string[]): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        return user.role === role;
      })
    );
  }

  getCurrentUserRole(): Observable<string | null> {
    return this.authService.currentUser$.pipe(
      map(user => user?.role || null)
    );
  }

  canManageEmployees(): Observable<boolean> {
    return this.hasRole(['Manager', 'HR Admin']);
  }

  canManageDepartments(): Observable<boolean> {
    return this.hasRole('HR Admin');
  }

  canViewAnalytics(): Observable<boolean> {
    return this.hasRole(['Manager', 'HR Admin']);
  }

  canViewAdvancedAnalytics(): Observable<boolean> {
    return this.hasRole('HR Admin');
  }
} 