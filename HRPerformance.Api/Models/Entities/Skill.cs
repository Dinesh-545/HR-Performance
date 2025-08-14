using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class Skill
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }
        [MaxLength(500)]
        public string? Description { get; set; }
        [JsonIgnore]
        public ICollection<EmployeeSkill> EmployeeSkills { get; set; } = new List<EmployeeSkill>();
    }
} 