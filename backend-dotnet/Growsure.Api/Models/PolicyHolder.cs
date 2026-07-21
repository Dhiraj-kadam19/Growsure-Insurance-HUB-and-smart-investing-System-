using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("policy_holders")]
    public class PolicyHolder
    {
        [Key]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [StringLength(12)]
        public string? Aadhaar { get; set; }

        [StringLength(10)]
        public string? Pan { get; set; }

        public DateTime? Dob { get; set; }

        [StringLength(15)]
        public string? Contact { get; set; }

        public string? Address { get; set; }
    }
}
