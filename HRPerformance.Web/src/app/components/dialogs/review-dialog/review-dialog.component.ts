import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../services/api.service';
import { Review, Employee } from '../../../models/employee';

export interface ReviewDialogData {
  review?: Review;
  employees: Employee[];
  isEdit: boolean;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './review-dialog.component.html',
  styleUrl: './review-dialog.component.scss'
})
export class ReviewDialogComponent implements OnInit {
  reviewForm!: FormGroup;
  employees: Employee[] = [];
  loading = false;
  ratingOptions = [1, 2, 3, 4, 5];

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewDialogData,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.employees = data.employees;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.reviewForm = this.fb.group({
      revieweeId: ['', Validators.required],
      reviewerId: ['', Validators.required],
      cycleId: [1, Validators.required], // Default to cycle 1
      templateId: [1, Validators.required], // Default to template 1
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      comments: ['', Validators.required],
      attachmentPath: ['']
    });

    if (this.data.review && this.data.isEdit) {
      console.log('Patching form with review data:', this.data.review); // Debug log
      this.reviewForm.patchValue({
        revieweeId: this.data.review.RevieweeId || this.data.review.revieweeId || '',
        reviewerId: this.data.review.ReviewerId || this.data.review.reviewerId || '',
        cycleId: this.data.review.CycleId || this.data.review.cycleId,
        templateId: this.data.review.TemplateId || this.data.review.templateId,
        rating: this.data.review.Rating || this.data.review.rating,
        comments: this.data.review.Comments || this.data.review.comments,
        attachmentPath: this.data.review.AttachmentPath || this.data.review.attachmentPath
      });
    }
  }

  onSubmit(): void {
    console.log('=== FORM SUBMISSION START ==='); // Debug log
    console.log('Form submitted, valid:', this.reviewForm.valid); // Debug log
    console.log('Form errors:', this.reviewForm.errors); // Debug log
    console.log('Form value:', this.reviewForm.value); // Debug log
    console.log('Is edit mode:', this.data.isEdit); // Debug log
    console.log('Review data:', this.data.review); // Debug log
    
    if (this.reviewForm.valid) {
      this.loading = true;
      const reviewData = this.reviewForm.value;
      console.log('Review data to send:', reviewData); // Debug log

      if (this.data.isEdit && this.data.review) {
        // Update existing review
        const reviewId = this.data.review.Id || this.data.review.id;
        console.log('Updating review with ID:', reviewId); // Debug log
        this.apiService.updateReview(reviewId, reviewData).subscribe({
          next: (updatedReview) => {
            console.log('API returned updated review:', updatedReview); // Debug log
            console.log('Closing dialog with result'); // Debug log
            this.loading = false;
            this.dialogRef.close(updatedReview);
          },
          error: (error) => {
            console.error('Error updating review:', error);
            this.loading = false;
            // Don't close dialog on error, let user try again
          }
        });
      } else {
        // Create new review
        this.apiService.createReview(reviewData).subscribe({
          next: (newReview) => {
            console.log('API returned new review:', newReview); // Debug log
            console.log('Closing dialog with result'); // Debug log
            this.loading = false;
            this.dialogRef.close(newReview);
          },
          error: (error) => {
            console.error('Error creating review:', error);
            this.loading = false;
            // Don't close dialog on error, let user try again
          }
        });
      }
    }
  }

  onCancel(): void {
    console.log('Dialog cancelled'); // Debug log
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.reviewForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('min') || field?.hasError('max')) {
      return 'Rating must be between 0 and 5';
    }
    return '';
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => (emp.Id || emp.id) === employeeId);
    if (!employee) return '';
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || '';
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
} 