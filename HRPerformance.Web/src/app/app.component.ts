import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from './services/auth.service';
import { RoleService } from './services/role.service';
import { RoleDirective } from './directives/role.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    RoleDirective
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  getCurrentUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role || 'Unknown';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
