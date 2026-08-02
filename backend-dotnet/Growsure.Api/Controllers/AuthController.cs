using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Growsure.Api.Data;
using Growsure.Api.Models;

namespace Growsure.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly GrowsureContext _context;
        private readonly IConfiguration _config;

        public AuthController(GrowsureContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class RegisterDto
        {
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty; // POLICY_HOLDER, INSURER, ADMIN
            
            // Policy Holder Profile Info
            public string? Aadhaar { get; set; }
            public string? Pan { get; set; }
            public DateTime? Dob { get; set; }
            public string? Contact { get; set; }
            public string? Address { get; set; }

            // Insurer Profile Info
            public string? LicenseNumber { get; set; }
            public string? CompanyName { get; set; }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return Unauthorized("Invalid email or password");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["JwtSettings:Secret"] ?? "defaultSecretKeyWithEnoughBytesForHMACSHA256SignatureVerification");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new System.Security.Claims.Claim(ClaimTypes.Name, user.Email),
                    new System.Security.Claims.Claim(ClaimTypes.Role, user.Role),
                    new System.Security.Claims.Claim("userId", user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(Convert.ToDouble(_config["JwtSettings:ExpiryDays"] ?? "1")),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                email = user.Email,
                role = user.Role,
                name = user.Name,
                userId = user.Id
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var cleanEmail = dto.Email?.Trim() ?? string.Empty;
            var emailRegex = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$";
            if (string.IsNullOrWhiteSpace(cleanEmail) || !System.Text.RegularExpressions.Regex.IsMatch(cleanEmail, emailRegex))
            {
                return BadRequest("Please enter a valid email address.");
            }

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == cleanEmail.ToLower()))
            {
                return BadRequest("Email Address already in use!");
            }

            if (string.IsNullOrEmpty(dto.Password) || dto.Password.Length < 6)
            {
                return BadRequest("Password must be at least 6 characters long.");
            }

            if (dto.Role.Equals("POLICY_HOLDER", StringComparison.OrdinalIgnoreCase))
            {
                // Validate Aadhaar (exactly 12 numeric digits)
                var rawAadhaar = dto.Aadhaar ?? string.Empty;
                var cleanAadhaar = rawAadhaar.Trim();
                if (System.Text.RegularExpressions.Regex.IsMatch(cleanAadhaar, @"[^\d]"))
                {
                    return BadRequest("Only numeric values are allowed.");
                }
                if (cleanAadhaar.Length != 12)
                {
                    return BadRequest("Aadhaar number must contain exactly 12 digits.");
                }

                // Validate PAN (10 chars, format ABCDE1234F)
                var cleanPan = dto.Pan?.Trim().ToUpper() ?? string.Empty;
                if (!System.Text.RegularExpressions.Regex.IsMatch(cleanPan, @"^[A-Z]{3}[PCHABGJLFTGR][A-Z]{1}[0-9]{4}[A-Z]{1}$"))
                {
                    return BadRequest("Invalid PAN card format (e.g. ABCPE1234F). 4th character must be P for Individual.");
                }

                // Validate Date of Birth (No future dates, age >= 18)
                if (!dto.Dob.HasValue)
                {
                    return BadRequest("Date of Birth is required.");
                }

                var today = DateTime.UtcNow.Date;
                var dobDate = dto.Dob.Value.Date;

                if (dobDate > today)
                {
                    return BadRequest("Date of Birth cannot be in the future.");
                }

                if (dobDate == today)
                {
                    return BadRequest("Date of Birth cannot be today.");
                }

                int age = today.Year - dobDate.Year;
                if (dobDate > today.AddYears(-age)) age--;

                if (age < 18)
                {
                    return BadRequest($"Age is {age} years. You must be at least 18 years old to register as a policy holder.");
                }

                if (age > 120)
                {
                    return BadRequest("Invalid Date of Birth (maximum age 120 years).");
                }

                // Validate Contact (exactly 10 numeric digits, not all identical digits)
                var rawContact = dto.Contact ?? string.Empty;
                var cleanContact = rawContact.Trim();
                if (System.Text.RegularExpressions.Regex.IsMatch(cleanContact, @"[^\d]"))
                {
                    return BadRequest("Only numeric values are allowed.");
                }
                if (cleanContact.Length != 10)
                {
                    return BadRequest("Mobile number must contain exactly 10 digits.");
                }
                if (System.Text.RegularExpressions.Regex.IsMatch(cleanContact, @"^(\d)\1{9}$"))
                {
                    return BadRequest("Invalid mobile number.");
                }

                // Check if Aadhaar or PAN is already registered
                if (await _context.PolicyHolders.AnyAsync(p => p.Aadhaar == cleanAadhaar))
                {
                    return BadRequest("This Aadhaar number is already registered!");
                }

                if (await _context.PolicyHolders.AnyAsync(p => p.Pan == cleanPan))
                {
                    return BadRequest("This PAN card number is already registered!");
                }
            }


            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (dto.Role.Equals("POLICY_HOLDER", StringComparison.OrdinalIgnoreCase))
            {
                var holder = new PolicyHolder
                {
                    UserId = user.Id,
                    Aadhaar = dto.Aadhaar,
                    Pan = dto.Pan?.ToUpper(),
                    Dob = dto.Dob,
                    Contact = dto.Contact,
                    Address = dto.Address
                };
                _context.PolicyHolders.Add(holder);
            }
            else if (dto.Role.Equals("INSURER", StringComparison.OrdinalIgnoreCase))
            {
                var insurer = new Insurer
                {
                    UserId = user.Id,
                    LicenseNumber = dto.LicenseNumber ?? string.Empty,
                    CompanyName = dto.CompanyName ?? string.Empty,
                    Address = dto.Address,
                    Status = "PENDING"
                };
                _context.Insurers.Add(insurer);
            }

            await _context.SaveChangesAsync();
            return Ok("User registered successfully");
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userEmail = User.Identity?.Name;
            if (string.IsNullOrEmpty(userEmail)) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null) return NotFound("User not found");

            if (user.Role == "POLICY_HOLDER")
            {
                var holder = await _context.PolicyHolders.Include(p => p.User).FirstOrDefaultAsync(p => p.UserId == user.Id);
                return Ok(holder);
            }
            else if (user.Role == "INSURER")
            {
                var insurer = await _context.Insurers.Include(i => i.User).FirstOrDefaultAsync(i => i.UserId == user.Id);
                return Ok(insurer);
            }

            return Ok(user);
        }

        private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, (string Otp, DateTime Expiry, bool Verified)> _otpStore 
            = new System.Collections.Concurrent.ConcurrentDictionary<string, (string, DateTime, bool)>(StringComparer.OrdinalIgnoreCase);

        public class ForgotPasswordDto
        {
            public string Email { get; set; } = string.Empty;
        }

        public class VerifyOtpDto
        {
            public string Email { get; set; } = string.Empty;
            public string Otp { get; set; } = string.Empty;
        }

        public class ResetPasswordDto
        {
            public string Email { get; set; } = string.Empty;
            public string Otp { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest("Email address is required.");
            }

            var cleanEmail = dto.Email.Trim().ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);
            if (user == null)
            {
                return BadRequest("No account registered with this email address.");
            }

            var otp = new Random().Next(100000, 999999).ToString();
            var expiry = DateTime.UtcNow.AddMinutes(15);
            _otpStore[cleanEmail] = (otp, expiry, false);

            return Ok(new
            {
                message = $"Verification code sent to {cleanEmail}.",
                otp = otp
            });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Otp))
            {
                return BadRequest("Email and Verification Code are required.");
            }

            var cleanEmail = dto.Email.Trim().ToLower();
            if (!_otpStore.TryGetValue(cleanEmail, out var item))
            {
                return BadRequest("No verification code was requested for this email.");
            }

            if (DateTime.UtcNow > item.Expiry)
            {
                _otpStore.TryRemove(cleanEmail, out _);
                return BadRequest("Verification code has expired. Please request a new code.");
            }

            if (item.Otp != dto.Otp.Trim())
            {
                return BadRequest("Invalid 6-digit verification code.");
            }

            _otpStore[cleanEmail] = (item.Otp, item.Expiry, true);

            return Ok(new { message = "Email verified successfully! You can now reset your password." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Otp) || string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                return BadRequest("All fields are required.");
            }

            var cleanEmail = dto.Email.Trim().ToLower();
            if (!_otpStore.TryGetValue(cleanEmail, out var item))
            {
                return BadRequest("Please verify your email code before changing your password.");
            }

            if (!item.Verified || item.Otp != dto.Otp.Trim())
            {
                return BadRequest("Unverified email. You must enter and verify the code sent to your email before resetting your password.");
            }

            if (dto.NewPassword.Length < 6)
            {
                return BadRequest("Password must be at least 6 characters long.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            _otpStore.TryRemove(cleanEmail, out _);

            return Ok(new { message = "Password reset successfully! You can now log in with your new password." });
        }
    }
}

