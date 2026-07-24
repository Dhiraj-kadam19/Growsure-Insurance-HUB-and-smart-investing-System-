using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Growsure.Api.Data;
using Growsure.Api.Models;

namespace Growsure.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvestmentsController : ControllerBase
    {
        private readonly GrowsureContext _context;

        public InvestmentsController(GrowsureContext context)
        {
            _context = context;
        }

        public class InvestmentDto
        {
            public int FundId { get; set; }
            public double InvestmentAmount { get; set; }
            public double SipAmount { get; set; }
            public string InvestmentType { get; set; } = "LUMPSUM"; // SIP, LUMPSUM
            public int DayOfMonth { get; set; } = 5;
        }

        [HttpGet("funds")]
        public async Task<IActionResult> GetFunds(
            [FromQuery] string? category,
            [FromQuery] string? subCategory,
            [FromQuery] string? amc,
            [FromQuery] string? search,
            [FromQuery] int? minRating,
            [FromQuery] int? maxRisk,
            [FromQuery] string? sortBy,
            [FromQuery] string? sortOrder = "desc")
        {
            var query = _context.Funds.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                var catLower = category.Trim().ToLower();
                query = query.Where(f => f.Category.ToLower().Contains(catLower) || (f.SubCategory != null && f.SubCategory.ToLower().Contains(catLower)));
            }

            if (!string.IsNullOrWhiteSpace(subCategory))
            {
                var subLower = subCategory.Trim().ToLower();
                query = query.Where(f => f.SubCategory != null && f.SubCategory.ToLower().Contains(subLower));
            }

            if (!string.IsNullOrWhiteSpace(amc))
            {
                var amcLower = amc.Trim().ToLower();
                query = query.Where(f => f.AmcName != null && f.AmcName.ToLower().Contains(amcLower));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(f => f.FundName.ToLower().Contains(s) || 
                                         (f.AmcName != null && f.AmcName.ToLower().Contains(s)) ||
                                         (f.SubCategory != null && f.SubCategory.ToLower().Contains(s)) ||
                                         (f.FundManager != null && f.FundManager.ToLower().Contains(s)));
            }

            if (minRating.HasValue)
            {
                query = query.Where(f => f.Rating >= minRating.Value);
            }

            if (maxRisk.HasValue)
            {
                query = query.Where(f => f.RiskScore <= maxRisk.Value);
            }

            bool isAsc = string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);

            query = (sortBy?.ToLower()) switch
            {
                "rating" => isAsc ? query.OrderBy(f => f.Rating) : query.OrderByDescending(f => f.Rating),
                "aum" => isAsc ? query.OrderBy(f => f.AumCrores) : query.OrderByDescending(f => f.AumCrores),
                "risk" => isAsc ? query.OrderBy(f => f.RiskScore) : query.OrderByDescending(f => f.RiskScore),
                "returns1yr" => isAsc ? query.OrderBy(f => f.Returns1Yr) : query.OrderByDescending(f => f.Returns1Yr),
                "returns3yr" => isAsc ? query.OrderBy(f => f.Returns3Yr) : query.OrderByDescending(f => f.Returns3Yr),
                "returns5yr" => isAsc ? query.OrderBy(f => f.Returns5Yr) : query.OrderByDescending(f => f.Returns5Yr),
                "expenseratio" => isAsc ? query.OrderBy(f => f.ExpenseRatio) : query.OrderByDescending(f => f.ExpenseRatio),
                _ => isAsc ? query.OrderBy(f => f.Cagr) : query.OrderByDescending(f => f.Cagr),
            };

            return Ok(await query.ToListAsync());
        }

        public class BatchInvestmentDto
        {
            public string PaymentMethod { get; set; } = "UPI";
            public string PaymentDetails { get; set; } = string.Empty;
            public List<InvestmentDto> Investments { get; set; } = new();
        }

        [HttpPost("batch")]
        [Authorize(Roles = "POLICY_HOLDER")]
        public async Task<IActionResult> MakeBatchInvestments([FromBody] BatchInvestmentDto dto)
        {
            var email = User.Identity?.Name;
            var holder = await _context.PolicyHolders.Include(h => h.User).FirstOrDefaultAsync(h => h.User!.Email == email);
            if (holder == null)
            {
                holder = await _context.PolicyHolders.Include(h => h.User).FirstOrDefaultAsync();
            }
            if (holder == null) return NotFound("Customer profile not found");

            double totalAmount = 0;
            var createdInvestments = new List<Investment>();

            foreach (var item in dto.Investments)
            {
                var fund = await _context.Funds.FindAsync(item.FundId);
                if (fund == null) continue;

                var investment = new Investment
                {
                    PolicyHolderId = holder.Id,
                    FundId = item.FundId,
                    InvestmentAmount = item.InvestmentAmount,
                    SipAmount = item.SipAmount,
                    InvestmentType = item.InvestmentType,
                    DayOfMonth = item.DayOfMonth,
                    Status = "ACTIVE",
                    StartDate = DateTime.UtcNow
                };

                _context.Investments.Add(investment);
                createdInvestments.Add(investment);

                double amount = item.InvestmentType.Equals("SIP", StringComparison.OrdinalIgnoreCase) ? item.SipAmount : item.InvestmentAmount;
                totalAmount += amount;
            }

            await _context.SaveChangesAsync();

            // Record transaction for payment batch with PaymentMethod
            var transaction = new Transaction
            {
                UserId = holder.UserId,
                OrderId = "order_cart_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                PaymentId = "pay_" + dto.PaymentMethod.ToLower() + "_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                Amount = totalAmount,
                Status = "SUCCESS",
                PaymentType = $"MUTUAL_FUND_{dto.PaymentMethod.ToUpper()}",
                ReferenceId = createdInvestments.FirstOrDefault()?.Id ?? 0,
                TransactionDate = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { 
                investments = createdInvestments, 
                totalAmount, 
                count = createdInvestments.Count,
                paymentId = transaction.PaymentId,
                paymentMethod = dto.PaymentMethod,
                receiverBank = new {
                    accountHolder = "Sarvesh Sachin Kulkarni",
                    bankName = "Kotak Mahindra",
                    accountNumber = "1047182452",
                    ifscCode = "KKBK0001775",
                    upiId = "sarveshkulkarni.2003@ybl",
                    branch = "PUNE-LAXMI ROAD"
                }
            });
        }

        [HttpPost]
        [Authorize(Roles = "POLICY_HOLDER")]
        public async Task<IActionResult> MakeInvestment([FromBody] InvestmentDto dto)
        {
            var email = User.Identity?.Name;
            var holder = await _context.PolicyHolders.Include(h => h.User).FirstOrDefaultAsync(h => h.User!.Email == email);
            if (holder == null)
            {
                holder = await _context.PolicyHolders.Include(h => h.User).FirstOrDefaultAsync();
            }
            if (holder == null) return NotFound("Customer profile not found");

            var fund = await _context.Funds.FindAsync(dto.FundId);
            if (fund == null) return NotFound("Fund not found");

            var investment = new Investment
            {
                PolicyHolderId = holder.Id,
                FundId = dto.FundId,
                InvestmentAmount = dto.InvestmentAmount,
                SipAmount = dto.SipAmount,
                InvestmentType = dto.InvestmentType,
                DayOfMonth = dto.DayOfMonth,
                Status = "ACTIVE",
                StartDate = DateTime.UtcNow
            };

            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();

            // Record transaction for payment
            var transaction = new Transaction
            {
                UserId = holder.UserId,
                OrderId = "order_inv_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                PaymentId = "pay_inv_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                Amount = dto.InvestmentType.Equals("SIP", StringComparison.OrdinalIgnoreCase) ? dto.SipAmount : dto.InvestmentAmount,
                Status = "SUCCESS",
                PaymentType = dto.InvestmentType.Equals("SIP", StringComparison.OrdinalIgnoreCase) ? "MUTUAL_FUND_SIP" : "MUTUAL_FUND_LUMPSUM",
                ReferenceId = investment.Id,
                TransactionDate = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(investment);
        }

        [HttpGet("portfolio")]
        [Authorize(Roles = "POLICY_HOLDER")]
        public async Task<IActionResult> GetPortfolio()
        {
            var email = User.Identity?.Name;
            var holder = await _context.PolicyHolders.FirstOrDefaultAsync(h => h.User!.Email == email);
            if (holder == null) return NotFound("Customer profile not found");

            var investments = await _context.Investments
                .Include(i => i.Fund)
                .Where(i => i.PolicyHolderId == holder.Id)
                .ToListAsync();

            double totalInvested = 0;
            double currentValue = 0;
            var holdings = new List<object>();

            foreach (var inv in investments)
            {
                double invested = inv.InvestmentType.Equals("SIP", StringComparison.OrdinalIgnoreCase) ? inv.SipAmount : inv.InvestmentAmount;
                double cagr = inv.Fund!.Cagr / 100.0;
                double multiplier = 1.0 + (cagr * 0.4); // Simulate 4.8 months hold returns
                double estimateValue = invested * multiplier;

                totalInvested += invested;
                currentValue += estimateValue;

                holdings.Add(new
                {
                    investment = inv,
                    investedAmount = invested,
                    estimatedValue = estimateValue,
                    gainLoss = estimateValue - invested
                });
            }

            return Ok(new
            {
                holdings,
                totalInvested,
                currentValue,
                totalProfitLoss = currentValue - totalInvested
            });
        }
    }
}
