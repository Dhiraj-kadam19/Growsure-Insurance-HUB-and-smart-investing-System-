using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using BCrypt.Net;
using Growsure.Api.Models;

namespace Growsure.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(GrowsureContext context)
        {
            SeedFundsFromCsv(context);

            if (!context.Users.Any())
            {
                SeedCoreData(context);
            }
            
            EnsureAllPoliciesSeeded(context);
        }

        private static void SeedCoreData(GrowsureContext context)
        {
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("password123");

            var adminUser = new User { Name = "Growsure Admin", Email = "admin@growsure.com", Password = passwordHash, Role = "ADMIN", CreatedAt = DateTime.UtcNow };
            var licUser = new User { Name = "LIC India", Email = "partner@lic.com", Password = passwordHash, Role = "INSURER", CreatedAt = DateTime.UtcNow };
            var hdfcUser = new User { Name = "HDFC Ergo", Email = "partner@hdfcergo.com", Password = passwordHash, Role = "INSURER", CreatedAt = DateTime.UtcNow };
            var amitUser = new User { Name = "Amit Sharma", Email = "amit@growsure.com", Password = passwordHash, Role = "POLICY_HOLDER", CreatedAt = DateTime.UtcNow };
            var nehaUser = new User { Name = "Neha Patel", Email = "neha@growsure.com", Password = passwordHash, Role = "POLICY_HOLDER", CreatedAt = DateTime.UtcNow };

            context.Users.AddRange(adminUser, licUser, hdfcUser, amitUser, nehaUser);
            context.SaveChanges();

            var licInsurer = new Insurer { UserId = licUser.Id, LicenseNumber = "LIC-LIC-100293", CompanyName = "LIC India", Address = "Yogakshema Building, Nariman Point, Mumbai", Status = "APPROVED" };
            var hdfcInsurer = new Insurer { UserId = hdfcUser.Id, LicenseNumber = "HDFC-ERGO-99238", CompanyName = "HDFC Ergo General Insurance", Address = "Peninsula Chambers, Lower Parel, Mumbai", Status = "APPROVED" };

            context.Insurers.AddRange(licInsurer, hdfcInsurer);
            context.SaveChanges();

            var amitHolder = new PolicyHolder { UserId = amitUser.Id, Aadhaar = "123456789012", Pan = "ABCDE1234F", Dob = new DateTime(1998, 5, 15), Contact = "9876543210", Address = "123 Tech Park, Bangalore, India" };
            var nehaHolder = new PolicyHolder { UserId = nehaUser.Id, Aadhaar = "987654321098", Pan = "XYZWP5678G", Dob = new DateTime(1995, 11, 23), Contact = "9123456789", Address = "456 Residency Rd, Mumbai, India" };

            context.PolicyHolders.AddRange(amitHolder, nehaHolder);
            context.SaveChanges();

            var pol1 = new Policy 
            { 
                InsurerId = licInsurer.Id, 
                PolicyName = "LIC Tech Term Plan", 
                Category = "LIFE", 
                CoverageAmount = 10000000, 
                PremiumAmount = 12000, 
                Benefits = "[\"High coverage amount\", \"Tax benefits under Sec 80C\", \"Accidental death benefit rider option\"]",
                Exclusions = "[\"Suicide within 1 year of policy purchase\", \"Self-inflicted injuries\", \"Hazardous sports without rider\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 98.6,
                IsActive = true
            };

            var pol2 = new Policy 
            { 
                InsurerId = licInsurer.Id, 
                PolicyName = "LIC Arogya Rakshak", 
                Category = "HEALTH", 
                CoverageAmount = 500000, 
                PremiumAmount = 8500, 
                Benefits = "[\"Cashless hospitalization\", \"ICU charge coverage\", \"Pre and Post hospitalization expenses up to 60 days\"]",
                Exclusions = "[\"Pre-existing diseases for first 2 years\", \"Cosmetic surgery\", \"Alternative treatments unless specified\"]",
                WaitingPeriodMonths = 24,
                ClaimSettlementRatio = 98.6,
                IsActive = true
            };

            var pol3 = new Policy 
            { 
                InsurerId = hdfcInsurer.Id, 
                PolicyName = "HDFC Ergo Optima Secure", 
                Category = "HEALTH", 
                CoverageAmount = 1000000, 
                PremiumAmount = 15500, 
                Benefits = "[\"Secure Benefit double coverage\", \"Restoration benefit\", \"Zero copay\", \"Global health cover option\"]",
                Exclusions = "[\"Maternity benefit (standard version)\", \"Adventure sports\", \"Weight control surgery\"]",
                WaitingPeriodMonths = 36,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol4 = new Policy 
            { 
                InsurerId = hdfcInsurer.Id, 
                PolicyName = "HDFC Ergo My:Car Secure", 
                Category = "MOTOR", 
                CoverageAmount = 800000, 
                PremiumAmount = 18000, 
                Benefits = "[\"Zero depreciation cover\", \"Engine protection cover\", \"Roadside assistance 24/7\", \"Personal accident cover\"]",
                Exclusions = "[\"Wear and tear of tires\", \"Driving without a valid license\", \"Driving under the influence of alcohol\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol5 = new Policy
            {
                InsurerId = licInsurer.Id,
                PolicyName = "LIC New Jeevan Anand",
                Category = "LIFE",
                CoverageAmount = 5000000,
                PremiumAmount = 18500,
                Benefits = "[\"Combination of protection and savings\", \"Financial support for family in case of death\", \"Lump sum payout at end of policy term\", \"Tax exemption under Sec 80C and 10(10D)\"]",
                Exclusions = "[\"Suicide within first 12 months\", \"Death due to illegal activities\", \"Undeclared hazardous occupations\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 98.6,
                IsActive = true
            };

            var pol6 = new Policy
            {
                InsurerId = licInsurer.Id,
                PolicyName = "LIC Cancer Cover Plan",
                Category = "LIFE",
                CoverageAmount = 2500000,
                PremiumAmount = 6200,
                Benefits = "[\"Fixed benefit health plan for specified early and major stage cancers\", \"Lumpsum benefit on diagnosis\", \"Waiver of premium upon diagnosis\", \"Income benefit for 10 years on major stage cancer\"]",
                Exclusions = "[\"Pre-existing cancer conditions\", \"Sexually transmitted diseases\", \"Radiation contamination\"]",
                WaitingPeriodMonths = 6,
                ClaimSettlementRatio = 98.6,
                IsActive = true
            };

            var pol7 = new Policy
            {
                InsurerId = licInsurer.Id,
                PolicyName = "LIC SIIP Unit Linked Plan",
                Category = "LIFE",
                CoverageAmount = 3000000,
                PremiumAmount = 24000,
                Benefits = "[\"Investment plus life insurance cover\", \"Choice of 4 investment fund options\", \"Guaranteed additions at specified intervals\", \"Partial withdrawal facility after 5 years\"]",
                Exclusions = "[\"Market risks borne by policyholder\", \"Suicide within 1 year\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 98.6,
                IsActive = true
            };

            var pol8 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Energy Diabetes Plan",
                Category = "HEALTH",
                CoverageAmount = 500000,
                PremiumAmount = 11200,
                Benefits = "[\"Day 1 coverage for Diabetes Type 2 & Hypertension\", \"Wellness portal rewards for active health tracking\", \"Cashless treatment across 10,000+ network hospitals\", \"Annual health check-up\"]",
                Exclusions = "[\"Type 1 Diabetes complications if undeclared\", \"Cosmetic surgery\", \"Non-prescription drugs\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol9 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Critical Illness Platinum",
                Category = "HEALTH",
                CoverageAmount = 2000000,
                PremiumAmount = 14800,
                Benefits = "[\"Lump sum payout on diagnosis of 15 major critical illnesses\", \"Includes Stroke, Heart Attack, Cancer, Kidney Failure\", \"No hospital bills submission required\", \"Tax savings under Sec 80D\"]",
                Exclusions = "[\"Diagnosis within first 90 days\", \"Pre-existing critical conditions\", \"Self-inflicted injuries\"]",
                WaitingPeriodMonths = 3,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol10 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Senior Citizen Health Suraksha",
                Category = "HEALTH",
                CoverageAmount = 750000,
                PremiumAmount = 21000,
                Benefits = "[\"Tailored for individuals above 60 years\", \"No pre-policy medical checkup up to age 65\", \"Pre and post hospitalization expenses covered\", \"Organ donor expense coverage\"]",
                Exclusions = "[\"Joint replacement surgery waiting period 2 years\", \"Treatment outside India\", \"Experimental treatments\"]",
                WaitingPeriodMonths = 24,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol11 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Ride Protect Two-Wheeler",
                Category = "MOTOR",
                CoverageAmount = 150000,
                PremiumAmount = 2400,
                Benefits = "[\"Comprehensive cover for 2-wheeler damages and theft\", \"Personal accident cover for owner-driver up to 15 Lakhs\", \"Quick digital claim settlement\", \"Zero depreciation add-on available\"]",
                Exclusions = "[\"Normal wear and tear\", \"Mechanical or electrical breakdown\", \"Consequential loss\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol12 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Commercial Vehicle Guard",
                Category = "MOTOR",
                CoverageAmount = 2500000,
                PremiumAmount = 32000,
                Benefits = "[\"Third-party legal liability cover\", \"Loss or damage to vehicle due to fire, theft, or natural calamity\", \"Towing assistance\", \"Protection for driver and cleaner\"]",
                Exclusions = "[\"Overloading beyond licensed capacity\", \"Vehicle used for illegal carriage\", \"Drunk driving\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol13 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Overseas Travel Shield",
                Category = "TRAVEL",
                CoverageAmount = 3500000,
                PremiumAmount = 4500,
                Benefits = "[\"Emergency medical expenses & evacuation worldwide\", \"Loss of checked-in baggage cover\", \"Flight delay & trip cancellation compensation\", \"Passport loss assistance\"]",
                Exclusions = "[\"Pre-existing ailments\", \"Participation in professional winter sports\", \"Travel against government medical advisory\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol14 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Student Overseas Explorer",
                Category = "TRAVEL",
                CoverageAmount = 5000000,
                PremiumAmount = 8900,
                Benefits = "[\"Comprehensive university-compliant medical cover\", \"Sponsor protection in case of financial emergency\", \"Study interruption coverage\", \"Compassionate visit allowance\"]",
                Exclusions = "[\"Self-inflicted injury\", \"Substance abuse\", \"Routine physical checkups\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol15 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Home Protect Complete",
                Category = "PROPERTY",
                CoverageAmount = 5000000,
                PremiumAmount = 6800,
                Benefits = "[\"Structure and building protection against fire, earthquake, flood\", \"Contents protection for jewelry, electronics, and furniture\", \"Burglary and housebreaking cover\", \"Temporary resettlement allowance\"]",
                Exclusions = "[\"Normal wear and tear and gradual depreciation\", \"Manufacturing defects in appliances\", \"Loss during war or nuclear peril\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol16 = new Policy
            {
                InsurerId = licInsurer.Id,
                PolicyName = "LIC Property & Asset Guard",
                Category = "PROPERTY",
                CoverageAmount = 10000000,
                PremiumAmount = 11500,
                Benefits = "[\"Commercial building & inventory fire protection\", \"Natural calamity and storm destruction cover\", \"Public liability cover for visitor accidents\", \"Business interruption loss coverage\"]",
                Exclusions = "[\"Willful destruction of property\", \"Seizure by government authority\", \"Shortage due to clerical errors\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 98.6,
                IsActive = true
            };

            var pol17 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Cyber Safe Family Shield",
                Category = "CYBER",
                CoverageAmount = 1000000,
                PremiumAmount = 3800,
                Benefits = "[\"Financial loss protection against online banking and credit card fraud\", \"Identity theft defense & legal expense coverage\", \"Cyberbullying legal consultation and psychological counseling\", \"Phishing and malware attack recovery costs\"]",
                Exclusions = "[\"Gross negligence or sharing OTPs willingly\", \"Cryptocurrency trading losses\", \"Unauthorised commercial activities\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            var pol18 = new Policy
            {
                InsurerId = licInsurer.Id,
                PolicyName = "LIC Krishi Rakshak Crop & Weather Plan",
                Category = "AGRICULTURE",
                CoverageAmount = 500000,
                PremiumAmount = 3200,
                Benefits = "[\"Coverage against localized natural calamities like hail, landslide, inundation\", \"Post-harvest loss protection up to 14 days\", \"Weather index-based drought and excess rainfall payout\", \"Subsidized premium structure\"]",
                Exclusions = "[\"Loss due to war or nuclear risks\", \"Storage loss due to improper warehousing\", \"Malicious damage by policyholder\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 98.6,
                IsActive = true
            };

            var pol19 = new Policy
            {
                InsurerId = hdfcInsurer.Id,
                PolicyName = "HDFC Ergo Shopkeeper Comprehensive Package",
                Category = "BUSINESS",
                CoverageAmount = 3000000,
                PremiumAmount = 9500,
                Benefits = "[\"Protection for shop building, stock, and fixtures against fire & theft\", \"Fidelity guarantee against employee dishonesty\", \"Money in transit and money in safe protection\", \"Plate glass breakage cover\"]",
                Exclusions = "[\"Unexplained inventory shortages\", \"Loss due to war or civil commotion\", \"Defective design of shop structure\"]",
                WaitingPeriodMonths = 0,
                ClaimSettlementRatio = 97.2,
                IsActive = true
            };

            context.Policies.AddRange(pol1, pol2, pol3, pol4, pol5, pol6, pol7, pol8, pol9, pol10, pol11, pol12, pol13, pol14, pol15, pol16, pol17, pol18, pol19);
            context.SaveChanges();

            var purch1 = new PurchasedPolicy { PolicyHolderId = amitHolder.Id, PolicyId = pol1.Id, StartDate = DateTime.UtcNow.AddMonths(-5), EndDate = DateTime.UtcNow.AddYears(29), Status = "ACTIVE", PolicyNumber = "POL-TECH-10029381" };
            var purch2 = new PurchasedPolicy { PolicyHolderId = amitHolder.Id, PolicyId = pol3.Id, StartDate = DateTime.UtcNow.AddMonths(-3), EndDate = DateTime.UtcNow.AddMonths(9), Status = "ACTIVE", PolicyNumber = "POL-OPT-29381029" };
            var purch3 = new PurchasedPolicy { PolicyHolderId = nehaHolder.Id, PolicyId = pol2.Id, StartDate = DateTime.UtcNow.AddMonths(-12), EndDate = DateTime.UtcNow.AddMonths(0), Status = "ACTIVE", PolicyNumber = "POL-AROGYA-3829103" };

            context.PurchasedPolicies.AddRange(purch1, purch2, purch3);
            context.SaveChanges();

            context.Nominees.AddRange(
                new Nominee { PurchaseId = purch1.Id, Name = "Suresh Sharma", Relationship = "Father", Contact = "9876501234" },
                new Nominee { PurchaseId = purch2.Id, Name = "Suresh Sharma", Relationship = "Father", Contact = "9876501234" },
                new Nominee { PurchaseId = purch3.Id, Name = "Ramesh Patel", Relationship = "Spouse", Contact = "9123409876" }
            );
            context.SaveChanges();

            context.Claims.AddRange(
                new Claim { PurchaseId = purch2.Id, ClaimAmount = 45000, Status = "APPROVED", IncidentDetails = "Hospitalized for viral fever treatment", DocumentUrls = "[\"/uploads/bill_1.pdf\", \"/uploads/discharge_summary_1.pdf\"]", FraudScore = 8.5, FraudReasons = "Normal claim behavior, hospital details verified", CreatedAt = DateTime.UtcNow.AddMonths(-2) },
                new Claim { PurchaseId = purch3.Id, ClaimAmount = 120000, Status = "SUBMITTED", IncidentDetails = "Surgery for appendicitis", DocumentUrls = "[\"/uploads/bill_2.pdf\", \"/uploads/reports_2.pdf\"]", FraudScore = 35.0, FraudReasons = "Documents present, awaiting insurer verification", CreatedAt = DateTime.UtcNow.AddDays(-5) },
                new Claim { PurchaseId = purch1.Id, ClaimAmount = 5000000, Status = "REJECTED", IncidentDetails = "Accident death claim - discrepancy in date of incident", DocumentUrls = "[\"/uploads/death_certificate.pdf\"]", FraudScore = 82.0, FraudReasons = "Duplicate certificates submitted; incident timeline contradicts police report", CreatedAt = DateTime.UtcNow.AddMonths(-4) }
            );
            context.SaveChanges();

            context.Transactions.AddRange(
                new Transaction { UserId = amitUser.Id, OrderId = "order_pol_111", PaymentId = "pay_pol_111", Amount = 12000, Status = "SUCCESS", PaymentType = "POLICY_PREMIUM", ReferenceId = purch1.Id, TransactionDate = DateTime.UtcNow.AddMonths(-5) },
                new Transaction { UserId = amitUser.Id, OrderId = "order_pol_222", PaymentId = "pay_pol_222", Amount = 15500, Status = "SUCCESS", PaymentType = "POLICY_PREMIUM", ReferenceId = purch2.Id, TransactionDate = DateTime.UtcNow.AddMonths(-3) },
                new Transaction { UserId = nehaUser.Id, OrderId = "order_pol_333", PaymentId = "pay_pol_333", Amount = 8500, Status = "SUCCESS", PaymentType = "POLICY_PREMIUM", ReferenceId = purch3.Id, TransactionDate = DateTime.UtcNow.AddMonths(-12) }
            );
            context.SaveChanges();

            context.Investments.AddRange(
                new Investment { PolicyHolderId = amitHolder.Id, FundId = context.Funds.First().Id, InvestmentAmount = 15000, SipAmount = 5000, InvestmentType = "SIP", DayOfMonth = 5, StartDate = DateTime.UtcNow.AddMonths(-4), Status = "ACTIVE" },
                new Investment { PolicyHolderId = amitHolder.Id, FundId = context.Funds.Skip(1).First().Id, InvestmentAmount = 50000, SipAmount = 0, InvestmentType = "LUMPSUM", DayOfMonth = 5, StartDate = DateTime.UtcNow.AddMonths(-3), Status = "ACTIVE" },
                new Investment { PolicyHolderId = nehaHolder.Id, FundId = context.Funds.Skip(2).First().Id, InvestmentAmount = 10000, SipAmount = 2000, InvestmentType = "SIP", DayOfMonth = 10, StartDate = DateTime.UtcNow.AddMonths(-6), Status = "ACTIVE" }
            );
            context.SaveChanges();
        }

        private static void SeedFundsFromCsv(GrowsureContext context)
        {
            if (context.Funds.Any())
            {
                return;
            }

            var csvPath = FindCsvPath();
            if (string.IsNullOrWhiteSpace(csvPath) || !File.Exists(csvPath))
            {
                return;
            }

            var funds = new List<Fund>();
            var lines = File.ReadAllLines(csvPath).Where(line => !string.IsNullOrWhiteSpace(line)).ToList();
            if (lines.Count <= 1)
            {
                return;
            }

            foreach (var line in lines.Skip(1))
            {
                var values = ParseCsvLine(line);
                if (values.Count < 20)
                {
                    continue;
                }

                var fund = new Fund
                {
                    FundName = values[0].Trim(),
                    MinSip = ParseDouble(values[1], 500),
                    MinLumpsum = ParseDouble(values[2], 1000),
                    ExpenseRatio = ParseDouble(values[3]),
                    AumCrores = ParseDouble(values[4]),
                    FundAgeYr = ParseInt(values[5]),
                    FundManager = values[6].Trim(),
                    Sortino = ParseNullableDouble(values[7]),
                    Alpha = ParseNullableDouble(values[8]),
                    Sd = ParseNullableDouble(values[9]),
                    Beta = ParseNullableDouble(values[10]),
                    Sharpe = ParseNullableDouble(values[11]),
                    RiskScore = NormalizeRisk(values[12]),
                    AmcName = values[13].Trim(),
                    Rating = ParseInt(values[14], 3),
                    Category = values[15].Trim(),
                    SubCategory = values[16].Trim(),
                    Returns1Yr = ParseDouble(values[17]),
                    Returns3Yr = ParseDouble(values[18]),
                    Returns5Yr = ParseDouble(values[19]),
                    Cagr = GetCagr(values[17], values[18], values[19]),
                    HistoricalReturns = JsonSerializer.Serialize(new Dictionary<string, double?>
                    {
                        ["1Y"] = ParseNullableDouble(values[17]),
                        ["3Y"] = ParseNullableDouble(values[18]),
                        ["5Y"] = ParseNullableDouble(values[19])
                    })
                };

                funds.Add(fund);
            }

            if (funds.Count > 0)
            {
                context.Funds.AddRange(funds);
                context.SaveChanges();
            }
        }

        private static string? FindCsvPath()
        {
            var searchPaths = new[]
            {
                Path.Combine(Directory.GetCurrentDirectory(), "db", "comprehensive_mutual_funds_data.csv"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "db", "comprehensive_mutual_funds_data.csv"),
                Path.Combine(AppContext.BaseDirectory, "db", "comprehensive_mutual_funds_data.csv"),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "db", "comprehensive_mutual_funds_data.csv"),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "db", "comprehensive_mutual_funds_data.csv"),
                @"c:\Users\hp\Downloads\growsure\growsure\db\comprehensive_mutual_funds_data.csv"
            };

            foreach (var candidate in searchPaths)
            {
                try
                {
                    if (File.Exists(candidate))
                    {
                        return Path.GetFullPath(candidate);
                    }
                }
                catch { }
            }

            var current = new DirectoryInfo(AppContext.BaseDirectory);
            while (current != null)
            {
                var candidate = Path.Combine(current.FullName, "db", "comprehensive_mutual_funds_data.csv");
                if (File.Exists(candidate))
                {
                    return Path.GetFullPath(candidate);
                }

                candidate = Path.Combine(current.FullName, "..", "..", "..", "..", "db", "comprehensive_mutual_funds_data.csv");
                if (File.Exists(candidate))
                {
                    return Path.GetFullPath(candidate);
                }

                current = current.Parent;
            }

            return null;
        }

        private static List<string> ParseCsvLine(string line)
        {
            var values = new List<string>();
            var current = new StringBuilder();
            var inQuotes = false;

            for (var index = 0; index < line.Length; index++)
            {
                var ch = line[index];
                if (ch == '"')
                {
                    if (index + 1 < line.Length && line[index + 1] == '"')
                    {
                        current.Append('"');
                        index++;
                    }
                    else
                    {
                        inQuotes = !inQuotes;
                    }
                }
                else if (ch == ',' && !inQuotes)
                {
                    values.Add(current.ToString().Trim());
                    current.Clear();
                }
                else
                {
                    current.Append(ch);
                }
            }

            values.Add(current.ToString().Trim());
            return values;
        }

        private static int NormalizeRisk(string riskLevel)
        {
            if (int.TryParse(riskLevel, out var parsed))
            {
                return Math.Clamp(parsed, 1, 6);
            }

            return 3;
        }

        private static double GetCagr(string oneYear, string threeYear, string fiveYear)
        {
            return ParseNullableDouble(threeYear) ?? ParseNullableDouble(fiveYear) ?? ParseNullableDouble(oneYear) ?? 0;
        }

        private static int ParseInt(string value, int defaultValue = 0)
        {
            if (int.TryParse(value, out var res)) return res;
            return defaultValue;
        }

        private static double ParseDouble(string value, double defaultValue = 0)
        {
            return ParseNullableDouble(value) ?? defaultValue;
        }

        private static double? ParseNullableDouble(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value == "-")
            {
                return null;
            }

            if (double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var result))
            {
                return result;
            }

            return null;
        }

        private static void EnsureAllPoliciesSeeded(GrowsureContext context)
        {
            var existingNames = context.Policies.Select(p => p.PolicyName).ToHashSet();
            var licInsurer = context.Insurers.FirstOrDefault(i => i.CompanyName.Contains("LIC")) 
                             ?? context.Insurers.FirstOrDefault();
            var hdfcInsurer = context.Insurers.FirstOrDefault(i => i.CompanyName.Contains("HDFC")) 
                              ?? context.Insurers.LastOrDefault();

            if (licInsurer == null || hdfcInsurer == null) return;

            var policiesToEnsure = new List<Policy>
            {
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Tech Term Plan", Category = "LIFE", CoverageAmount = 10000000, PremiumAmount = 12000, Benefits = "[\"High coverage amount\", \"Tax benefits under Sec 80C\", \"Accidental death benefit rider option\"]", Exclusions = "[\"Suicide within 1 year of policy purchase\", \"Self-inflicted injuries\", \"Hazardous sports without rider\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Arogya Rakshak", Category = "HEALTH", CoverageAmount = 500000, PremiumAmount = 8500, Benefits = "[\"Cashless hospitalization\", \"ICU charge coverage\", \"Pre and Post hospitalization expenses up to 60 days\"]", Exclusions = "[\"Pre-existing diseases for first 2 years\", \"Cosmetic surgery\", \"Alternative treatments unless specified\"]", WaitingPeriodMonths = 24, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Optima Secure", Category = "HEALTH", CoverageAmount = 1000000, PremiumAmount = 15500, Benefits = "[\"Secure Benefit double coverage\", \"Restoration benefit\", \"Zero copay\", \"Global health cover option\"]", Exclusions = "[\"Maternity benefit (standard version)\", \"Adventure sports\", \"Weight control surgery\"]", WaitingPeriodMonths = 36, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo My:Car Secure", Category = "MOTOR", CoverageAmount = 800000, PremiumAmount = 18000, Benefits = "[\"Zero depreciation cover\", \"Engine protection cover\", \"Roadside assistance 24/7\", \"Personal accident cover\"]", Exclusions = "[\"Wear and tear of tires\", \"Driving without a valid license\", \"Driving under the influence of alcohol\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC New Jeevan Anand", Category = "LIFE", CoverageAmount = 5000000, PremiumAmount = 18500, Benefits = "[\"Combination of protection and savings\", \"Financial support for family in case of death\", \"Lump sum payout at end of policy term\", \"Tax exemption under Sec 80C and 10(10D)\"]", Exclusions = "[\"Suicide within first 12 months\", \"Death due to illegal activities\", \"Undeclared hazardous occupations\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Cancer Cover Plan", Category = "LIFE", CoverageAmount = 2500000, PremiumAmount = 6200, Benefits = "[\"Fixed benefit health plan for specified early and major stage cancers\", \"Lumpsum benefit on diagnosis\", \"Waiver of premium upon diagnosis\", \"Income benefit for 10 years on major stage cancer\"]", Exclusions = "[\"Pre-existing cancer conditions\", \"Sexually transmitted diseases\", \"Radiation contamination\"]", WaitingPeriodMonths = 6, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC SIIP Unit Linked Plan", Category = "LIFE", CoverageAmount = 3000000, PremiumAmount = 24000, Benefits = "[\"Investment plus life insurance cover\", \"Choice of 4 investment fund options\", \"Guaranteed additions at specified intervals\", \"Partial withdrawal facility after 5 years\"]", Exclusions = "[\"Market risks borne by policyholder\", \"Suicide within 1 year\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Energy Diabetes Plan", Category = "HEALTH", CoverageAmount = 500000, PremiumAmount = 11200, Benefits = "[\"Day 1 coverage for Diabetes Type 2 & Hypertension\", \"Wellness portal rewards for active health tracking\", \"Cashless treatment across 10,000+ network hospitals\", \"Annual health check-up\"]", Exclusions = "[\"Type 1 Diabetes complications if undeclared\", \"Cosmetic surgery\", \"Non-prescription drugs\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Critical Illness Platinum", Category = "HEALTH", CoverageAmount = 2000000, PremiumAmount = 14800, Benefits = "[\"Lump sum payout on diagnosis of 15 major critical illnesses\", \"Includes Stroke, Heart Attack, Cancer, Kidney Failure\", \"No hospital bills submission required\", \"Tax savings under Sec 80D\"]", Exclusions = "[\"Diagnosis within first 90 days\", \"Pre-existing critical conditions\", \"Self-inflicted injuries\"]", WaitingPeriodMonths = 3, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Senior Citizen Health Suraksha", Category = "HEALTH", CoverageAmount = 750000, PremiumAmount = 21000, Benefits = "[\"Tailored for individuals above 60 years\", \"No pre-policy medical checkup up to age 65\", \"Pre and post hospitalization expenses covered\", \"Organ donor expense coverage\"]", Exclusions = "[\"Joint replacement surgery waiting period 2 years\", \"Treatment outside India\", \"Experimental treatments\"]", WaitingPeriodMonths = 24, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Ride Protect Two-Wheeler", Category = "MOTOR", CoverageAmount = 150000, PremiumAmount = 2400, Benefits = "[\"Comprehensive cover for 2-wheeler damages and theft\", \"Personal accident cover for owner-driver up to 15 Lakhs\", \"Quick digital claim settlement\", \"Zero depreciation add-on available\"]", Exclusions = "[\"Normal wear and tear\", \"Mechanical or electrical breakdown\", \"Consequential loss\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Commercial Vehicle Guard", Category = "MOTOR", CoverageAmount = 2500000, PremiumAmount = 32000, Benefits = "[\"Third-party legal liability cover\", \"Loss or damage to vehicle due to fire, theft, or natural calamity\", \"Towing assistance\", \"Protection for driver and cleaner\"]", Exclusions = "[\"Overloading beyond licensed capacity\", \"Vehicle used for illegal carriage\", \"Drunk driving\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Overseas Travel Shield", Category = "TRAVEL", CoverageAmount = 3500000, PremiumAmount = 4500, Benefits = "[\"Emergency medical expenses & evacuation worldwide\", \"Loss of checked-in baggage cover\", \"Flight delay & trip cancellation compensation\", \"Passport loss assistance\"]", Exclusions = "[\"Pre-existing ailments\", \"Participation in professional winter sports\", \"Travel against government medical advisory\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Student Overseas Explorer", Category = "TRAVEL", CoverageAmount = 5000000, PremiumAmount = 8900, Benefits = "[\"Comprehensive university-compliant medical cover\", \"Sponsor protection in case of financial emergency\", \"Study interruption coverage\", \"Compassionate visit allowance\"]", Exclusions = "[\"Self-inflicted injury\", \"Substance abuse\", \"Routine physical checkups\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Home Protect Complete", Category = "PROPERTY", CoverageAmount = 5000000, PremiumAmount = 6800, Benefits = "[\"Structure and building protection against fire, earthquake, flood\", \"Contents protection for jewelry, electronics, and furniture\", \"Burglary and housebreaking cover\", \"Temporary resettlement allowance\"]", Exclusions = "[\"Normal wear and tear and gradual depreciation\", \"Manufacturing defects in appliances\", \"Loss during war or nuclear peril\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Property & Asset Guard", Category = "PROPERTY", CoverageAmount = 10000000, PremiumAmount = 11500, Benefits = "[\"Commercial building & inventory fire protection\", \"Natural calamity and storm destruction cover\", \"Public liability cover for visitor accidents\", \"Business interruption loss coverage\"]", Exclusions = "[\"Willful destruction of property\", \"Seizure by government authority\", \"Shortage due to clerical errors\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Cyber Safe Family Shield", Category = "CYBER", CoverageAmount = 1000000, PremiumAmount = 3800, Benefits = "[\"Financial loss protection against online banking and credit card fraud\", \"Identity theft defense & legal expense coverage\", \"Cyberbullying legal consultation and psychological counseling\", \"Phishing and malware attack recovery costs\"]", Exclusions = "[\"Gross negligence or sharing OTPs willingly\", \"Cryptocurrency trading losses\", \"Unauthorised commercial activities\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Krishi Rakshak Crop & Weather Plan", Category = "AGRICULTURE", CoverageAmount = 500000, PremiumAmount = 3200, Benefits = "[\"Coverage against localized natural calamities like hail, landslide, inundation\", \"Post-harvest loss protection up to 14 days\", \"Weather index-based drought and excess rainfall payout\", \"Subsidized premium structure\"]", Exclusions = "[\"Loss due to war or nuclear risks\", \"Storage loss due to improper warehousing\", \"Malicious damage by policyholder\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Shopkeeper Comprehensive Package", Category = "BUSINESS", CoverageAmount = 3000000, PremiumAmount = 9500, Benefits = "[\"Protection for shop building, stock, and fixtures against fire & theft\", \"Fidelity guarantee against employee dishonesty\", \"Money in transit and money in safe protection\", \"Plate glass breakage cover\"]", Exclusions = "[\"Unexplained inventory shortages\", \"Loss due to war or civil commotion\", \"Defective design of shop structure\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Jeevan Umang Whole Life Plan", Category = "LIFE", CoverageAmount = 10000000, PremiumAmount = 35000, Benefits = "[\"100% Guaranteed annual survival benefits after premium payment term\", \"Lumpsum payout at age 100 or on death\", \"High risk cover and tax exemption under Sec 80C\"]", Exclusions = "[\"Suicide within 1 year\", \"Undeclared pre-existing life-threatening illness\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Bima Jyoti Guaranteed Return", Category = "LIFE", CoverageAmount = 2500000, PremiumAmount = 16000, Benefits = "[\"Guaranteed additions of Rs. 50 per thousand sum assured every year\", \"Financial security for family\", \"Loan facility after 2 years\"]", Exclusions = "[\"Suicide within 1 year\", \"Hazardous activities without declaration\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Optima Super Top-Up", Category = "HEALTH", CoverageAmount = 2000000, PremiumAmount = 6500, Benefits = "[\"High coverage enhancement over base health policy\", \"Deductible flexi-options from 3L to 10L\", \"Zero copay across network hospitals\"]", Exclusions = "[\"Pre-existing conditions until deductible is met\", \"Cosmetic procedures\"]", WaitingPeriodMonths = 12, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Vector-Borne Disease Shield", Category = "HEALTH", CoverageAmount = 100000, PremiumAmount = 1200, Benefits = "[\"Lump sum payout on hospitalization for Dengue, Malaria, Chikungunya, Zika\", \"No complicated bill verification\", \"Instant claim processing\"]", Exclusions = "[\"Outpatient treatment without 24hr hospitalization\", \"Self-medication complications\"]", WaitingPeriodMonths = 1, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo DriveSmart EV Protect", Category = "MOTOR", CoverageAmount = 1200000, PremiumAmount = 22000, Benefits = "[\"Specialized EV battery & electric motor replacement cover\", \"Charger and charging cable theft protection\", \"24/7 EV roadside towing to nearest charging station\"]", Exclusions = "[\"Overcharging damage due to unauthorized modifications\", \"Driving without valid license\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Fleet Commercial Transport Guard", Category = "MOTOR", CoverageAmount = 5000000, PremiumAmount = 65000, Benefits = "[\"Comprehensive fleet protection for trucks and lorries\", \"Third party liability plus goods transport loss\", \"Driver and co-driver accident shield\"]", Exclusions = "[\"Overloading beyond RTO limit\", \"Drunk driving\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Annual Multi-Trip Global Business Travel", Category = "TRAVEL", CoverageAmount = 10000000, PremiumAmount = 19500, Benefits = "[\"Unlimited overseas business trips coverage in a single year\", \"Emergency medical, evacuation, and trip cancellation cover\", \"Baggage loss and delay reimbursement\"]", Exclusions = "[\"Pre-existing medical conditions\", \"Travel to active war zones\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Asia Leisure Travel Protect", Category = "TRAVEL", CoverageAmount = 1500000, PremiumAmount = 2800, Benefits = "[\"Targeted cover for travel across South East Asia & GCC countries\", \"Medical emergency cashless hospitalization\", \"Loss of passport & flight delay cover\"]", Exclusions = "[\"Extreme sports without rider\", \"Illegal activities\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Solar Panel & Green Energy Protect", Category = "PROPERTY", CoverageAmount = 3500000, PremiumAmount = 8200, Benefits = "[\"Protection for rooftop solar systems against hail, storm, fire, and lightning\", \"Loss of power generation revenue compensation\", \"Third-party damage liability\"]", Exclusions = "[\"Faulty installation or manufacturer defect\", \"Normal wear and tear\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Warehousing & Industrial Asset Guard", Category = "PROPERTY", CoverageAmount = 20000000, PremiumAmount = 28000, Benefits = "[\"Comprehensive factory and warehouse structure insurance\", \"Raw material & finished goods inventory protection\", \"Machinery breakdown cover\"]", Exclusions = "[\"Willful negligence\", \"Unexplained inventory shrinkage\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Cyber Extortion & Ransom Protection", Category = "CYBER", CoverageAmount = 5000000, PremiumAmount = 12500, Benefits = "[\"Ransomware attack financial loss recovery\", \"Professional IT forensics & data recovery expenses\", \"Crisis management and legal defense costs\"]", Exclusions = "[\"System vulnerabilities left unpatched deliberately\", \"Insider criminal fraud\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Pashu Dhan Cattle & Livestock Shield", Category = "AGRICULTURE", CoverageAmount = 200000, PremiumAmount = 1800, Benefits = "[\"Financial compensation on loss of cattle due to disease or accident\", \"Permanent total disability cover for milch animals\", \"Veterinary care fee allowance\"]", Exclusions = "[\"Slaughter without veterinary recommendation\", \"Pre-existing unmanaged epidemics\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Directors & Officers (D&O) Liability", Category = "BUSINESS", CoverageAmount = 10000000, PremiumAmount = 45000, Benefits = "[\"Legal defense cost reimbursement for company directors\", \"Protection against shareholder or regulatory lawsuits\", \"Employment practices liability cover\"]", Exclusions = "[\"Proven fraudulent or dishonest acts\", \"Fines and penalties imposed by criminal courts\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Pet Health & Casualty Shield", Category = "HEALTH", CoverageAmount = 300000, PremiumAmount = 3900, Benefits = "[\"Surgery and hospitalization expense coverage for dogs and cats\", \"Third-party bite liability protection\", \"Lost pet advertising and reward allowance\"]", Exclusions = "[\"Pre-existing hereditary diseases\", \"Cosmetic tail docking or ear cropping\"]", WaitingPeriodMonths = 1, ClaimSettlementRatio = 97.2, IsActive = true },
                new Policy { InsurerId = licInsurer.Id, PolicyName = "LIC Saral Pension Plan", Category = "LIFE", CoverageAmount = 4000000, PremiumAmount = 28000, Benefits = "[\"Standard immediate annuity with 100% return of purchase price\", \"Guaranteed monthly pension payouts for lifetime\", \"Joint life option for spouse pension\"]", Exclusions = "[\"Cancellation after free-look period without medical emergency\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 98.6, IsActive = true },
                new Policy { InsurerId = hdfcInsurer.Id, PolicyName = "HDFC Ergo Super Personal Accident Guard", Category = "LIFE", CoverageAmount = 5000000, PremiumAmount = 5500, Benefits = "[\"100% sum insured payout on accidental death or permanent total disability\", \"Child education grant & fracture care allowance\", \"Worldwide 24/7 coverage\"]", Exclusions = "[\"Injuries due to participation in illegal racing\", \"Alcoholic intoxication accidents\"]", WaitingPeriodMonths = 0, ClaimSettlementRatio = 97.2, IsActive = true }
            };

            var missingPolicies = policiesToEnsure.Where(p => !existingNames.Contains(p.PolicyName)).ToList();
            if (missingPolicies.Any())
            {
                context.Policies.AddRange(missingPolicies);
                context.SaveChanges();
            }
        }
    }
}
