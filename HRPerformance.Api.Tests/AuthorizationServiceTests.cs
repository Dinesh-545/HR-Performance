using Microsoft.EntityFrameworkCore;
using HRPerformance.Api.Services;
using HRPerformance.Api.Data;
using HRPerformance.Api.Models.Entities;
using HRPerformance.Api.Helpers;
using Xunit;

namespace HRPerformance.Api.Tests
{
    public class AuthorizationServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthorizationService _authService;
        public AuthorizationServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _authService = new AuthorizationService(_context);
            
            SeedTestData();
        }

        private void SeedTestData()
        {
            // Create test employees
            var employees = new List<Employee>
            {
                new Employee { Id = 1, FirstName = "John", LastName = "Employee", Email = "john@company.com", Role = "Employee", ManagerId = 2 },
                new Employee { Id = 2, FirstName = "Jane", LastName = "Manager", Email = "jane@company.com", Role = "Manager", ManagerId = null },
                new Employee { Id = 3, FirstName = "Bob", LastName = "HRAdmin", Email = "bob@company.com", Role = "HR Admin", ManagerId = null },
                new Employee { Id = 4, FirstName = "Alice", LastName = "Subordinate", Email = "alice@company.com", Role = "Employee", ManagerId = 2 }
            };

            _context.Employees.AddRange(employees);

            // Create test users
            var users = new List<User>
            {
                new User { Id = 1, Username = "employee1", PasswordHash = "hash", Role = "Employee", EmployeeId = 1 },
                new User { Id = 2, Username = "manager1", PasswordHash = "hash", Role = "Manager", EmployeeId = 2 },
                new User { Id = 3, Username = "hradmin1", PasswordHash = "hash", Role = "HR Admin", EmployeeId = 3 }
            };

            _context.Users.AddRange(users);
            _context.SaveChanges();
        }

        [Fact]
        public async Task HRAdmin_CanAccessAllEmployees_ReturnsTrue()
        {
            // Arrange
            var hrAdminUserId = 3;

            // Act
            var canAccessEmployee1 = await _authService.CanAccessEmployeeAsync(hrAdminUserId, 1);
            var canAccessEmployee2 = await _authService.CanAccessEmployeeAsync(hrAdminUserId, 2);
            var canAccessEmployee4 = await _authService.CanAccessEmployeeAsync(hrAdminUserId, 4);

            // Assert
            Assert.True(canAccessEmployee1);
            Assert.True(canAccessEmployee2);
            Assert.True(canAccessEmployee4);
        }

        [Fact]
        public async Task Manager_CanAccessOwnData_ReturnsTrue()
        {
            // Arrange
            var managerUserId = 2;
            var managerEmployeeId = 2;

            // Act
            var canAccessOwnData = await _authService.CanAccessEmployeeAsync(managerUserId, managerEmployeeId);

            // Assert
            Assert.True(canAccessOwnData);
        }

        [Fact]
        public async Task Manager_CanAccessSubordinateData_ReturnsTrue()
        {
            // Arrange
            var managerUserId = 2;
            var subordinateEmployeeId = 1; // John Employee reports to Jane Manager

            // Act
            var canAccessSubordinate = await _authService.CanAccessEmployeeAsync(managerUserId, subordinateEmployeeId);

            // Assert
            Assert.True(canAccessSubordinate);
        }

        [Fact]
        public async Task Manager_CannotAccessOtherManagerData_ReturnsFalse()
        {
            // Arrange
            var managerUserId = 2;
            var otherManagerEmployeeId = 3; // Bob HRAdmin

            // Act
            var canAccessOtherManager = await _authService.CanAccessEmployeeAsync(managerUserId, otherManagerEmployeeId);

            // Assert
            Assert.False(canAccessOtherManager);
        }

        [Fact]
        public async Task Employee_CanAccessOwnData_ReturnsTrue()
        {
            // Arrange
            var employeeUserId = 1;
            var employeeId = 1;

            // Act
            var canAccessOwnData = await _authService.CanAccessEmployeeAsync(employeeUserId, employeeId);

            // Assert
            Assert.True(canAccessOwnData);
        }

        [Fact]
        public async Task Employee_CannotAccessOtherEmployeeData_ReturnsFalse()
        {
            // Arrange
            var employeeUserId = 1;
            var otherEmployeeId = 4; // Alice

            // Act
            var canAccessOtherEmployee = await _authService.CanAccessEmployeeAsync(employeeUserId, otherEmployeeId);

            // Assert
            Assert.False(canAccessOtherEmployee);
        }

        [Fact]
        public async Task HRAdmin_CanManageAllEmployees_ReturnsTrue()
        {
            // Arrange
            var hrAdminUserId = 3;

            // Act
            var canManageEmployee1 = await _authService.CanManageEmployeeAsync(hrAdminUserId, 1);
            var canManageEmployee2 = await _authService.CanManageEmployeeAsync(hrAdminUserId, 2);

            // Assert
            Assert.True(canManageEmployee1);
            Assert.True(canManageEmployee2);
        }

        [Fact]
        public async Task Manager_CanManageSubordinates_ReturnsTrue()
        {
            // Arrange
            var managerUserId = 2;
            var subordinateEmployeeId = 1;

            // Act
            var canManageSubordinate = await _authService.CanManageEmployeeAsync(managerUserId, subordinateEmployeeId);

            // Assert
            Assert.True(canManageSubordinate);
        }

        [Fact]
        public async Task Manager_CannotManageOtherEmployees_ReturnsFalse()
        {
            // Arrange
            var managerUserId = 2;
            var otherEmployeeId = 4; // Alice (not a subordinate)

            // Act
            var canManageOther = await _authService.CanManageEmployeeAsync(managerUserId, otherEmployeeId);

            // Assert
            Assert.False(canManageOther);
        }

        [Fact]
        public async Task Employee_CannotManageAnyone_ReturnsFalse()
        {
            // Arrange
            var employeeUserId = 1;
            var targetEmployeeId = 4;

            // Act
            var canManage = await _authService.CanManageEmployeeAsync(employeeUserId, targetEmployeeId);

            // Assert
            Assert.False(canManage);
        }

        [Fact]
        public async Task GetAccessibleEmployeeIds_HRAdmin_ReturnsAllEmployees()
        {
            // Arrange
            var hrAdminUserId = 3;

            // Act
            var accessibleIds = await _authService.GetAccessibleEmployeeIdsAsync(hrAdminUserId);

            // Assert
            Assert.Equal(4, accessibleIds.Count());
            Assert.Contains(1, accessibleIds);
            Assert.Contains(2, accessibleIds);
            Assert.Contains(3, accessibleIds);
            Assert.Contains(4, accessibleIds);
        }

        [Fact]
        public async Task GetAccessibleEmployeeIds_Manager_ReturnsOwnAndSubordinates()
        {
            // Arrange
            var managerUserId = 2;

            // Act
            var accessibleIds = await _authService.GetAccessibleEmployeeIdsAsync(managerUserId);

            // Assert
            Assert.Equal(2, accessibleIds.Count());
            Assert.Contains(2, accessibleIds); // Own ID
            Assert.Contains(1, accessibleIds); // Subordinate ID
        }

        [Fact]
        public async Task GetAccessibleEmployeeIds_Employee_ReturnsOnlyOwn()
        {
            // Arrange
            var employeeUserId = 1;

            // Act
            var accessibleIds = await _authService.GetAccessibleEmployeeIdsAsync(employeeUserId);

            // Assert
            Assert.Single(accessibleIds);
            Assert.Contains(1, accessibleIds);
        }

        [Fact]
        public async Task CanCreateReviews_Manager_ReturnsTrue()
        {
            // Arrange
            var managerUserId = 2;

            // Act
            var canCreate = await _authService.CanCreateReviewsAsync(managerUserId);

            // Assert
            Assert.True(canCreate);
        }

        [Fact]
        public async Task CanCreateReviews_HRAdmin_ReturnsTrue()
        {
            // Arrange
            var hrAdminUserId = 3;

            // Act
            var canCreate = await _authService.CanCreateReviewsAsync(hrAdminUserId);

            // Assert
            Assert.True(canCreate);
        }

        [Fact]
        public async Task CanCreateReviews_Employee_ReturnsFalse()
        {
            // Arrange
            var employeeUserId = 1;

            // Act
            var canCreate = await _authService.CanCreateReviewsAsync(employeeUserId);

            // Assert
            Assert.False(canCreate);
        }

        [Fact]
        public async Task CanManageDepartments_HRAdmin_ReturnsTrue()
        {
            // Arrange
            var hrAdminUserId = 3;

            // Act
            var canManage = await _authService.CanManageDepartmentsAsync(hrAdminUserId);

            // Assert
            Assert.True(canManage);
        }

        [Fact]
        public async Task CanManageDepartments_Manager_ReturnsFalse()
        {
            // Arrange
            var managerUserId = 2;

            // Act
            var canManage = await _authService.CanManageDepartmentsAsync(managerUserId);

            // Assert
            Assert.False(canManage);
        }

        [Fact]
        public async Task CanViewAnalytics_Manager_ReturnsTrue()
        {
            // Arrange
            var managerUserId = 2;

            // Act
            var canView = await _authService.CanViewAnalyticsAsync(managerUserId);

            // Assert
            Assert.True(canView);
        }

        [Fact]
        public async Task CanViewAnalytics_Employee_ReturnsFalse()
        {
            // Arrange
            var employeeUserId = 1;

            // Act
            var canView = await _authService.CanViewAnalyticsAsync(employeeUserId);

            // Assert
            Assert.False(canView);
        }

        [Fact]
        public async Task CanViewAdvancedAnalytics_HRAdmin_ReturnsTrue()
        {
            // Arrange
            var hrAdminUserId = 3;

            // Act
            var canView = await _authService.CanViewAdvancedAnalyticsAsync(hrAdminUserId);

            // Assert
            Assert.True(canView);
        }

        [Fact]
        public async Task CanViewAdvancedAnalytics_Manager_ReturnsFalse()
        {
            // Arrange
            var managerUserId = 2;

            // Act
            var canView = await _authService.CanViewAdvancedAnalyticsAsync(managerUserId);

            // Assert
            Assert.False(canView);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
} 