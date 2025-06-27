using System.ComponentModel.DataAnnotations;

namespace SSCOverflow.Core.Entities
{
    public class PastPaper
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Year { get; set; } = string.Empty;
        
        [StringLength(20)]
        public string? Board { get; set; }
        
        [StringLength(20)]
        public string? PaperType { get; set; } // e.g., "Theory", "MCQ", "Practical"
        
        public string? Description { get; set; }
        
        [Required]
        public string FileUrl { get; set; } = string.Empty;
        
        public string? ThumbnailUrl { get; set; }
        
        public int DownloadCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        // Tags for better search
        public virtual ICollection<PastPaperTag> PastPaperTags { get; set; } = new List<PastPaperTag>();
    }
} 