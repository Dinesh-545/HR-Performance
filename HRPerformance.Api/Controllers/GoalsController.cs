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
    public class GoalsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GoalsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Goal>>> GetGoals()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");

            if (userRole == "HR Admin")
            {
                return await _context.Goals.Include(g => g.Employee).ToListAsync();
            }
            if (userRole == "Manager")
            {
                // Manager can see their own and their team's goals
                var teamIds = _context.Employees.Where(e => e.ManagerId == userId).Select(e => e.Id).ToList();
                teamIds.Add(userId);
                return await _context.Goals.Include(g => g.Employee).Where(g => teamIds.Contains(g.EmployeeId)).ToListAsync();
            }
            // Employee can only see their own goals
            return await _context.Goals.Include(g => g.Employee).Where(g => g.EmployeeId == userId).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Goal>> GetGoal(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");
            var goal = await _context.Goals.Include(g => g.Employee).FirstOrDefaultAsync(g => g.Id == id);
            if (goal == null) return NotFound();
            if (userRole == "HR Admin") return goal;
            if (userRole == "Manager")
            {
                var teamIds = _context.Employees.Where(e => e.ManagerId == userId).Select(e => e.Id).ToList();
                teamIds.Add(userId);
                if (!teamIds.Contains(goal.EmployeeId)) return Forbid();
                return goal;
            }
            if (goal.EmployeeId != userId) return Forbid();
            return goal;
        }

        [HttpPost]
        [Authorize(Roles = "HR Admin,Manager")]
        public async Task<ActionResult<Goal>> CreateGoal(Goal goal)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");

            // HR Admin can create goals for anyone
            if (userRole == "HR Admin")
            {
                _context.Goals.Add(goal);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetGoal), new { id = goal.Id }, goal);
            }

            // Manager can only create goals for their team members
            if (userRole == "Manager")
            {
                var teamIds = _context.Employees.Where(e => e.ManagerId == userId).Select(e => e.Id).ToList();
                teamIds.Add(userId); // Manager can also create goals for themselves
                
                if (!teamIds.Contains(goal.EmployeeId))
                {
                    return Forbid("Manager can only create goals for team members");
                }

                _context.Goals.Add(goal);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetGoal), new { id = goal.Id }, goal);
            }

            return Forbid("Insufficient permissions to create goals");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(int id, Goal goal)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");
            
            // Ensure the goal ID matches the URL parameter
            goal.Id = id;
            
            // Check if goal exists
            var existingGoal = await _context.Goals.FindAsync(id);
            if (existingGoal == null)
            {
                return NotFound();
            }
            
            // Authorization checks
            if (userRole == "HR Admin") { }
            else if (userRole == "Manager")
            {
                var teamIds = _context.Employees.Where(e => e.ManagerId == userId).Select(e => e.Id).ToList();
                teamIds.Add(userId);
                if (!teamIds.Contains(goal.EmployeeId)) return Forbid();
            }
            else if (goal.EmployeeId != userId) return Forbid();
            
            // Update the goal
            _context.Entry(existingGoal).CurrentValues.SetValues(goal);
            
            try 
            { 
                await _context.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException) 
            { 
                if (!_context.Goals.Any(g => g.Id == id)) return NotFound(); 
                else throw; 
            }
            return NoContent();
        }



        [HttpDelete("{id}")]
        [Authorize(Roles = "HR Admin")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var goal = await _context.Goals.FindAsync(id);
            if (goal == null) return NotFound();
            _context.Goals.Remove(goal);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 