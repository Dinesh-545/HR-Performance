using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class Department
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }
        [JsonIgnore]
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
} 