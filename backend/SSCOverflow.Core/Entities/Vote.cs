namespace SSCOverflow.Core.Entities
{
    public class Vote
    {
        public int Id { get; set; }
        
        public int VoteType { get; set; } // 1 for upvote, -1 for downvote
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        public int UserId { get; set; }
        public int? QuestionId { get; set; }
        public int? AnswerId { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Question? Question { get; set; }
        public virtual Answer? Answer { get; set; }
    }
} 