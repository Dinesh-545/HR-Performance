using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        [Required]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;
        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = string.Empty;
        public int? ManagerId { get; set; }
        public int? DepartmentId { get; set; }

        [ForeignKey("ManagerId")]
        [JsonIgnore]
        public Employee? Manager { get; set; }
        [JsonIgnore]
        public ICollection<Employee> Subordinates { get; set; } = new List<Employee>();
        public Department? Department { get; set; }
    }
} 