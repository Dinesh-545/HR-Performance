using HRPerformance.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRPerformance.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Database should already be created and migrated by Program.cs
            // This method only handles seeding data

            // Seed Departments
            if (!context.Departments.Any())
            {
                var departments = new[]
                {
                    new Department { Name = "Human Resources" },
                    new Department { Name = "Engineering" },
                    new Department { Name = "Marketing" },
                    new Department { Name = "Finance" },
                    new Department { Name = "Sales" }
                };
                context.Departments.AddRange(departments);
                context.SaveChanges();
            }

            // Seed Employees
            if (!context.Employees.Any())
            {
                var employees = new[]
                {
                    new Employee { FirstName = "Jane", LastName = "Smith", Email = "jane.smith@company.com", Role = "Manager", DepartmentId = 1 },
                    new Employee { FirstName = "Charlie", LastName = "Wilson", Email = "charlie.wilson@company.com", Role = "Manager", DepartmentId = 2 },
                    new Employee { FirstName = "John", LastName = "Doe", Email = "john.doe@company.com", Role = "Employee", DepartmentId = 1, ManagerId = 1 },
                    new Employee { FirstName = "Bob", LastName = "Johnson", Email = "bob.johnson@company.com", Role = "Employee", DepartmentId = 2, ManagerId = 2 },
                    new Employee { FirstName = "Alice", LastName = "Brown", Email = "alice.brown@company.com", Role = "HR Admin", DepartmentId = 1 }
                };
                context.Employees.AddRange(employees);
                context.SaveChanges();
            }

            // Seed Skills
            if (!context.Skills.Any())
            {
                var skills = new[]
                {
                    new Skill { Name = "Leadership", Description = "Ability to lead and manage teams" },
                    new Skill { Name = "Communication", Description = "Effective verbal and written communication" },
                    new Skill { Name = "Problem Solving", Description = "Analytical and critical thinking skills" },
                    new Skill { Name = "Project Management", Description = "Planning and executing projects" },
                    new Skill { Name = "Technical Skills", Description = "Programming and technical expertise" }
                };
                context.Skills.AddRange(skills);
                context.SaveChanges();
            }

            // Seed Employee Skills
            if (!context.EmployeeSkills.Any())
            {
                var employeeSkills = new[]
                {
                    new EmployeeSkill { EmployeeId = 1, SkillId = 1, ProficiencyLevel = 5 },
                    new EmployeeSkill { EmployeeId = 1, SkillId = 3, ProficiencyLevel = 4 },
                    new EmployeeSkill { EmployeeId = 2, SkillId = 4, ProficiencyLevel = 4 },
                    new EmployeeSkill { EmployeeId = 3, SkillId = 1, ProficiencyLevel = 4 },
                    new EmployeeSkill { EmployeeId = 3, SkillId = 2, ProficiencyLevel = 5 },
                    new EmployeeSkill { EmployeeId = 4, SkillId = 2, ProficiencyLevel = 5 },
                    new EmployeeSkill { EmployeeId = 5, SkillId = 2, ProficiencyLevel = 5 }
                };
                context.EmployeeSkills.AddRange(employeeSkills);
                context.SaveChanges();
            }

            // Seed Goals
            if (!context.Goals.Any())
            {
                var goals = new[]
                {
                    new Goal { Title = "Improve Leadership Skills", Description = "Enhance team management capabilities", EmployeeId = 3, Status = "In Progress", StartDate = DateTime.Now, EndDate = DateTime.Now.AddMonths(3), Notes = "Focus on team communication and decision-making skills" },
                    new Goal { Title = "Complete Project X", Description = "Finish the major project by deadline", EmployeeId = 1, Status = "Completed", StartDate = DateTime.Now.AddDays(-30), EndDate = DateTime.Now.AddDays(30), Notes = "Successfully delivered project on time with high quality" },
                    new Goal { Title = "Learn New Technology", Description = "Master the latest development framework", EmployeeId = 4, Status = "Not Started", StartDate = DateTime.Now, EndDate = DateTime.Now.AddMonths(6), Notes = "Complete online courses and build sample projects" }
                };
                context.Goals.AddRange(goals);
                context.SaveChanges();
            }

            // Seed Review Cycles
            if (!context.ReviewCycles.Any())
            {
                var cycles = new[]
                {
                    new ReviewCycle { Name = "Q1 2024", Type = "Quarterly", StartDate = DateTime.Now.AddMonths(-3), EndDate = DateTime.Now.AddMonths(-1) },
                    new ReviewCycle { Name = "Q2 2024", Type = "Quarterly", StartDate = DateTime.Now.AddMonths(-1), EndDate = DateTime.Now.AddMonths(2) },
                    new ReviewCycle { Name = "Annual 2024", Type = "Annual", StartDate = DateTime.Now.AddMonths(-6), EndDate = DateTime.Now.AddMonths(6) }
                };
                context.ReviewCycles.AddRange(cycles);
                context.SaveChanges();
            }

            // Seed Review Templates
            if (!context.ReviewTemplates.Any())
            {
                var templates = new[]
                {
                    new ReviewTemplate { Name = "Annual Performance Review", StructureJson = "{\"sections\":[\"Goals\",\"Skills\",\"Leadership\"]}" },
                    new ReviewTemplate { Name = "Quarterly Check-in", StructureJson = "{\"sections\":[\"Progress\",\"Challenges\",\"Next Steps\"]}" },
                    new ReviewTemplate { Name = "360 Degree Review", StructureJson = "{\"sections\":[\"Self\",\"Peer\",\"Manager\",\"Subordinate\"]}" }
                };
                context.ReviewTemplates.AddRange(templates);
                context.SaveChanges();
            }

            // Seed Reviews
            if (!context.Reviews.Any())
            {
                var reviews = new[]
                {
                    new Review { CycleId = 1, ReviewerId = 1, RevieweeId = 3, TemplateId = 1, Rating = 4, Comments = "Excellent performance throughout the year", AttachmentPath = "", IsLocked = false },
                    new Review { CycleId = 1, ReviewerId = 1, RevieweeId = 4, TemplateId = 1, Rating = 3, Comments = "Good performance with room for improvement", AttachmentPath = "", IsLocked = false },
                    new Review { CycleId = 1, ReviewerId = 2, RevieweeId = 5, TemplateId = 1, Rating = 5, Comments = "Outstanding leadership and results", AttachmentPath = "", IsLocked = true },
                    new Review { CycleId = 2, ReviewerId = 1, RevieweeId = 3, TemplateId = 2, Rating = 0, Comments = "", AttachmentPath = "", IsLocked = false },
                    new Review { CycleId = 2, ReviewerId = 2, RevieweeId = 4, TemplateId = 2, Rating = 0, Comments = "", AttachmentPath = "", IsLocked = false }
                };
                context.Reviews.AddRange(reviews);
                context.SaveChanges();
            }

            // Seed Users
            if (!context.Users.Any())
            {
                var users = new[]
                {
                    new User { Username = "jane.smith", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Manager", EmployeeId = 1 },
                    new User { Username = "charlie.wilson", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Manager", EmployeeId = 2 },
                    new User { Username = "john.doe", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Employee", EmployeeId = 3 },
                    new User { Username = "bob.johnson", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Employee", EmployeeId = 4 },
                    new User { Username = "alice.brown", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HR Admin", EmployeeId = 5 }
                };
                context.Users.AddRange(users);
                context.SaveChanges();
            }
        }
    }
} 