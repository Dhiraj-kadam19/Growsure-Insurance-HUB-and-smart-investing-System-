using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Growsure.Api.Data;
using Growsure.Api.Models;

namespace Growsure.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PoliciesController : ControllerBase
    {
        private readonly GrowsureContext _context;

        public PoliciesController(GrowsureContext context)
        {
            _context = context;
        }

        public class PolicyDto
        {
            public string PolicyName { get; set; } = string.Empty;
            public string Category { get; set; } = string.Empty;
            public double CoverageAmount { get; set; }
            public double PremiumAmount { get; set; }
            public string? Benefits { get; set; }
            public string? Exclusions { get; set; }
            public int WaitingPeriodMonths { get; set; }
            public double ClaimSettlementRatio { get; set; }
        }

        [HttpGet]
        public async Task<IActionResult> GetPolicies([FromQuery] string? category)
        {
            var query = _context.Policies.Include(p => p.Insurer).Where(p => p.IsActive);
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category == category);
            }
            return Ok(await query.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPolicyById(int id)
        {
            var policy = await _context.Policies.Include(p => p.Insurer).FirstOrDefaultAsync(p => p.Id == id);
            if (policy == null) return NotFound();
            return Ok(policy);
        }

        [HttpGet("insurer")]
        [Authorize(Roles = "INSURER")]
        public async Task<IActionResult> GetInsurerPolicies()
        {
            var email = User.Identity?.Name;
            var insurer = await _context.Insurers.FirstOrDefaultAsync(i => i.User!.Email == email);
            if (insurer == null) return NotFound("Insurer profile not found");

            var policies = await _context.Policies.Where(p => p.InsurerId == insurer.Id).ToListAsync();
            return Ok(policies);
        }

        [HttpPost]
        [Authorize(Roles = "INSURER")]
        public async Task<IActionResult> CreatePolicy([FromBody] PolicyDto dto)
        {
            var email = User.Identity?.Name;
            var insurer = await _context.Insurers.FirstOrDefaultAsync(i => i.User!.Email == email);
            if (insurer == null) return NotFound("Insurer profile not found");
            if (insurer.Status != "APPROVED") return Forbid("Insurer status pending approval");

            var policy = new Policy
            {
                InsurerId = insurer.Id,
                PolicyName = dto.PolicyName,
                Category = dto.Category,
                CoverageAmount = dto.CoverageAmount,
                PremiumAmount = dto.PremiumAmount,
                Benefits = dto.Benefits,
                Exclusions = dto.Exclusions,
                WaitingPeriodMonths = dto.WaitingPeriodMonths,
                ClaimSettlementRatio = dto.ClaimSettlementRatio,
                IsActive = true
            };

            _context.Policies.Add(policy);
            await _context.SaveChangesAsync();
            return Ok(policy);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "INSURER")]
        public async Task<IActionResult> UpdatePolicy(int id, [FromBody] PolicyDto dto)
        {
            var email = User.Identity?.Name;
            var insurer = await _context.Insurers.FirstOrDefaultAsync(i => i.User!.Email == email);
            if (insurer == null) return NotFound("Insurer not found");

            var policy = await _context.Policies.FindAsync(id);
            if (policy == null) return NotFound();
            if (policy.InsurerId != insurer.Id) return Forbid();

            policy.PolicyName = dto.PolicyName;
            policy.Category = dto.Category;
            policy.CoverageAmount = dto.CoverageAmount;
            policy.PremiumAmount = dto.PremiumAmount;
            policy.Benefits = dto.Benefits;
            policy.Exclusions = dto.Exclusions;
            policy.WaitingPeriodMonths = dto.WaitingPeriodMonths;
            policy.ClaimSettlementRatio = dto.ClaimSettlementRatio;

            await _context.SaveChangesAsync();
            return Ok(policy);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "INSURER")]
        public async Task<IActionResult> DeletePolicy(int id)
        {
            var email = User.Identity?.Name;
            var insurer = await _context.Insurers.FirstOrDefaultAsync(i => i.User!.Email == email);
            if (insurer == null) return NotFound();

            var policy = await _context.Policies.FindAsync(id);
            if (policy == null) return NotFound();
            if (policy.InsurerId != insurer.Id) return Forbid();

            policy.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
            return Ok("Policy deactivated successfully");
        }

        [HttpGet("compare")]
        public async Task<IActionResult> Compare([FromQuery] int idA, [FromQuery] int idB)
        {
            var policyA = await _context.Policies.FindAsync(idA);
            var policyB = await _context.Policies.FindAsync(idB);
            if (policyA == null || policyB == null) return BadRequest("One or both policies not found");

            return Ok(new { policyA, policyB });
        }

        [HttpGet("active-purchases")]
        [Authorize(Roles = "POLICY_HOLDER")]
        public async Task<IActionResult> GetActivePurchases()
        {
            var email = User.Identity?.Name;
            var holder = await _context.PolicyHolders.FirstOrDefaultAsync(h => h.User!.Email == email);
            if (holder == null) return NotFound("Customer profile not found");

            var purchases = await _context.PurchasedPolicies
                .Include(p => p.Policy)
                .Where(p => p.PolicyHolderId == holder.Id)
                .ToListAsync();

            return Ok(purchases);
        }
    }
}
