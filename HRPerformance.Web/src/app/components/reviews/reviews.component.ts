import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatOptionModule } from '@angular/material/core';
import { ApiService } from '../../services/api.service';
import { Employee, Review } from '../../models/employee';
import { ReviewDialogComponent } from '../dialogs/review-dialog/review-dialog.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  reviews$ = this.reviewsSubject.asObservable();
  
  reviews: Review[] = [];
  employees: Employee[] = [];
  filteredReviews: Review[] = [];
  loading = true;
  searchTerm = '';
  selectedEmployee = '';
  selectedRating = '';
  selectedTab = 0;

  displayedColumns: string[] = ['id', 'reviewee', 'reviewer', 'rating', 'cycle', 'template', 'status', 'actions'];

  ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '1', label: '1 - Poor' },
    { value: '2', label: '2 - Below Average' },
    { value: '3', label: '3 - Average' },
    { value: '4', label: '4 - Good' },
    { value: '5', label: '5 - Excellent' }
  ];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    this.loadEmployees();
    
    // Subscribe to reviews changes
    this.reviews$.pipe(takeUntil(this.destroy$)).subscribe(reviews => {
      console.log('Reviews subject updated:', reviews.length, 'reviews'); // Debug log
      console.log('Reviews data in subscription:', reviews); // Debug log
      this.reviews = reviews;
      this.filterReviews();
      this.cdr.detectChanges();
      console.log('Change detection triggered for reviews'); // Debug log
      console.log('Filtered reviews count:', this.filteredReviews.length); // Debug log
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    this.loading = true;
    console.log('Loading reviews...'); // Debug log
    this.apiService.getReviews().subscribe({
      next: (reviews) => {
        console.log('Reviews loaded successfully:', reviews.length); // Debug log
        console.log('Reviews data:', reviews); // Debug log
        this.reviewsSubject.next(reviews); // Update the subject
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loading = false;
        // You could add a snackbar notification here
      }
    });
  }

  loadEmployees(): void {
    console.log('Loading employees for reviews...'); // Debug log
    this.apiService.getEmployees().subscribe({
      next: (employees) => {
        console.log('Employees loaded for reviews:', employees.length); // Debug log
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees for reviews:', error);
      }
    });
  }

  filterReviews(): void {
    this.filteredReviews = this.reviews.filter(review => {
      const matchesSearch = !this.searchTerm || 
        this.getEmployeeName(review.RevieweeId || review.revieweeId)?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getEmployeeName(review.ReviewerId || review.reviewerId)?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesEmployee = !this.selectedEmployee || 
        (review.RevieweeId || review.revieweeId)?.toString() === this.selectedEmployee;
      
      const matchesRating = !this.selectedRating || 
        (review.Rating || review.rating).toString() === this.selectedRating;
      
      return matchesSearch && matchesEmployee && matchesRating;
    });
  }

  getEmployeeName(employeeId?: number): string {
    if (!employeeId) return 'Unknown';
    const employee = this.employees.find(emp => (emp.Id || emp.id) === employeeId);
    if (!employee) return 'Unknown';
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  }

  getEmployeeRole(employee: Employee): string {
    return employee.Role || employee.role || 'N/A';
  }

  getRatingColor(rating: number): string {
    if (rating >= 4) return 'primary';
    if (rating >= 3) return 'accent';
    return 'warn';
  }

  getRatingText(rating: number): string {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Below Average';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Not Rated';
    }
  }

  getReviewStatus(review: Review): string {
    if (review.IsLocked || review.isLocked) return 'Locked';
    if ((review.Rating || review.rating) > 0) return 'Completed';
    return 'Pending';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'primary';
      case 'Pending': return 'accent';
      case 'Locked': return 'warn';
      default: return 'basic';
    }
  }

  onSearchChange(): void {
    this.filterReviews();
  }

  onEmployeeChange(): void {
    this.filterReviews();
  }

  onRatingChange(): void {
    this.filterReviews();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedEmployee = '';
    this.selectedRating = '';
    this.filterReviews();
  }

  getReviewsByStatus(status: string): number {
    return this.reviews.filter(review => this.getReviewStatus(review) === status).length;
  }

  getAverageRating(): number {
    const ratedReviews = this.reviews.filter(review => (review.Rating || review.rating) > 0);
    if (ratedReviews.length === 0) return 0;
    const totalRating = ratedReviews.reduce((sum, review) => sum + (review.Rating || review.rating), 0);
    return Math.round((totalRating / ratedReviews.length) * 10) / 10;
  }

  getTotalReviews(): number {
    return this.reviews.length;
  }

  getCompletedReviews(): number {
    return this.reviews.filter(review => (review.Rating || review.rating) > 0).length;
  }

  getPendingReviews(): number {
    return this.reviews.filter(review => (review.Rating || review.rating) === 0 && !(review.IsLocked || review.isLocked)).length;
  }

  onTabChange(): void {
    // Handle tab changes if needed
    console.log('Tab changed to:', this.selectedTab);
  }

  openAddReviewDialog(): void {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '600px',
      data: {
        employees: this.employees,
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add the new review to the current list
        const currentReviews = this.reviewsSubject.value;
        this.reviewsSubject.next([result, ...currentReviews]);
        this.showSnackBar('Review added successfully', 'success');
      }
    });
  }

  openEditReviewDialog(review: Review): void {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '600px',
      data: {
        review: review,
        employees: this.employees,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result); // Debug log
      if (result) {
        console.log('Edit dialog result:', result); // Debug log
        // Update the review in the current list
        const currentReviews = this.reviewsSubject.value;
        console.log('Current reviews before update:', currentReviews.length); // Debug log
        const resultId = result.Id || result.id;
        const index = currentReviews.findIndex(r => (r.Id || r.id) === resultId);
        console.log('Found review at index:', index); // Debug log
        if (index !== -1) {
          console.log('Updating review at index:', index); // Debug log
          currentReviews[index] = result;
          this.reviewsSubject.next([...currentReviews]);
          console.log('Review updated in subject'); // Debug log
          
          // Force a complete reload after a short delay to ensure data consistency
          setTimeout(() => {
            console.log('Forcing reload after update'); // Debug log
            this.loadReviews();
          }, 100);
        } else {
          console.log('Review not found, reloading all reviews'); // Debug log
          // If not found, reload all reviews
          this.loadReviews();
        }
        this.showSnackBar('Review updated successfully', 'success');
      } else {
        console.log('Dialog returned null/undefined result'); // Debug log
        // If dialog returns null, force a reload to ensure data consistency
        this.loadReviews();
      }
    });
  }

  deleteReview(review: Review): void {
    if (confirm(`Are you sure you want to delete this review?`)) {
      const reviewId = review.Id || review.id;
      console.log('Deleting review with ID:', reviewId); // Debug log
      this.apiService.deleteReview(reviewId).subscribe({
        next: () => {
          // Remove the review from the current list
          const currentReviews = this.reviewsSubject.value;
          console.log('Current reviews before delete:', currentReviews.length); // Debug log
          const filteredReviews = currentReviews.filter(r => (r.Id || r.id) !== reviewId);
          console.log('Reviews after delete:', filteredReviews.length); // Debug log
          this.reviewsSubject.next(filteredReviews);
          this.showSnackBar('Review deleted successfully', 'success');
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          this.showSnackBar('Error deleting review', 'error');
        }
      });
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}
