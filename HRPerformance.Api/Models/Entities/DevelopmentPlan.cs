using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class DevelopmentPlan
    {
        [Key]
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string? Action { get; set; }
        public string? ResourceLink { get; set; }
        public string? Notes { get; set; }

        [ForeignKey("EmployeeId")]
        [JsonIgnore]
        public Employee? Employee { get; set; }
    }
} 