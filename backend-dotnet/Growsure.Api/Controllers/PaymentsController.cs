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

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequestDto dto)
        {
            var email = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound("User not found");

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
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyDto callback)
        {
            var email = User.Identity?.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound();

            var holder = await _context.PolicyHolders.FirstOrDefaultAsync(h => h.UserId == user.Id);
            if (holder == null) return NotFound("Customer profile not found");

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
