using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("transactions")]
    public class Transaction
    {
        [Key]
        [Column("transaction_id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [Column("order_id")]
        [StringLength(255)]
        public string OrderId { get; set; } = string.Empty;

        [Column("payment_id")]
        [StringLength(255)]
        public string? PaymentId { get; set; }

        [Column("amount")]
        public double Amount { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "PENDING"; // PENDING, SUCCESS, FAILED

        [Required]
        [Column("payment_type")]
        [StringLength(100)]
        public string PaymentType { get; set; } = string.Empty; // POLICY_PREMIUM, MUTUAL_FUND_SIP, MUTUAL_FUND_LUMPSUM

        [Column("reference_id")]
        public int? ReferenceId { get; set; } // policy_purchase_id or investment_id

        [Column("transaction_date")]
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    }
}
