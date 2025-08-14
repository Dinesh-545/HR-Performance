using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class EmployeeSkill
    {
        [Key]
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int SkillId { get; set; }
        public int ProficiencyLevel { get; set; }

        [ForeignKey("EmployeeId")]
        [JsonIgnore]
        public Employee? Employee { get; set; }
        [ForeignKey("SkillId")]
        [JsonIgnore]
        public Skill? Skill { get; set; }
    }
} 