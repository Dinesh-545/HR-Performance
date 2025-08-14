import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appRole]',
  standalone: true
})
export class RoleDirective implements OnInit {
  @Input() appRole: string | string[] = '';
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.updateView(user);
    });
  }

  private updateView(user: any) {
    if (!user) {
      this.viewContainer.clear();
      this.hasView = false;
      return;
    }

    const hasRole = this.checkRole(user.role);
    
    if (hasRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkRole(userRole: string): boolean {
    if (Array.isArray(this.appRole)) {
      return this.appRole.includes(userRole);
    }
    return this.appRole === userRole;
  }
} 