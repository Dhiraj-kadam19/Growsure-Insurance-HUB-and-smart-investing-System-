using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("policies")]
    public class Policy
    {
        [Key]
        [Column("policy_id")]
        public int Id { get; set; }

        [Column("insurer_id")]
        public int InsurerId { get; set; }

        [ForeignKey("InsurerId")]
        public Insurer? Insurer { get; set; }

        [Required]
        [Column("policy_name")]
        [StringLength(255)]
        public string PolicyName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty; // HEALTH, LIFE, MOTOR, TRAVEL

        [Column("coverage_amount")]
        public double CoverageAmount { get; set; }

        [Column("premium_amount")]
        public double PremiumAmount { get; set; }

        public string? Benefits { get; set; } // JSON or text

        public string? Exclusions { get; set; } // JSON or text

        [Column("waiting_period_months")]
        public int WaitingPeriodMonths { get; set; } = 0;

        [Column("claim_settlement_ratio")]
        public double ClaimSettlementRatio { get; set; } = 95.0;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;
    }
}
