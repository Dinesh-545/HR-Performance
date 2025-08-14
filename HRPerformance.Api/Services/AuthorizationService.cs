using HRPerformance.Api.Data;
using HRPerformance.Api.Models.Entities;
using HRPerformance.Api.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HRPerformance.Api.Services
{
    public interface IAuthorizationService
    {
        Task<bool> CanAccessEmployeeAsync(int userId, int targetEmployeeId);
        Task<bool> CanManageEmployeeAsync(int userId, int targetEmployeeId);
        Task<bool> CanViewReviewsAsync(int userId, int? targetEmployeeId = null);
        Task<bool> CanCreateReviewsAsync(int userId);
        Task<bool> CanManageDepartmentsAsync(int userId);
        Task<bool> CanViewAnalyticsAsync(int userId);
        Task<bool> CanViewAdvancedAnalyticsAsync(int userId);
        Task<IEnumerable<int>> GetAccessibleEmployeeIdsAsync(int userId);
        Task<IEnumerable<int>> GetManageableEmployeeIdsAsync(int userId);
    }

    public class AuthorizationService : IAuthorizationService
    {
        private readonly ApplicationDbContext _context;

        public AuthorizationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CanAccessEmployeeAsync(int userId, int targetEmployeeId)
        {
            var user = await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Employee == null) return false;

            // HR Admin can access all employees
            if (user.Role == RoleConstants.HRAdmin) return true;

            // Users can always access their own data
            if (user.EmployeeId == targetEmployeeId) return true;

            // Managers can access their subordinates
            if (user.Role == RoleConstants.Manager)
            {
                return await _context.Employees
                    .AnyAsync(e => e.Id == targetEmployeeId && e.ManagerId == user.EmployeeId);
            }

            return false;
        }

        public async Task<bool> CanManageEmployeeAsync(int userId, int targetEmployeeId)
        {
            var user = await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Employee == null) return false;

            // HR Admin can manage all employees
            if (user.Role == RoleConstants.HRAdmin) return true;

            // Managers can manage their subordinates
            if (user.Role == RoleConstants.Manager)
            {
                return await _context.Employees
                    .AnyAsync(e => e.Id == targetEmployeeId && e.ManagerId == user.EmployeeId);
            }

            return false;
        }

        public async Task<bool> CanViewReviewsAsync(int userId, int? targetEmployeeId = null)
        {
            var user = await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Employee == null) return false;

            // HR Admin can view all reviews
            if (user.Role == RoleConstants.HRAdmin) return true;

            // If no specific employee is targeted, allow access to own reviews
            if (!targetEmployeeId.HasValue) return true;

            // Users can view reviews where they are reviewer or reviewee
            var canView = await _context.Reviews
                .AnyAsync(r => r.Id == targetEmployeeId && 
                              (r.ReviewerId == user.EmployeeId || r.RevieweeId == user.EmployeeId));

            if (canView) return true;

            // Managers can view reviews of their subordinates
            if (user.Role == RoleConstants.Manager)
            {
                return await _context.Employees
                    .AnyAsync(e => e.Id == targetEmployeeId && e.ManagerId == user.EmployeeId);
            }

            return false;
        }

        public async Task<bool> CanCreateReviewsAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.Role == RoleConstants.Manager || user?.Role == RoleConstants.HRAdmin;
        }

        public async Task<bool> CanManageDepartmentsAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.Role == RoleConstants.HRAdmin;
        }

        public async Task<bool> CanViewAnalyticsAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.Role == RoleConstants.Manager || user?.Role == RoleConstants.HRAdmin;
        }

        public async Task<bool> CanViewAdvancedAnalyticsAsync(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.Role == RoleConstants.HRAdmin;
        }

        public async Task<IEnumerable<int>> GetAccessibleEmployeeIdsAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Employee == null) return Enumerable.Empty<int>();

            // HR Admin can access all employees
            if (user.Role == RoleConstants.HRAdmin)
            {
                return await _context.Employees.Select(e => e.Id).ToListAsync();
            }

            // Users can always access their own data
            var accessibleIds = new List<int> { user.EmployeeId };

            // Managers can access their subordinates
            if (user.Role == RoleConstants.Manager)
            {
                var subordinateIds = await _context.Employees
                    .Where(e => e.ManagerId == user.EmployeeId)
                    .Select(e => e.Id)
                    .ToListAsync();
                accessibleIds.AddRange(subordinateIds);
            }

            return accessibleIds;
        }

        public async Task<IEnumerable<int>> GetManageableEmployeeIdsAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Employee == null) return Enumerable.Empty<int>();

            // HR Admin can manage all employees
            if (user.Role == RoleConstants.HRAdmin)
            {
                return await _context.Employees.Select(e => e.Id).ToListAsync();
            }

            // Managers can manage their subordinates
            if (user.Role == RoleConstants.Manager)
            {
                return await _context.Employees
                    .Where(e => e.ManagerId == user.EmployeeId)
                    .Select(e => e.Id)
                    .ToListAsync();
            }

            return Enumerable.Empty<int>();
        }
    }
} 