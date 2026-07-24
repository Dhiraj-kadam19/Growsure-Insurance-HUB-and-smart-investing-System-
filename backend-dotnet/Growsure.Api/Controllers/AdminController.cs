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
    }
}
