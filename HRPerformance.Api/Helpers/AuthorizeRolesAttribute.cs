using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace HRPerformance.Api.Helpers
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizeRolesAttribute : AuthorizeAttribute, IAuthorizationFilter
    {
        private readonly string[] _roles;

        public AuthorizeRolesAttribute(params string[] roles)
        {
            _roles = roles;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var userRole = user.FindFirst(ClaimTypes.Role)?.Value;
            
            if (string.IsNullOrEmpty(userRole) || !_roles.Contains(userRole))
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }

    public static class RoleConstants
    {
        public const string Employee = "Employee";
        public const string Manager = "Manager";
        public const string HRAdmin = "HR Admin";

        public static readonly string[] AllRoles = { Employee, Manager, HRAdmin };
        public static readonly string[] ManagementRoles = { Manager, HRAdmin };
        public static readonly string[] AdminOnly = { HRAdmin };
    }
} 