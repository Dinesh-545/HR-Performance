import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginData: LoginRequest = {
    username: '',
    password: ''
  };
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Login failed: ' + (error.error || 'Invalid credentials'), 'Close', { duration: 5000 });
      }
    });
  }
} 