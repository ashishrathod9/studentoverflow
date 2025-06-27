namespace SSCOverflow.Core.Entities
{
    public class PastPaperTag
    {
        public int PastPaperId { get; set; }
        public int TagId { get; set; }
        
        // Navigation properties
        public virtual PastPaper PastPaper { get; set; } = null!;
        public virtual Tag Tag { get; set; } = null!;
    }
} 