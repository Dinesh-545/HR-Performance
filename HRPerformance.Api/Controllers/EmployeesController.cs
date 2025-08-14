using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRPerformance.Api.Data;
using HRPerformance.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HRPerformance.Api.Controllers
{
    /// <summary>
    /// Controller for managing employee profiles and related data
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all employees with their department and manager information
        /// </summary>
        /// <returns>A list of all employees</returns>
        /// <response code="200">Returns the list of employees</response>
        /// <response code="500">If there was an internal server error</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");

            // HR Admin can see all employees
            if (userRole == "HR Admin")
            {
                return await _context.Employees
                    .Include(e => e.Department)
                    .Include(e => e.Manager)
                    .ToListAsync();
            }

            // Manager can see their subordinates and themselves
            if (userRole == "Manager")
            {
                return await _context.Employees
                    .Include(e => e.Department)
                    .Include(e => e.Manager)
                    .Where(e => e.Id == userId || e.ManagerId == userId)
                    .ToListAsync();
            }

            // Employee can only see themselves
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Manager)
                .Where(e => e.Id == userId)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a specific employee by their ID
        /// </summary>
        /// <param name="id">The unique identifier of the employee</param>
        /// <returns>The employee with the specified ID</returns>
        /// <response code="200">Returns the requested employee</response>
        /// <response code="404">If the employee was not found</response>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");

            // Check access rights
            if (userRole == "Employee" && id != userId)
            {
                return Forbid();
            }

            if (userRole == "Manager" && id != userId)
            {
                var employee = await _context.Employees.FindAsync(id);
                if (employee?.ManagerId != userId)
                {
                    return Forbid();
                }
            }

            var employeeResult = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Manager)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (employeeResult == null)
            {
                return NotFound();
            }

            return employeeResult;
        }

        /// <summary>
        /// Retrieves all goals assigned to a specific employee
        /// </summary>
        /// <param name="id">The unique identifier of the employee</param>
        /// <returns>A list of goals assigned to the employee</returns>
        /// <response code="200">Returns the employee's goals</response>
        [HttpGet("{id}/goals")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Goal>>> GetEmployeeGoals(int id)
        {
            var goals = await _context.Goals
                .Where(g => g.EmployeeId == id)
                .ToListAsync();

            return goals;
        }

        /// <summary>
        /// Retrieves all skills associated with a specific employee
        /// </summary>
        /// <param name="id">The unique identifier of the employee</param>
        /// <returns>A list of skills associated with the employee</returns>
        /// <response code="200">Returns the employee's skills</response>
        [HttpGet("{id}/skills")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<EmployeeSkill>>> GetEmployeeSkills(int id)
        {
            var skills = await _context.EmployeeSkills
                .Include(es => es.Skill)
                .Where(es => es.EmployeeId == id)
                .ToListAsync();

            return skills;
        }

        /// <summary>
        /// Creates a new employee
        /// </summary>
        /// <param name="employee">The employee data to create</param>
        /// <returns>The created employee</returns>
        /// <response code="201">Returns the newly created employee</response>
        /// <response code="400">If the employee data is invalid</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Authorize(Roles = "HR Admin")]
        public async Task<ActionResult<Employee>> CreateEmployee(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
        }

        /// <summary>
        /// Updates an existing employee
        /// </summary>
        /// <param name="id">The unique identifier of the employee to update</param>
        /// <param name="employee">The updated employee data</param>
        /// <returns>No content on success</returns>
        /// <response code="204">If the employee was successfully updated</response>
        /// <response code="400">If the ID does not match the employee data</response>
        /// <response code="404">If the employee was not found</response>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");

            // Ensure the employee ID matches the URL parameter
            employee.Id = id;

            // Check if employee exists
            var existingEmployee = await _context.Employees.FindAsync(id);
            if (existingEmployee == null)
            {
                return NotFound();
            }

            // Check access rights
            if (userRole == "Employee" && id != userId)
            {
                return Forbid();
            }

            if (userRole == "Manager" && id != userId)
            {
                if (existingEmployee.ManagerId != userId)
                {
                    return Forbid();
                }
            }

            // Update the employee
            _context.Entry(existingEmployee).CurrentValues.SetValues(employee);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes an employee
        /// </summary>
        /// <param name="id">The unique identifier of the employee to delete</param>
        /// <returns>No content on success</returns>
        /// <response code="204">If the employee was successfully deleted</response>
        /// <response code="404">If the employee was not found</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = "HR Admin")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmployeeExists(int id)
        {
            return _context.Employees.Any(e => e.Id == id);
        }
    }
} 