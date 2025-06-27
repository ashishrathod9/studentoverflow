using System.ComponentModel.DataAnnotations;

namespace SSCOverflow.Application.DTOs
{
    public class RegisterDto
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        [StringLength(100)]
        public string? FullName { get; set; }
    }

    public class LoginDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Bio { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Reputation { get; set; }
        public int QuestionsCount { get; set; }
        public int AnswersCount { get; set; }
    }

    public class UpdateProfileDto
    {
        [StringLength(100)]
        public string? FullName { get; set; }

        [StringLength(500)]
        public string? Bio { get; set; }

        public string? ProfilePictureUrl { get; set; }
    }
} 