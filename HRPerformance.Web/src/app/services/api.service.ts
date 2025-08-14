import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Employee, Department, Goal, Skill, EmployeeSkill, Review } from '../models/employee';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token:', token); // Debug log
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'An error occurred'));
  }

  // Employee endpoints
  getEmployees(): Observable<Employee[]> {
    console.log('Fetching employees...'); // Debug log
    return this.http.get<Employee[]>(`${this.baseUrl}/Employees`, { headers: this.getHeaders() })
      .pipe(
        tap(data => console.log('Employees loaded:', data.length)),
        catchError(this.handleError)
      );
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/Employees/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/Employees`, employee, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/Employees/${id}`, employee, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Employees/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getEmployeeSubordinates(id: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/Employees/${id}/subordinates`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getEmployeeGoals(id: number): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}/Employees/${id}/goals`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getEmployeeSkills(id: number): Observable<EmployeeSkill[]> {
    return this.http.get<EmployeeSkill[]>(`${this.baseUrl}/Employees/${id}/skills`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Department endpoints
  getDepartments(): Observable<Department[]> {
    console.log('Fetching departments...'); // Debug log
    return this.http.get<Department[]>(`${this.baseUrl}/Departments`, { headers: this.getHeaders() })
      .pipe(
        tap(data => console.log('Departments loaded:', data.length)),
        catchError(this.handleError)
      );
  }

  getDepartment(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/Departments/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/Departments`, department, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/Departments/${id}`, department, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Departments/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getDepartmentEmployees(id: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/Departments/${id}/employees`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Goal endpoints
  getGoals(): Observable<Goal[]> {
    console.log('Fetching goals...'); // Debug log
    return this.http.get<Goal[]>(`${this.baseUrl}/Goals`, { headers: this.getHeaders() })
      .pipe(
        tap(data => console.log('Goals loaded:', data.length)),
        catchError(this.handleError)
      );
  }

  getGoal(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.baseUrl}/Goals/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createGoal(goal: Goal): Observable<Goal> {
    return this.http.post<Goal>(`${this.baseUrl}/Goals`, goal, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateGoal(id: number, goal: Goal): Observable<Goal> {
    return this.http.put<Goal>(`${this.baseUrl}/Goals/${id}`, goal, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }



  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Goals/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getGoalsByEmployee(employeeId: number): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}/Goals/employee/${employeeId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getGoalsByStatus(status: string): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}/Goals/status/${status}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Skill endpoints
  getSkills(): Observable<Skill[]> {
    console.log('Fetching skills...'); // Debug log
    return this.http.get<Skill[]>(`${this.baseUrl}/Skills`, { headers: this.getHeaders() })
      .pipe(
        tap(data => console.log('Skills loaded:', data.length)),
        catchError(this.handleError)
      );
  }

  getSkill(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.baseUrl}/Skills/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(`${this.baseUrl}/Skills`, skill, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSkill(id: number, skill: Skill): Observable<Skill> {
    return this.http.put<Skill>(`${this.baseUrl}/Skills/${id}`, skill, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteSkill(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Skills/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSkillEmployees(id: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/Skills/${id}/employees`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Review endpoints
  getReviews(): Observable<Review[]> {
    console.log('Fetching reviews...'); // Debug log
    return this.http.get<Review[]>(`${this.baseUrl}/Reviews`, { headers: this.getHeaders() })
      .pipe(
        tap(data => console.log('Reviews loaded:', data.length)),
        catchError(this.handleError)
      );
  }

  getReview(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/Reviews/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createReview(review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/Reviews`, review, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateReview(id: number, review: Review): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/Reviews/${id}`, review, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  patchReview(id: number, updates: Partial<Review>): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/Reviews/${id}`, updates, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Reviews/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getReviewsByCycle(cycleId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/Reviews/cycle/${cycleId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getReviewsByReviewee(revieweeId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/Reviews/reviewee/${revieweeId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getReviewsByReviewer(reviewerId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/Reviews/reviewer/${reviewerId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  lockReview(id: number): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/Reviews/${id}/lock`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  unlockReview(id: number): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/Reviews/${id}/unlock`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
}
