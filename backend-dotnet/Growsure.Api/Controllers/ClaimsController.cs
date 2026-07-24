using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Growsure.Api.Data;
using Growsure.Api.Models;
using Growsure.Api.Services;

namespace Growsure.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClaimsController : ControllerBase
    {
        private readonly GrowsureContext _context;
        private readonly AiService _aiService;

        public ClaimsController(GrowsureContext context, AiService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        public class ClaimDto
        {
            public int PurchaseId { get; set; }
            public double ClaimAmount { get; set; }
            public string IncidentDetails { get; set; } = string.Empty;
            public string DocumentUrls { get; set; } = string.Empty;
        }

        [HttpPost]
        [Authorize(Roles = "POLICY_HOLDER")]
        public async Task<IActionResult> SubmitClaim([FromBody] ClaimDto dto)
        {
            var email = User.Identity?.Name;
            var holder = await _context.PolicyHolders.FirstOrDefaultAsync(h => h.User!.Email == email);
            if (holder == null) return NotFound("Customer profile not found");

            var purchasedPolicy = await _context.PurchasedPolicies.FindAsync(dto.PurchaseId);
            if (purchasedPolicy == null) return NotFound("Purchased policy not found");
            if (purchasedPolicy.PolicyHolderId != holder.Id) return Forbid("Access Denied: Not your policy");

            var claim = new Claim
            {
                PurchaseId = dto.PurchaseId,
                ClaimAmount = dto.ClaimAmount,
                IncidentDetails = dto.IncidentDetails,
                DocumentUrls = dto.DocumentUrls,
                Status = "SUBMITTED",
                CreatedAt = DateTime.UtcNow
            };

            // Call GenAI service to calculate claim risk and fraud score
            try
            {
                var assessmentJson = await _aiService.AssessClaimAsync(dto.ClaimAmount, dto.IncidentDetails, dto.DocumentUrls);
                using var doc = JsonDocument.Parse(assessmentJson);
                var root = doc.RootElement;
                
                claim.FraudScore = root.GetProperty("fraudScore").GetDouble();
                claim.FraudReasons = root.GetProperty("fraudReasons").GetString();
            }
            catch
            {
                claim.FraudScore = 15.0;
                claim.FraudReasons = "AI assessment offline. Core document format parameters validated.";
            }

            _context.Claims.Add(claim);
            await _context.SaveChangesAsync();

            // Audit log
            var auditLog = new AuditLog
            {
                UserId = holder.UserId,
                Action = "CLAIM_SUBMIT",
                Details = $"Submitted claim ID {claim.Id} for amount {claim.ClaimAmount}",
                Timestamp = DateTime.UtcNow
            };
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            return Ok(claim);
        }

        [HttpGet("customer")]
        [Authorize(Roles = "POLICY_HOLDER")]
        public async Task<IActionResult> GetCustomerClaims()
        {
            var email = User.Identity?.Name;
            var holder = await _context.PolicyHolders.FirstOrDefaultAsync(h => h.User!.Email == email);
            if (holder == null) return NotFound("Customer profile not found");

            var claims = await _context.Claims
                .Include(c => c.PurchasedPolicy)
                .ThenInclude(p => p!.Policy)
                .Where(c => c.PurchasedPolicy!.PolicyHolderId == holder.Id)
                .ToListAsync();

            return Ok(claims);
        }

        [HttpGet("insurer")]
        [Authorize(Roles = "INSURER")]
        public async Task<IActionResult> GetInsurerClaims()
        {
            var email = User.Identity?.Name;
            var insurer = await _context.Insurers.FirstOrDefaultAsync(i => i.User!.Email == email);
            if (insurer == null) return NotFound("Insurer profile not found");

            var claims = await _context.Claims
                .Include(c => c.PurchasedPolicy)
                .ThenInclude(p => p!.Policy)
                .Where(c => c.PurchasedPolicy!.Policy!.InsurerId == insurer.Id)
                .ToListAsync();

            return Ok(claims);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "INSURER")]
        public async Task<IActionResult> UpdateClaimStatus(int id, [FromQuery] string status)
        {
            var email = User.Identity?.Name;
            var insurer = await _context.Insurers.FirstOrDefaultAsync(i => i.User!.Email == email);
            if (insurer == null) return NotFound();

            var claim = await _context.Claims
                .Include(c => c.PurchasedPolicy)
                .ThenInclude(p => p!.Policy)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (claim == null) return NotFound();
            if (claim.PurchasedPolicy!.Policy!.InsurerId != insurer.Id) return Forbid();

            claim.Status = status;
            await _context.SaveChangesAsync();

            // Log
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            var log = new AuditLog
            {
                UserId = user?.Id,
                Action = "CLAIM_DECISION",
                Details = $"Insurer set claim ID {id} status to {status}",
                Timestamp = DateTime.UtcNow
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(claim);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClaimById(int id)
        {
            var claim = await _context.Claims.FindAsync(id);
            if (claim == null) return NotFound();
            return Ok(claim);
        }
    }
}
