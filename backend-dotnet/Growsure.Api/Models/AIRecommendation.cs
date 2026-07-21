using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("ai_recommendations")]
    public class AIRecommendation
    {
        [Key]
        [Column("recommendation_id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [Column("recommendation_type")]
        [StringLength(100)]
        public string RecommendationType { get; set; } = string.Empty; // POLICY, FUND, FINANCIAL_PLAN

        [Column("input_criteria")]
        public string? InputCriteria { get; set; } // JSON

        [Column("output_recommendation")]
        public string? OutputRecommendation { get; set; } // JSON

        [Column("generated_date")]
        public DateTime GeneratedDate { get; set; } = DateTime.UtcNow;
    }
}
