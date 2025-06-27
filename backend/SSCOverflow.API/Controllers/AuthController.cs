using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SSCOverflow.Application.DTOs;
using SSCOverflow.Core.Entities;
using SSCOverflow.Infrastructure.Data;
using System.Security.Cryptography;
using System.Text;

namespace SSCOverflow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            try
            {
                // Check if username or email already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == registerDto.Username || u.Email == registerDto.Email);

                if (existingUser != null)
                {
                    return BadRequest(new { message = "Username or email already exists" });
                }

                // Hash password
                var passwordHash = HashPassword(registerDto.Password);

                var user = new User
                {
                    Username = registerDto.Username,
                    Email = registerDto.Email,
                    PasswordHash = passwordHash,
                    FullName = registerDto.FullName,
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow,
                    IsActive = true,
                    Reputation = 0
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    CreatedAt = user.CreatedAt,
                    Reputation = user.Reputation
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while registering", error = ex.Message });
            }
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

                if (user == null)
                {
                    return BadRequest(new { message = "Invalid username or password" });
                }

                // Verify password
                if (!VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    return BadRequest(new { message = "Invalid username or password" });
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    CreatedAt = user.CreatedAt,
                    Reputation = user.Reputation
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while logging in", error = ex.Message });
            }
        }

        // GET: api/auth/users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        Username = u.Username,
                        Email = u.Email,
                        FullName = u.FullName,
                        CreatedAt = u.CreatedAt,
                        Reputation = u.Reputation
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving users", error = ex.Message });
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashedPassword = HashPassword(password);
            return hashedPassword == hash;
        }
    }
} 