namespace SSCOverflow.Application.DTOs
{
    public class PastPaperScrapeDto
    {
        public string Title { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Month { get; set; } = string.Empty;
        public string Board { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public DateTime ScrapedAt { get; set; } = DateTime.UtcNow;
    }
}