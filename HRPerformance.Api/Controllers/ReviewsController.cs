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
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");
            if (userRole == "HR Admin")
            {
                return await _context.Reviews
                    .Include(r => r.Reviewer)
                    .Include(r => r.Reviewee)
                    .Include(r => r.Cycle)
                    .Include(r => r.Template)
                    .ToListAsync();
            }
            if (userRole == "Manager")
            {
                var teamIds = _context.Employees.Where(e => e.ManagerId == userId).Select(e => e.Id).ToList();
                teamIds.Add(userId);
                return await _context.Reviews
                    .Include(r => r.Reviewer)
                    .Include(r => r.Reviewee)
                    .Include(r => r.Cycle)
                    .Include(r => r.Template)
                    .Where(r => (r.RevieweeId.HasValue && teamIds.Contains(r.RevieweeId.Value)) || (r.ReviewerId.HasValue && teamIds.Contains(r.ReviewerId.Value)))
                    .ToListAsync();
            }
            // Employee: only reviews where they are reviewer or reviewee
            return await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Cycle)
                .Include(r => r.Template)
                .Where(r => (r.RevieweeId.HasValue && r.RevieweeId.Value == userId) || (r.ReviewerId.HasValue && r.ReviewerId.Value == userId))
                .ToListAsync();
        }

        // GET: api/Reviews/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");
            var review = await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Cycle)
                .Include(r => r.Template)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (review == null) return NotFound();
            if (userRole == "HR Admin") return review;
            if (userRole == "Manager")
            {
                var teamIds = _context.Employees.Where(e => e.ManagerId == userId).Select(e => e.Id).ToList();
                teamIds.Add(userId);
                if (!(review.RevieweeId.HasValue && teamIds.Contains(review.RevieweeId.Value)) && !(review.ReviewerId.HasValue && teamIds.Contains(review.ReviewerId.Value))) return Forbid();
                return review;
            }
            if (!(review.RevieweeId.HasValue && review.RevieweeId.Value == userId) && !(review.ReviewerId.HasValue && review.ReviewerId.Value == userId)) return Forbid();
            return review;
        }

        // GET: api/Reviews/cycle/5
        [HttpGet("cycle/{cycleId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviewsByCycle(int cycleId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Cycle)
                .Include(r => r.Template)
                .Where(r => r.CycleId == cycleId)
                .ToListAsync();

            return reviews;
        }

        // GET: api/Reviews/reviewee/5
        [HttpGet("reviewee/{revieweeId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviewsByReviewee(int revieweeId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Cycle)
                .Include(r => r.Template)
                .Where(r => r.RevieweeId == revieweeId)
                .ToListAsync();

            return reviews;
        }

        // GET: api/Reviews/reviewer/5
        [HttpGet("reviewer/{reviewerId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviewsByReviewer(int reviewerId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Cycle)
                .Include(r => r.Template)
                .Where(r => r.ReviewerId == reviewerId)
                .ToListAsync();

            return reviews;
        }

        // POST: api/Reviews
        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview(Review review)
        {
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }

        // PUT: api/Reviews/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, Review review)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst("employeeId")?.Value ?? "0");
            
            // Ensure the review ID matches the URL parameter
            review.Id = id;
            
            // Check if review exists
            var existingReview = await _context.Reviews.FindAsync(id);
            if (existingReview == null)
            {
                return NotFound();
            }
            
            // Authorization checks
            if (userRole == "HR Admin") { }
            else if (userRole == "Manager")
            {
                var teamIds = _context.Employees.Where(e => e.ManagerId == userId).Select(e => e.Id).ToList();
                teamIds.Add(userId);
                if (!(review.RevieweeId.HasValue && teamIds.Contains(review.RevieweeId.Value)) && !(review.ReviewerId.HasValue && teamIds.Contains(review.ReviewerId.Value))) return Forbid();
            }
            else if (!(review.RevieweeId.HasValue && review.RevieweeId.Value == userId) && !(review.ReviewerId.HasValue && review.ReviewerId.Value == userId)) return Forbid();
            
            // Update the review
            _context.Entry(existingReview).CurrentValues.SetValues(review);
            
            try 
            { 
                await _context.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException) 
            { 
                if (!_context.Reviews.Any(r => r.Id == id)) return NotFound(); 
                else throw; 
            }
            return NoContent();
        }

        // PATCH: api/Reviews/5/lock
        [HttpPatch("{id}/lock")]
        public async Task<IActionResult> LockReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound();
            }

            review.IsLocked = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Reviews/5/unlock
        [HttpPatch("{id}/unlock")]
        public async Task<IActionResult> UnlockReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound();
            }

            review.IsLocked = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "HR Admin")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool ReviewExists(int id)
        {
            return _context.Reviews.Any(r => r.Id == id);
        }
    }
} 