using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Growsure.Api.Models
{
    [Table("funds")]
    public class Fund
    {
        [Key]
        [Column("fund_id")]
        public int Id { get; set; }

        [Required]
        [Column("fund_name")]
        [StringLength(255)]
        public string FundName { get; set; } = string.Empty;

        [Required]
        [Column("category")]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty; // Equity, Debt, Hybrid, Solution Oriented, Other

        [Column("sub_category")]
        [StringLength(150)]
        public string? SubCategory { get; set; }

        [Column("amc_name")]
        [StringLength(255)]
        public string? AmcName { get; set; }

        [Column("min_sip")]
        public double MinSip { get; set; } = 500;

        [Column("min_lumpsum")]
        public double MinLumpsum { get; set; } = 1000;

        [Column("risk_score")]
        public int RiskScore { get; set; } = 3; // 1 to 6

        [Column("cagr")]
        public double Cagr { get; set; }

        [Column("returns_1yr")]
        public double Returns1Yr { get; set; }

        [Column("returns_3yr")]
        public double Returns3Yr { get; set; }

        [Column("returns_5yr")]
        public double Returns5Yr { get; set; }

        [Column("expense_ratio")]
        public double ExpenseRatio { get; set; }

        [Column("aum_crores")]
        public double AumCrores { get; set; }

        [Column("fund_age_yr")]
        public int FundAgeYr { get; set; }

        [Column("fund_manager")]
        [StringLength(255)]
        public string? FundManager { get; set; }

        [Column("rating")]
        public int Rating { get; set; } = 3;

        [Column("sortino")]
        public double? Sortino { get; set; }

        [Column("alpha")]
        public double? Alpha { get; set; }

        [Column("sd")]
        public double? Sd { get; set; }

        [Column("beta")]
        public double? Beta { get; set; }

        [Column("sharpe")]
        public double? Sharpe { get; set; }

        [Column("historical_returns")]
        public string? HistoricalReturns { get; set; } // JSON returns
    }
}
