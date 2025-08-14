using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HRPerformance.Api.Models.Entities
{
    public class Review
    {
        [Key]
        public int Id { get; set; }
        public int CycleId { get; set; }
        public int? ReviewerId { get; set; }
        public int? RevieweeId { get; set; }
        public int TemplateId { get; set; }
        public int Rating { get; set; }
        public string? Comments { get; set; }
        public string? AttachmentPath { get; set; }
        public bool IsLocked { get; set; }

        [ForeignKey("ReviewerId")]
        [JsonIgnore]
        public Employee? Reviewer { get; set; }
        [ForeignKey("RevieweeId")]
        [JsonIgnore]
        public Employee? Reviewee { get; set; }
        [ForeignKey("CycleId")]
        [JsonIgnore]
        public ReviewCycle? Cycle { get; set; }
        [ForeignKey("TemplateId")]
        [JsonIgnore]
        public ReviewTemplate? Template { get; set; }
    }
} 