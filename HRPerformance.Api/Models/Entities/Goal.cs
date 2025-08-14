using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class Goal
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty;
        public int EmployeeId { get; set; }
        public int? ManagerId { get; set; }
        public int? Progress { get; set; }
        [MaxLength(1000)]
        public string Notes { get; set; } = string.Empty;

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }
        [ForeignKey("ManagerId")]
        public Employee? Manager { get; set; }
    }
} 