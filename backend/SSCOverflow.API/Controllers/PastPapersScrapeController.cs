using Microsoft.AspNetCore.Mvc;
using SSCOverflow.Application.DTOs;
using SSCOverflow.Application.Services;

namespace SSCOverflow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PastPapersScrapeController : ControllerBase
    {
        private readonly PastPaperScraperService _scraperService;

        public PastPapersScrapeController(PastPaperScraperService scraperService)
        {
            _scraperService = scraperService;
        }

        // GET: api/pastpapers/scrape
        [HttpGet("scrape")]
        public async Task<ActionResult<List<PastPaperScrapeDto>>> ScrapePapers()
        {
            try
            {
                var papers = await _scraperService.ScrapePapersAsync();

                // Debug: Print first 5 papers before filtering
                Console.WriteLine("[API] First 5 scraped papers:");
                foreach (var p in papers.Take(5))
                {
                    Console.WriteLine($"Title: '{p.Title}', Subject: '{p.Subject}', Year: '{p.Year}', Board: '{p.Board}'");
                }

                // Debug: Print all unique years and boards
                Console.WriteLine("Unique Years: " + string.Join(", ", papers.Select(p => p.Year).Distinct()));
                Console.WriteLine("Unique Boards: " + string.Join(", ", papers.Select(p => p.Board).Distinct()));

                return Ok(papers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error scraping papers", error = ex.Message });
            }
        }

        // GET: api/pastpapers/search
        [HttpGet("search")]
        public async Task<ActionResult<List<PastPaperScrapeDto>>> SearchPapers(
            [FromQuery] string? keyword = null,
            [FromQuery] string? year = null,
            [FromQuery] string? board = null)
        {
            try
            {
                var papers = await _scraperService.SearchPapersAsync(keyword, year, board);
                
                Console.WriteLine($"[Controller] Search parameters - Keyword: {keyword}, Year: {year}, Board: {board}");
                Console.WriteLine($"[Controller] Found {papers.Count} matching papers");
                Console.WriteLine("Unique Years: " + string.Join(", ", papers.Select(p => p.Year).Distinct()));
                Console.WriteLine("Unique Boards: " + string.Join(", ", papers.Select(p => p.Board).Distinct()));
                
                return Ok(papers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error searching papers", error = ex.Message });
            }
        }
    }
}