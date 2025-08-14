import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RoleService } from './role.service';
import { AuthService } from './auth.service';
import { UserProfile } from '../models/auth';

describe('RoleService', () => {
  let service: RoleService;
  let authService: jasmine.SpyObj<AuthService>;
  let currentUserSubject: BehaviorSubject<UserProfile | null>;

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser$: currentUserSubject.asObservable()
    });

    TestBed.configureTestingModule({
      providers: [
        RoleService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(RoleService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('hasRole', () => {
    it('should return false when no user is logged in', (done) => {
      service.hasRole('Employee').subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return true when user has the specified role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Manager',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.hasRole('Manager').subscribe(result => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false when user does not have the specified role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Employee',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.hasRole('Manager').subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return true when user has one of the specified roles', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Manager',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.hasRole(['Manager', 'HR Admin']).subscribe(result => {
        expect(result).toBeTrue();
        done();
      });
    });
  });

  describe('hasPermission', () => {
    it('should return false when no user is logged in', (done) => {
      service.hasPermission('employees', 'view').subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return true when user has permission for resource and action', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'HR Admin',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.hasPermission('employees', 'create').subscribe(result => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false when user does not have permission', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Employee',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.hasPermission('employees', 'create').subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });
  });

  describe('getCurrentUserRole', () => {
    it('should return null when no user is logged in', (done) => {
      service.getCurrentUserRole().subscribe(role => {
        expect(role).toBeNull();
        done();
      });
    });

    it('should return user role when user is logged in', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Manager',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.getCurrentUserRole().subscribe(role => {
        expect(role).toBe('Manager');
        done();
      });
    });
  });

  describe('canManageEmployees', () => {
    it('should return true for Manager role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Manager',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canManageEmployees().subscribe(result => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return true for HR Admin role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'HR Admin',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canManageEmployees().subscribe(result => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false for Employee role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Employee',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canManageEmployees().subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });
  });

  describe('canManageDepartments', () => {
    it('should return true only for HR Admin role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'HR Admin',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canManageDepartments().subscribe(result => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false for Manager role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Manager',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canManageDepartments().subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });
  });

  describe('canViewAnalytics', () => {
    it('should return true for Manager role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Manager',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canViewAnalytics().subscribe(result => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return true for HR Admin role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'HR Admin',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canViewAnalytics().subscribe(result => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false for Employee role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Employee',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canViewAnalytics().subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });
  });

  describe('canViewAdvancedAnalytics', () => {
    it('should return true only for HR Admin role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'HR Admin',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canViewAdvancedAnalytics().subscribe(result => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false for Manager role', (done) => {
      const user: UserProfile = {
        id: 1,
        username: 'testuser',
        role: 'Manager',
        employeeId: 1
      };
      currentUserSubject.next(user);

      service.canViewAdvancedAnalytics().subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });
  });
}); 