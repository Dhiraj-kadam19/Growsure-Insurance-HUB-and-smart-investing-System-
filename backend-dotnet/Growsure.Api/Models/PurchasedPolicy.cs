using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("purchased_policies")]
    public class PurchasedPolicy
    {
        [Key]
        [Column("purchase_id")]
        public int Id { get; set; }

        [Column("policy_holder_id")]
        public int PolicyHolderId { get; set; }

        [ForeignKey("PolicyHolderId")]
        public PolicyHolder? PolicyHolder { get; set; }

        [Column("policy_id")]
        public int PolicyId { get; set; }

        [ForeignKey("PolicyId")]
        public Policy? Policy { get; set; }

        [Column("start_date")]
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, LAPSED, EXPIRED

        [Required]
        [Column("policy_number")]
        [StringLength(100)]
        public string PolicyNumber { get; set; } = string.Empty;
    }
}
