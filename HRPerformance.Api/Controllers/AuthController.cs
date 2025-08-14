using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HRPerformance.Api.Data;
using HRPerformance.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRPerformance.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid username or password");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token, user = new { user.Id, user.Username, user.Role, user.EmployeeId } });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest("Username already exists");
            }

            var employee = await _context.Employees.FindAsync(request.EmployeeId);
            if (employee == null)
            {
                return BadRequest("Employee not found");
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                EmployeeId = request.EmployeeId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return Ok(new { token, user = new { user.Id, user.Username, user.Role, user.EmployeeId } });
        }

        [HttpGet("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
            {
                return Unauthorized();
            }

            var user = await _context.Users.Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new { user.Id, user.Username, user.Role, user.EmployeeId, user.Employee });
        }

        private string GenerateJwtToken(User user)
        {
            var key = _config["Jwt:Key"] ?? "super_secret_dev_key_123!";
            var issuer = _config["Jwt:Issuer"] ?? "HRPerformance";
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("employeeId", user.EmployeeId.ToString())
            };
            var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee";
        public int EmployeeId { get; set; }
    }
} 