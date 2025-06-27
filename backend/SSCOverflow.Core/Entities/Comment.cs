using System.ComponentModel.DataAnnotations;

namespace SSCOverflow.Core.Entities
{
    public class Comment
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Content { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        public int AuthorId { get; set; }
        public int? QuestionId { get; set; }
        public int? AnswerId { get; set; }
        
        // Navigation properties
        public virtual User Author { get; set; } = null!;
        public virtual Question? Question { get; set; }
        public virtual Answer? Answer { get; set; }
    }
} 