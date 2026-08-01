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
            if (string.IsNullOrWhiteSpace(dto.Email) || !System.Text.RegularExpressions.Regex.IsMatch(dto.Email.Trim(), @"^[^\s@]+@[^\s@]+\.[^\s@]+$"))
            {
                return BadRequest("Invalid email address format.");
            }

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest("Email Address already in use!");
            }

            if (string.IsNullOrEmpty(dto.Password) || dto.Password.Length < 6)
            {
                return BadRequest("Password must be at least 6 characters long.");
            }

            if (dto.Role.Equals("POLICY_HOLDER", StringComparison.OrdinalIgnoreCase))
            {
                // Validate Aadhaar (12 digits starting with 2-9)
                var cleanAadhaar = dto.Aadhaar?.Trim() ?? string.Empty;
                if (!System.Text.RegularExpressions.Regex.IsMatch(cleanAadhaar, @"^[2-9]\d{11}$"))
                {
                    return BadRequest("Aadhaar must be a valid 12-digit UIDAI number starting with digits 2-9.");
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

                // Validate Contact (10-digit Indian mobile number starting with 6-9)
                var cleanContact = dto.Contact?.Trim() ?? string.Empty;
                if (!System.Text.RegularExpressions.Regex.IsMatch(cleanContact, @"^[6-9]\d{9}$"))
                {
                    return BadRequest("Contact number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
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
    }
}
