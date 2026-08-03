using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Growsure.Api.Data;
using Growsure.Api.Models;

namespace Growsure.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly GrowsureContext _context;

        public AdminController(GrowsureContext context)
        {
            _context = context;
        }

        [HttpGet("metrics")]
        public async Task<IActionResult> GetMetrics()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalPolicies = await _context.Policies.CountAsync();
            var totalClaims = await _context.Claims.CountAsync();

            var totalRevenue = await _context.Transactions
                .Where(t => t.Status == "SUCCESS")
                .SumAsync(t => t.Amount);

            var investmentsList = await _context.Investments.ToListAsync();
            var totalInvestments = investmentsList.Sum(i => i.InvestmentType.Equals("SIP", StringComparison.OrdinalIgnoreCase) ? i.SipAmount : i.InvestmentAmount);

            return Ok(new
            {
                totalUsers,
                totalPolicies,
                totalClaims,
                totalRevenue,
                totalInvestments
            });
        }

        [HttpGet("insurers/pending")]
        public async Task<IActionResult> GetPendingInsurers()
        {
            var insurers = await _context.Insurers
                .Include(i => i.User)
                .Where(i => i.Status == "PENDING")
                .ToListAsync();
            return Ok(insurers);
        }

        [HttpPut("insurers/{id}/approve")]
        public async Task<IActionResult> ApproveInsurer(int id, [FromQuery] string status)
        {
            var insurer = await _context.Insurers.FindAsync(id);
            if (insurer == null) return NotFound();

            insurer.Status = status;
            await _context.SaveChangesAsync();
            return Ok($"Insurer {status.ToLower()} successfully.");
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            return Ok(await _context.Users.ToListAsync());
        }

        [HttpGet("analytics/revenue")]
        public async Task<IActionResult> GetRevenueAnalytics()
        {
            var successTxns = await _context.Transactions.Where(t => t.Status == "SUCCESS").ToListAsync();
            
            var policyRevenue = successTxns.Where(t => t.PaymentType == "POLICY_PREMIUM").Sum(t => t.Amount);
            var fundRevenue = successTxns.Where(t => t.PaymentType.Contains("MUTUAL_FUND")).Sum(t => t.Amount);

            var commissionEarned = (policyRevenue * 0.10) + (fundRevenue * 0.01);
            var claims = await _context.Claims.Where(c => c.Status == "APPROVED").ToListAsync();
            var claimExpenses = claims.Sum(c => c.ClaimAmount);

            return Ok(new
            {
                policyRevenue,
                fundRevenue,
                commissionEarned,
                claimExpenses,
                netProfit = commissionEarned - claimExpenses,
                monthlyRevenueLabels = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun" },
                monthlyRevenueValues = new[] { 45000, 52000, 61000, 58000, 72000, 85000 },
                claimsTrendValues = new[] { 12000, 18000, 24000, 15000, 31000, 42000 }
            });
        }

        [HttpGet("analytics/funds")]
        public async Task<IActionResult> GetFundAnalytics()
        {
            var funds = await _context.Funds.ToListAsync();
            var sortedFunds = funds.OrderByDescending(f => f.Cagr).ToList();

            return Ok(new
            {
                bestPerformingFunds = sortedFunds.Take(3),
                totalAUM = funds.Sum(f => f.AumCrores)
            });
        }

        [HttpGet("utr/pending")]
        public async Task<IActionResult> GetPendingUtrTransactions()
        {
            var pendingTxns = await _context.Transactions
                .Include(t => t.User)
                .Where(t => t.Status == "PENDING_APPROVAL")
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new
                {
                    t.Id,
                    t.UserId,
                    UserName = t.User != null ? t.User.Name : "User #" + t.UserId,
                    UserEmail = t.User != null ? t.User.Email : "",
                    t.OrderId,
                    UtrNumber = t.PaymentId,
                    t.Amount,
                    t.PaymentType,
                    t.ReferenceId,
                    t.Status,
                    t.TransactionDate
                })
                .ToListAsync();

            return Ok(pendingTxns);
        }

        [HttpPut("utr/{id}/approve")]
        public async Task<IActionResult> ApproveUtrTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null) return NotFound("Transaction not found");

            if (transaction.Status == "SUCCESS")
            {
                return BadRequest("Transaction is already approved.");
            }

            var user = await _context.Users.FindAsync(transaction.UserId);
            if (user == null) return NotFound("User not found");

            var holder = await _context.PolicyHolders.FirstOrDefaultAsync(h => h.UserId == user.Id);
            if (holder == null)
            {
                holder = new PolicyHolder
                {
                    UserId = user.Id,
                    Aadhaar = "200000000000",
                    Pan = "ABCPE1234F",
                    Dob = new DateTime(1995, 1, 1),
                    Contact = "9876543210",
                    Address = "Growsure Registered Address"
                };
                _context.PolicyHolders.Add(holder);
                await _context.SaveChangesAsync();
            }

            transaction.Status = "SUCCESS";
            transaction.TransactionDate = DateTime.UtcNow;

            if (transaction.PaymentType.Equals("POLICY_PREMIUM", StringComparison.OrdinalIgnoreCase))
            {
                var policyId = transaction.ReferenceId ?? 0;
                var policy = await _context.Policies.FindAsync(policyId);
                if (policy != null)
                {
                    var purchase = new PurchasedPolicy
                    {
                        PolicyHolderId = holder.Id,
                        PolicyId = policy.Id,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddYears(1),
                        Status = "ACTIVE",
                        PolicyNumber = "POL-" + Guid.NewGuid().ToString().Replace("-", "").Substring(0, 12).ToUpper()
                    };

                    _context.PurchasedPolicies.Add(purchase);
                    await _context.SaveChangesAsync();

                    var nominee = new Nominee
                    {
                        PurchaseId = purchase.Id,
                        Name = "Nominee of " + user.Name,
                        Relationship = "Spouse",
                        Contact = holder.Contact
                    };

                    _context.Nominees.Add(nominee);
                    transaction.ReferenceId = purchase.Id;
                }
            }
            else if (transaction.PaymentType.StartsWith("MUTUAL_FUND", StringComparison.OrdinalIgnoreCase))
            {
                var fundId = transaction.ReferenceId ?? 0;
                var fund = await _context.Funds.FindAsync(fundId);
                if (fund != null)
                {
                    var isSip = transaction.PaymentType.Equals("MUTUAL_FUND_SIP", StringComparison.OrdinalIgnoreCase);
                    var investment = new Investment
                    {
                        PolicyHolderId = holder.Id,
                        FundId = fund.Id,
                        InvestmentAmount = transaction.Amount,
                        SipAmount = isSip ? transaction.Amount : 0,
                        InvestmentType = isSip ? "SIP" : "LUMPSUM",
                        DayOfMonth = DateTime.UtcNow.Day,
                        StartDate = DateTime.UtcNow,
                        Status = "ACTIVE"
                    };

                    _context.Investments.Add(investment);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Payment approved and completed successfully!", transactionId = transaction.Id, status = "SUCCESS" });
        }

        [HttpPut("utr/{id}/reject")]
        public async Task<IActionResult> RejectUtrTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null) return NotFound("Transaction not found");

            transaction.Status = "FAILED";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Transaction payment rejected successfully.", transactionId = transaction.Id, status = "FAILED" });
        }
    }
}
