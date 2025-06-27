using System.ComponentModel.DataAnnotations;

namespace SSCOverflow.Core.Entities
{
    public class Answer
    {
        public int Id { get; set; }
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public int VoteCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsAccepted { get; set; } = false;
        
        // Foreign keys
        public int QuestionId { get; set; }
        public int AuthorId { get; set; }
        
        // Navigation properties
        public virtual Question Question { get; set; } = null!;
        public virtual User Author { get; set; } = null!;
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<Vote> Votes { get; set; } = new List<Vote>();
    }
} 