using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class ReviewCycle
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }
        [MaxLength(50)]
        public string? Type { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        [JsonIgnore]
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
} 