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
    public class AiController : ControllerBase
    {
        private readonly AiService _aiService;
        private readonly GrowsureContext _context;

        public AiController(AiService aiService, GrowsureContext context)
        {
            _aiService = aiService;
            _context = context;
        }

        public class PolicyRecDto
        {
            public int Age { get; set; }
            public double Salary { get; set; }
            public string MaritalStatus { get; set; } = "SINGLE";
            public int Dependents { get; set; }
            public string HealthCondition { get; set; } = "GOOD";
        }

        public class FundRecDto
        {
            public string RiskAppetite { get; set; } = "MEDIUM";
            public int Horizon { get; set; } = 5;
            public double MonthlyInvestment { get; set; }
            public int Age { get; set; }
            public double Income { get; set; }
        }

        public class ChatDto
        {
            public string Message { get; set; } = string.Empty;
        }

        public class FinPlanDto
        {
            public int Age { get; set; }
            public double Income { get; set; }
            public string RiskAppetite { get; set; } = "MEDIUM";
            public string Goals { get; set; } = string.Empty;
        }

        [HttpPost("recommend-policies")]
        public async Task<IActionResult> RecommendPolicies([FromBody] PolicyRecDto dto)
        {
            var email = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound("User not found");

            var response = await _aiService.RecommendPoliciesAsync(dto.Age, dto.Salary, dto.MaritalStatus, dto.Dependents, dto.HealthCondition);

            try
            {
                var rec = new AIRecommendation
                {
                    UserId = user.Id,
                    RecommendationType = "POLICY",
                    InputCriteria = JsonSerializer.Serialize(dto),
                    OutputRecommendation = response,
                    GeneratedDate = DateTime.UtcNow
                };
                _context.AIRecommendations.Add(rec);
                await _context.SaveChangesAsync();
            }
            catch { /* Ignore database log failures */ }

            return Ok(response);
        }

        [HttpPost("recommend-funds")]
        public async Task<IActionResult> RecommendFunds([FromBody] FundRecDto dto)
        {
            var email = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound("User not found");

            var response = await _aiService.RecommendFundsAsync(dto.RiskAppetite, dto.Horizon, dto.MonthlyInvestment, dto.Age, dto.Income);

            try
            {
                var rec = new AIRecommendation
                {
                    UserId = user.Id,
                    RecommendationType = "FUND",
                    InputCriteria = JsonSerializer.Serialize(dto),
                    OutputRecommendation = response,
                    GeneratedDate = DateTime.UtcNow
                };
                _context.AIRecommendations.Add(rec);
                await _context.SaveChangesAsync();
            }
            catch { }

            return Ok(response);
        }

        [HttpPost("financial-plan")]
        public async Task<IActionResult> GetFinancialPlan([FromBody] FinPlanDto dto)
        {
            var email = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound("User not found");

            var response = await _aiService.GetFinancialPlanAsync(dto.Age, dto.Income, dto.RiskAppetite, dto.Goals);

            try
            {
                var rec = new AIRecommendation
                {
                    UserId = user.Id,
                    RecommendationType = "FINANCIAL_PLAN",
                    InputCriteria = JsonSerializer.Serialize(dto),
                    OutputRecommendation = response,
                    GeneratedDate = DateTime.UtcNow
                };
                _context.AIRecommendations.Add(rec);
                await _context.SaveChangesAsync();
            }
            catch { }

            return Ok(response);
        }

        [HttpPost("chat")]
        [AllowAnonymous]
        public async Task<IActionResult> Chat([FromBody] ChatDto dto)
        {
            var answer = await _aiService.ChatAsync(dto.Message);
            return Ok(new { answer });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var email = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound("User not found");

            var recommendations = await _context.AIRecommendations
                .Where(r => r.UserId == user.Id)
                .OrderByDescending(r => r.GeneratedDate)
                .ToListAsync();

            return Ok(recommendations);
        }
    }
}
