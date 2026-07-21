using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("insurers")]
    public class Insurer
    {
        [Key]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [Column("license_number")]
        [StringLength(100)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required]
        [Column("company_name")]
        [StringLength(255)]
        public string CompanyName { get; set; } = string.Empty;

        public string? Address { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED
    }
}
