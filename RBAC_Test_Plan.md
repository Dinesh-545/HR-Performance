# RBAC Testing Plan

## Overview
This document outlines the testing strategy for the Role-Based Access Control (RBAC) implementation in the HR Performance Management System.

## Test Environment Setup

### Prerequisites
1. API running on http://localhost:5055
2. Frontend running on http://localhost:4200
3. Database seeded with test data
4. Test users with different roles

### Test Users Setup
```json
{
  "employee": {
    "username": "employee1",
    "password": "password123",
    "role": "Employee",
    "employeeId": 1
  },
  "manager": {
    "username": "manager1", 
    "password": "password123",
    "role": "Manager",
    "employeeId": 2
  },
  "hr_admin": {
    "username": "hradmin1",
    "password": "password123", 
    "role": "HR Admin",
    "employeeId": 3
  }
}
```

## Test Categories

### 1. Authentication Tests
- [ ] JWT token generation
- [ ] Token validation
- [ ] Token expiration
- [ ] Role claims in JWT

### 2. Backend Authorization Tests
- [ ] Route protection with [Authorize] attribute
- [ ] Role-based access control
- [ ] Custom authorization attributes
- [ ] Authorization service methods
- [ ] Data filtering by role

### 3. Frontend Authorization Tests
- [ ] Route guards
- [ ] Role directives
- [ ] Navigation menu visibility
- [ ] Component access control
- [ ] Service permission checks

### 4. Integration Tests
- [ ] End-to-end user flows
- [ ] Cross-role access attempts
- [ ] Error handling
- [ ] Security violations

## Test Scenarios

### Scenario 1: Employee Access
**User**: Employee
**Expected Behavior**:
- Can view own profile
- Can view own goals
- Can view own reviews
- Cannot access other employees
- Cannot access analytics
- Cannot create/delete employees

### Scenario 2: Manager Access
**User**: Manager
**Expected Behavior**:
- All Employee permissions
- Can view team members
- Can create reviews for subordinates
- Can view team analytics
- Cannot access advanced analytics
- Cannot manage departments

### Scenario 3: HR Admin Access
**User**: HR Admin
**Expected Behavior**:
- All Manager permissions
- Can view all employees
- Can create/delete employees
- Can manage departments
- Can access advanced analytics
- Full system access

## Test Execution

### Manual Testing Steps

1. **Start the Application**
   ```bash
   # Start API
   cd HRPerformance.Api
   dotnet run
   
   # Start Frontend
   cd HRPerformance.Web
   ng serve
   ```

2. **Test Authentication**
   - Login with each role
   - Verify JWT token contains correct role
   - Test token expiration

3. **Test Route Access**
   - Try accessing protected routes
   - Verify redirects for unauthorized access
   - Test role-based route protection

4. **Test UI Elements**
   - Verify navigation menu shows correct items
   - Test role-based button visibility
   - Check component access

5. **Test Data Access**
   - Verify data filtering by role
   - Test CRUD operations
   - Check permission boundaries

### Automated Testing

#### Unit Tests
```bash
# Backend tests
cd HRPerformance.Api
dotnet test

# Frontend tests
cd HRPerformance.Web
ng test
```

#### Integration Tests
```bash
# API integration tests
dotnet test --filter Category=Integration

# E2E tests
ng e2e
```

## Test Cases

### TC001: Employee Login and Access
**Objective**: Verify employee can login and access appropriate features
**Steps**:
1. Login as employee
2. Navigate to dashboard
3. Try to access employees page
4. Try to access analytics
5. Try to create employee

**Expected Results**:
- Login successful
- Dashboard accessible
- Employees page shows only own data
- Analytics page not accessible
- Create employee button not visible

### TC002: Manager Team Access
**Objective**: Verify manager can access team data
**Steps**:
1. Login as manager
2. Navigate to employees page
3. View team members
4. Create review for subordinate
5. Access analytics

**Expected Results**:
- Can see team members
- Can create reviews for subordinates
- Analytics accessible
- Advanced analytics not accessible

### TC003: HR Admin Full Access
**Objective**: Verify HR admin has full system access
**Steps**:
1. Login as HR admin
2. Navigate to all pages
3. Create new employee
4. Delete employee
5. Access advanced analytics

**Expected Results**:
- All pages accessible
- Can create/delete employees
- Advanced analytics accessible
- Full system control

### TC004: Unauthorized Access Prevention
**Objective**: Verify unauthorized access is prevented
**Steps**:
1. Login as employee
2. Try to access HR admin only features
3. Try to modify other user data
4. Test direct API calls

**Expected Results**:
- Access denied
- Proper error messages
- Redirects to appropriate pages

## Security Testing

### Penetration Testing
- [ ] Token manipulation
- [ ] Role escalation attempts
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

### Authorization Bypass Testing
- [ ] Direct API access without token
- [ ] Modified role claims
- [ ] Access to other user data
- [ ] Privilege escalation

## Performance Testing

### Load Testing
- [ ] Multiple concurrent users
- [ ] Role-based performance impact
- [ ] Authorization service performance
- [ ] Token validation overhead

## Test Data Management

### Test Database
```sql
-- Test users
INSERT INTO Users (Username, PasswordHash, Role, EmployeeId) VALUES
('employee1', 'hashed_password', 'Employee', 1),
('manager1', 'hashed_password', 'Manager', 2),
('hradmin1', 'hashed_password', 'HR Admin', 3);

-- Test employees
INSERT INTO Employees (Id, FirstName, LastName, Email, Role, ManagerId) VALUES
(1, 'John', 'Employee', 'john@company.com', 'Employee', 2),
(2, 'Jane', 'Manager', 'jane@company.com', 'Manager', NULL),
(3, 'Bob', 'HRAdmin', 'bob@company.com', 'HR Admin', NULL);
```

## Test Reporting

### Test Results Template
```
Test Case: TC001
Status: PASS/FAIL
Environment: Development
Date: YYYY-MM-DD
Tester: [Name]
Notes: [Any issues or observations]
```

### Metrics to Track
- Test coverage percentage
- Pass/fail rates
- Security test results
- Performance benchmarks
- Bug reports

## Continuous Testing

### CI/CD Integration
- [ ] Automated unit tests
- [ ] Integration tests
- [ ] Security scans
- [ ] Performance tests
- [ ] Deployment validation

### Monitoring
- [ ] Authorization failures
- [ ] Security violations
- [ ] Performance metrics
- [ ] User access patterns

## Conclusion

This testing plan ensures comprehensive validation of the RBAC implementation across all layers of the application. Regular testing should be performed to maintain security and functionality. 