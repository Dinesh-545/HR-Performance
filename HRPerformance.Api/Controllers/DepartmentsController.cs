using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRPerformance.Api.Data;
using HRPerformance.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HRPerformance.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DepartmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Departments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
        {
            return await _context.Departments.ToListAsync();
        }

        // GET: api/Departments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> GetDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null) return NotFound();
            return department;
        }

        // GET: api/Departments/5/employees
        [HttpGet("{id}/employees")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetDepartmentEmployees(int id)
        {
            var employees = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Manager)
                .Where(e => e.DepartmentId == id)
                .ToListAsync();

            return employees;
        }

        // POST: api/Departments
        [HttpPost]
        [Authorize(Roles = "HR Admin")]
        public async Task<ActionResult<Department>> CreateDepartment(Department department)
        {
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
        }

        // PUT: api/Departments/5
        [HttpPut("{id}")]
        [Authorize(Roles = "HR Admin")]
        public async Task<IActionResult> UpdateDepartment(int id, Department department)
        {
            // Ensure the department ID matches the URL parameter
            department.Id = id;
            
            // Check if department exists
            var existingDepartment = await _context.Departments.FindAsync(id);
            if (existingDepartment == null)
            {
                return NotFound();
            }
            
            // Update the department
            _context.Entry(existingDepartment).CurrentValues.SetValues(department);
            
            try 
            { 
                await _context.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException) 
            { 
                if (!_context.Departments.Any(d => d.Id == id)) return NotFound(); 
                else throw; 
            }
            return NoContent();
        }

        // DELETE: api/Departments/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "HR Admin")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null) return NotFound();
            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 