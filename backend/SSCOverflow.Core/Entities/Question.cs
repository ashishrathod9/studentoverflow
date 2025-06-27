using System.ComponentModel.DataAnnotations;

namespace SSCOverflow.Core.Entities
{
    public class Question
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public int ViewCount { get; set; } = 0;
        
        public int VoteCount { get; set; } = 0;
        
        public int AnswerCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsAnswered { get; set; } = false;
        
        public bool IsClosed { get; set; } = false;
        
        // Foreign keys
        public int AuthorId { get; set; }
        
        // Navigation properties
        public virtual User Author { get; set; } = null!;
        public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<Vote> Votes { get; set; } = new List<Vote>();
        public virtual ICollection<QuestionTag> QuestionTags { get; set; } = new List<QuestionTag>();
    }
} 