using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("claims")]
    public class Claim
    {
        [Key]
        [Column("claim_id")]
        public int Id { get; set; }

        [Column("purchase_id")]
        public int PurchaseId { get; set; }

        [ForeignKey("PurchaseId")]
        public PurchasedPolicy? PurchasedPolicy { get; set; }

        [Column("claim_amount")]
        public double ClaimAmount { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "SUBMITTED"; // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED

        [Column("incident_details")]
        public string? IncidentDetails { get; set; }

        [Column("document_urls")]
        public string? DocumentUrls { get; set; } // JSON array of document file paths

        [Column("fraud_score")]
        public double FraudScore { get; set; } = 0.0;

        [Column("fraud_reasons")]
        public string? FraudReasons { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
