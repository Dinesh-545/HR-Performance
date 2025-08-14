using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public required string Username { get; set; }
        [Required]
        public required string PasswordHash { get; set; }
        [Required]
        [MaxLength(50)]
        public required string Role { get; set; }
        public int EmployeeId { get; set; }

        [ForeignKey("EmployeeId")]
        [JsonIgnore]
        public Employee? Employee { get; set; }
    }
} 