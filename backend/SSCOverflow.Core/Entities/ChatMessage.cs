using System.ComponentModel.DataAnnotations;

namespace SSCOverflow.Core.Entities
{
    public class ChatMessage
    {
        public int Id { get; set; }
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        [Required]
        public string Response { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int? UserId { get; set; }
        
        public string? SessionId { get; set; }
        
        public string? UserAgent { get; set; }
        
        public string? IpAddress { get; set; }
        
        // Navigation properties
        public virtual User? User { get; set; }
    }
} 