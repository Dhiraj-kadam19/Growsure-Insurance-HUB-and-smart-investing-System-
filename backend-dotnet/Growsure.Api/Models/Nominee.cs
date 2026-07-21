using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("nominees")]
    public class Nominee
    {
        [Key]
        [Column("nominee_id")]
        public int Id { get; set; }

        [Column("purchase_id")]
        public int PurchaseId { get; set; }

        [ForeignKey("PurchaseId")]
        public PurchasedPolicy? PurchasedPolicy { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Relationship { get; set; } = string.Empty;

        [StringLength(15)]
        public string? Contact { get; set; }
    }
}
