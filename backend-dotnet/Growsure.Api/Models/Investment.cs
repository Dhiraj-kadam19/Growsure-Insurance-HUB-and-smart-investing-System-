using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("investments")]
    public class Investment
    {
        [Key]
        [Column("investment_id")]
        public int Id { get; set; }

        [Column("policy_holder_id")]
        public int PolicyHolderId { get; set; }

        [ForeignKey("PolicyHolderId")]
        public PolicyHolder? PolicyHolder { get; set; }

        [Column("fund_id")]
        public int FundId { get; set; }

        [ForeignKey("FundId")]
        public Fund? Fund { get; set; }

        [Column("investment_amount")]
        public double InvestmentAmount { get; set; }

        [Column("sip_amount")]
        public double SipAmount { get; set; } = 0.0;

        [Required]
        [Column("investment_type")]
        [StringLength(50)]
        public string InvestmentType { get; set; } = string.Empty; // SIP, LUMPSUM

        [Column("day_of_month")]
        public int DayOfMonth { get; set; } = 5;

        [Column("start_date")]
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, COMPLETED
    }
}
