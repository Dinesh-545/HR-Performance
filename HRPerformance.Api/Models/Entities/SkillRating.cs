using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class SkillRating
    {
        [Key]
        public int Id { get; set; }
        public int EmployeeSkillId { get; set; }
        public int? RatedById { get; set; }
        public int Rating { get; set; }
        public string? Notes { get; set; }

        [ForeignKey("EmployeeSkillId")]
        [JsonIgnore]
        public EmployeeSkill? EmployeeSkill { get; set; }
        [ForeignKey("RatedById")]
        [JsonIgnore]
        public Employee? RatedBy { get; set; }
    }
} 