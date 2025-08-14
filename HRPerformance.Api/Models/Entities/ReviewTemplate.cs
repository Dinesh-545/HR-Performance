using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class ReviewTemplate
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }
        public string? StructureJson { get; set; }
        [JsonIgnore]
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
} 