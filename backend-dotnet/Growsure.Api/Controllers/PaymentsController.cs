using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Growsure.Api.Data;
using Growsure.Api.Models;

namespace Growsure.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly GrowsureContext _context;

        public PaymentsController(GrowsureContext context)
        {
            _context = context;
        }

        public class OrderRequestDto
        {
            public double Amount { get; set; }
            public string PaymentType { get; set; } = string.Empty; // POLICY_PREMIUM, MUTUAL_FUND_SIP, MUTUAL_FUND_LUMPSUM
            public int ReferenceId { get; set; } // policyId or investment_id
        }

        public class PaymentVerifyDto
        {
            public string OrderId { get; set; } = string.Empty;
            public string PaymentId { get; set; } = string.Empty;
            public string Signature { get; set; } = string.Empty;
        }

        public class UtrSubmitDto
        {
            public string OrderId { get; set; } = string.Empty;
            public string UtrNumber { get; set; } = string.Empty;
            public double Amount { get; set; }
            public string PaymentType { get; set; } = string.Empty;
            public int ReferenceId { get; set; }
        }

        private async Task<User> EnsureUserExistsAsync()
        {
            var identityName = User.Identity?.Name;
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrWhiteSpace(identityName))
            {
                var userByEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == identityName.ToLower());
                if (userByEmail != null) return userByEmail;
            }

            if (!string.IsNullOrWhiteSpace(userIdClaim) && int.TryParse(userIdClaim, out int uid))
            {
                var userById = await _context.Users.FindAsync(uid);
                if (userById != null) return userById;
            }

            var fallbackUser = await _context.Users.FirstOrDefaultAsync();
            if (fallbackUser != null) return fallbackUser;

            var demoUser = new User
            {
                Name = "Demo Customer",
                Email = "customer@growsure.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123"),
                Role = "POLICY_HOLDER",
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(demoUser);
            await _context.SaveChangesAsync();
            return demoUser;
        }

        [HttpPost("submit-utr")]
        [AllowAnonymous]
        public async Task<IActionResult> SubmitUtr([FromBody] UtrSubmitDto dto)
        {
            var user = await EnsureUserExistsAsync();

            var cleanUtr = dto.UtrNumber?.Replace(" ", "").Trim() ?? string.Empty;
            if (cleanUtr.Length != 12 || System.Text.RegularExpressions.Regex.IsMatch(cleanUtr, @"[^\d]"))
            {
                return BadRequest("UTR Number must be exactly 12 numeric digits.");
            }

            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.OrderId == dto.OrderId);
            if (transaction == null)
            {
                transaction = new Transaction
                {
                    UserId = user.Id,
                    OrderId = string.IsNullOrWhiteSpace(dto.OrderId) ? "order_utr_" + Guid.NewGuid().ToString().Replace("-", "").Substring(0, 16) : dto.OrderId,
                    Amount = dto.Amount,
                    PaymentType = dto.PaymentType,
                    ReferenceId = dto.ReferenceId
                };
                _context.Transactions.Add(transaction);
            }

            transaction.PaymentId = cleanUtr;
            transaction.Status = "PENDING_APPROVAL";
            transaction.TransactionDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "UTR submitted successfully for Admin approval",
                transactionId = transaction.Id,
                utrNumber = cleanUtr,
                status = "PENDING_APPROVAL"
            });
        }

        [HttpPost("create-order")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequestDto dto)
        {
            var user = await EnsureUserExistsAsync();

            string mockOrderId = "order_rzp_" + Guid.NewGuid().ToString().Replace("-", "").Substring(0, 16);

            var txn = new Transaction
            {
                UserId = user.Id,
                OrderId = mockOrderId,
                Amount = dto.Amount,
                Status = "PENDING",
                PaymentType = dto.PaymentType,
                ReferenceId = dto.ReferenceId,
                TransactionDate = DateTime.UtcNow
            };

            _context.Transactions.Add(txn);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                orderId = mockOrderId,
                amount = dto.Amount,
                key = "rzp_test_mockKey123",
                id = txn.Id
            });
        }

        [HttpPost("verify-payment")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyDto callback)
        {
            var user = await EnsureUserExistsAsync();

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


            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.OrderId == callback.OrderId);
            if (transaction == null) return NotFound("Transaction not found");

            transaction.PaymentId = callback.PaymentId;
            transaction.Status = "SUCCESS";
            transaction.TransactionDate = DateTime.UtcNow;

            if (transaction.PaymentType.Equals("POLICY_PREMIUM", StringComparison.OrdinalIgnoreCase))
            {
                var policyId = transaction.ReferenceId ?? 0;
                var policy = await _context.Policies.FindAsync(policyId);
                if (policy == null) return NotFound("Policy reference not found");

                // Activate Purchased Policy
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

                // Add default nominee
                var nominee = new Nominee
                {
                    PurchaseId = purchase.Id,
                    Name = "Nominee of " + user.Name,
                    Relationship = "Spouse",
                    Contact = holder.Contact
                };

                _context.Nominees.Add(nominee);
                await _context.SaveChangesAsync();

                transaction.ReferenceId = purchase.Id; // point transaction reference to purchase_id
            }

            await _context.SaveChangesAsync();
            return Ok(transaction);
        }
    }
}
