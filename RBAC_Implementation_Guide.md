# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document outlines the comprehensive Role-Based Access Control (RBAC) implementation for the HR Performance Management System. The system supports three distinct roles with specific permissions and access levels.

## Role Definitions

### 1. Employee
**Description**: Regular employees who can manage their own performance data
**Permissions**:
- View own employee profile
- Create, edit, and view own goals
- View own performance reviews
- Manage own skills and ratings
- View department information

### 2. Manager
**Description**: Team leaders who can manage their subordinates
**Permissions**:
- All Employee permissions
- View and manage subordinate employee profiles
- Create and conduct performance reviews for subordinates
- View team analytics and reports
- Manage goals for team members

### 3. HR Admin
**Description**: Human Resources administrators with full system access
**Permissions**:
- All Manager permissions
- Full employee management (create, edit, delete)
- Department management
- Advanced analytics and reporting
- System-wide review management
- Skills and competencies management

## Implementation Details

### Backend Implementation

#### 1. Custom Authorization Attribute
```csharp
[AuthorizeRoles(RoleConstants.Manager, RoleConstants.HRAdmin)]
public async Task<IActionResult> CreateReview(Review review)
{
    // Implementation
}
```

#### 2. Authorization Service
The `AuthorizationService` provides centralized business logic for:
- Employee access control
- Review permissions
- Analytics access
- Department management

#### 3. Role Constants
```csharp
public static class RoleConstants
{
    public const string Employee = "Employee";
    public const string Manager = "Manager";
    public const string HRAdmin = "HR Admin";
    
    public static readonly string[] AllRoles = { Employee, Manager, HRAdmin };
    public static readonly string[] ManagementRoles = { Manager, HRAdmin };
    public static readonly string[] AdminOnly = { HRAdmin };
}
```

### Frontend Implementation

#### 1. Role Guard
Protects routes based on user roles:
```typescript
{
  path: 'analytics',
  component: AnalyticsComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['Manager', 'HR Admin'] }
}
```

#### 2. Role Directive
Conditionally shows/hides UI elements:
```html
<button *appRole="['Manager', 'HR Admin']">Create Review</button>
```

#### 3. Role Service
Centralized permission checking:
```typescript
this.roleService.hasPermission('employees', 'create').subscribe(canCreate => {
  // Handle permission
});
```

## Permission Matrix

| Resource | Action | Employee | Manager | HR Admin |
|----------|--------|----------|---------|----------|
| Employees | View | Own only | Team + Own | All |
| Employees | Edit | Own only | Team + Own | All |
| Employees | Create | ❌ | ❌ | ✅ |
| Employees | Delete | ❌ | ❌ | ✅ |
| Goals | View | Own only | Team + Own | All |
| Goals | Create | Own only | Team + Own | All |
| Goals | Edit | Own only | Team + Own | All |
| Goals | Delete | ❌ | ❌ | ✅ |
| Reviews | View | Own only | Team + Own | All |
| Reviews | Create | ❌ | Team | All |
| Reviews | Edit | ❌ | Team | All |
| Reviews | Delete | ❌ | ❌ | ✅ |
| Skills | View | Own only | Team + Own | All |
| Skills | Edit | Own only | Team + Own | All |
| Skills | Manage | ❌ | ❌ | ✅ |
| Departments | View | All | All | All |
| Departments | Manage | ❌ | ❌ | ✅ |
| Analytics | View | ❌ | ✅ | ✅ |
| Analytics | Advanced | ❌ | ❌ | ✅ |

## Security Best Practices

### 1. Defense in Depth
- JWT token validation
- Role-based route protection
- UI element visibility control
- Backend authorization checks
- Database-level filtering

### 2. Principle of Least Privilege
- Users only have access to data they need
- Role-based data filtering
- Granular permission system

### 3. Secure Token Management
- JWT tokens with role claims
- Token expiration (8 hours)
- Secure token storage in localStorage

### 4. Input Validation
- Server-side validation for all requests
- Role-based input sanitization
- SQL injection prevention through Entity Framework

## Usage Examples

### Backend Controller Example
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IAuthorizationService _authService;
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");
        var accessibleIds = await _authService.GetAccessibleEmployeeIdsAsync(userId);
        
        return await _context.Employees
            .Where(e => accessibleIds.Contains(e.Id))
            .Include(e => e.Department)
            .Include(e => e.Manager)
            .ToListAsync();
    }
}
```

### Frontend Component Example
```typescript
export class EmployeesComponent {
  canCreateEmployee$ = this.roleService.hasPermission('employees', 'create');
  canDeleteEmployee$ = this.roleService.hasPermission('employees', 'delete');
  
  constructor(private roleService: RoleService) {}
}
```

```html
<button mat-raised-button 
        color="primary" 
        *ngIf="canCreateEmployee$ | async"
        (click)="createEmployee()">
  Add Employee
</button>
```

## Testing RBAC

### Unit Tests
```csharp
[Test]
public async Task Manager_CanAccessSubordinate_ReturnsTrue()
{
    // Arrange
    var managerId = 1;
    var subordinateId = 2;
    
    // Act
    var result = await _authService.CanAccessEmployeeAsync(managerId, subordinateId);
    
    // Assert
    Assert.IsTrue(result);
}
```

### Integration Tests
```csharp
[Test]
public async Task Employee_AccessingOtherEmployee_ReturnsForbidden()
{
    // Arrange
    var client = _factory.CreateClient();
    var token = await GetEmployeeToken(client);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    
    // Act
    var response = await client.GetAsync("/api/employees/999");
    
    // Assert
    Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
}
```

## Monitoring and Auditing

### 1. Access Logging
- Log all authentication attempts
- Track role-based access patterns
- Monitor failed authorization attempts

### 2. Security Metrics
- Failed login attempts
- Unauthorized access attempts
- Role escalation attempts

### 3. Audit Trail
- User actions with timestamps
- Data modifications
- Role changes

## Future Enhancements

### 1. Dynamic Permissions
- Database-driven permission system
- Custom role creation
- Permission inheritance

### 2. Multi-Factor Authentication
- SMS/Email verification
- Biometric authentication
- Hardware token support

### 3. Advanced Analytics
- User behavior analysis
- Access pattern monitoring
- Security threat detection

## Troubleshooting

### Common Issues

1. **Token Expiration**
   - Check token validity
   - Implement refresh token mechanism
   - Handle 401 responses gracefully

2. **Role Mismatch**
   - Verify user role in database
   - Check JWT token claims
   - Validate role assignments

3. **Permission Denied**
   - Review permission matrix
   - Check authorization service logic
   - Verify route protection

### Debug Tools

1. **JWT Token Decoder**
   - Use jwt.io to decode tokens
   - Verify role claims
   - Check expiration times

2. **Authorization Logs**
   - Enable detailed logging
   - Monitor authorization decisions
   - Track permission checks

## Conclusion

This RBAC implementation provides a robust, secure, and scalable access control system for the HR Performance Management application. The multi-layered approach ensures security at every level while maintaining usability and performance.

For questions or issues, please refer to the development team or consult the API documentation. 