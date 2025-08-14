import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Goal } from '../../../models/employee';

export interface GoalProgressDialogData {
  goal: Goal;
}

@Component({
  selector: 'app-goal-progress-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './goal-progress-dialog.component.html',
  styleUrl: './goal-progress-dialog.component.scss'
})
export class GoalProgressDialogComponent {
  progressForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<GoalProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GoalProgressDialogData,
    private fb: FormBuilder
  ) {
    this.progressForm = this.fb.group({
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      notes: [this.data.goal.Notes || this.data.goal.notes || '']
    });
  }

  onSubmit(): void {
    if (this.progressForm.valid) {
      const formData = this.progressForm.value;
      this.dialogRef.close({
        progress: formData.progress,
        notes: formData.notes
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSliderChange(event: any): void {
    this.progressForm.patchValue({ progress: event.value });
  }
} 