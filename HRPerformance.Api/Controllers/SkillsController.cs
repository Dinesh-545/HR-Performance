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
    public class SkillsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SkillsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Skills
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Skill>>> GetSkills()
        {
            return await _context.Skills.ToListAsync();
        }

        // GET: api/Skills/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Skill>> GetSkill(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null) return NotFound();
            return skill;
        }

        // GET: api/Skills/5/employees
        [HttpGet("{id}/employees")]
        public async Task<ActionResult<IEnumerable<EmployeeSkill>>> GetSkillEmployees(int id)
        {
            var employeeSkills = await _context.EmployeeSkills
                .Include(es => es.Employee)
                .Include(es => es.Skill)
                .Where(es => es.SkillId == id)
                .ToListAsync();

            return employeeSkills;
        }

        // POST: api/Skills
        [HttpPost]
        [Authorize(Roles = "HR Admin")]
        public async Task<ActionResult<Skill>> CreateSkill(Skill skill)
        {
            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skill);
        }

        // PUT: api/Skills/5
        [HttpPut("{id}")]
        [Authorize(Roles = "HR Admin")]
        public async Task<IActionResult> UpdateSkill(int id, Skill skill)
        {
            // Ensure the skill ID matches the URL parameter
            skill.Id = id;
            
            // Check if skill exists
            var existingSkill = await _context.Skills.FindAsync(id);
            if (existingSkill == null)
            {
                return NotFound();
            }
            
            // Update the skill
            _context.Entry(existingSkill).CurrentValues.SetValues(skill);
            
            try 
            { 
                await _context.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException) 
            { 
                if (!_context.Skills.Any(s => s.Id == id)) return NotFound(); 
                else throw; 
            }
            return NoContent();
        }

        // DELETE: api/Skills/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "HR Admin")]
        public async Task<IActionResult> DeleteSkill(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null) return NotFound();
            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 