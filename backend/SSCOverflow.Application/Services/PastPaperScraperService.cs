using Microsoft.Playwright;
using SSCOverflow.Application.DTOs;
using System.Text.RegularExpressions;

namespace SSCOverflow.Application.Services
{
    public class PastPaperScraperService
    {
        private const string BaseUrl = "https://www.gsebeservice.com";
        private const string PapersUrl = "https://www.gsebeservice.com/Web/quePaper";

        public async Task<List<PastPaperScrapeDto>> ScrapePapersAsync()
        {
            var papers = new List<PastPaperScrapeDto>();

            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true });
            var page = await browser.NewPageAsync();
            
            try
            {
                await page.GotoAsync(PapersUrl);

                // Wait for the quepaper div to load
                await page.WaitForSelectorAsync("div.form-group.quepaper", new PageWaitForSelectorOptions { Timeout = 10000 });

                var links = await page.QuerySelectorAllAsync("div.form-group.quepaper a");
                Console.WriteLine($"[Scraper] Found {links.Count} links in quepaper div.");

                // First, let's see what the actual text looks like for the first 10 links
                Console.WriteLine("=== RAW TEXT SAMPLES ===");
                var sampleCount = Math.Min(10, links.Count);
                for (int i = 0; i < sampleCount; i++)
                {
                    var sampleText = await links[i].InnerTextAsync();
                    Console.WriteLine($"Sample {i + 1}: '{sampleText}'");
                }
                Console.WriteLine("=== END SAMPLES ===");

                foreach (var link in links)
                {
                    var href = await link.GetAttributeAsync("href");
                    var text = await link.InnerTextAsync();

                    if (string.IsNullOrWhiteSpace(text) || string.IsNullOrWhiteSpace(href))
                        continue;

                    var parsedPaper = ParsePaperInfo(text, href);
                    if (parsedPaper != null)
                    {
                        papers.Add(parsedPaper);
                        Console.WriteLine($"[Scraper] SUCCESS: Year='{parsedPaper.Year}' | Subject='{parsedPaper.Subject}' | Board='{parsedPaper.Board}' | Title='{parsedPaper.Title}'");
                    }
                    else
                    {
                        Console.WriteLine($"[Scraper] FAILED to parse: '{text}'");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Scraper] Error: {ex.Message}");
            }

            Console.WriteLine($"[Scraper] Total papers scraped: {papers.Count}");
            return papers;
        }

        private PastPaperScrapeDto? ParsePaperInfo(string text, string href)
        {
            try
            {
                Console.WriteLine($"[Parser] === PARSING: '{text}' ===");
                
                // Remove the number prefix (e.g., "1) ", "2) ")
                var cleanText = Regex.Replace(text, @"^\d+\)\s*", "");
                Console.WriteLine($"[Parser] After removing prefix: '{cleanText}'");

                // Try multiple year extraction strategies
                string year = ExtractYear(cleanText);
                Console.WriteLine($"[Parser] Year: '{year}'");

                // Extract month
                string month = ExtractMonth(cleanText);
                Console.WriteLine($"[Parser] Month: '{month}'");

                // Extract board
                string board = ExtractBoard(cleanText);
                Console.WriteLine($"[Parser] Board: '{board}'");

                // Extract subject
                string subject = ExtractSubject(cleanText);
                Console.WriteLine($"[Parser] Subject: '{subject}'");

                // Extract grade
                string grade = ExtractGrade(cleanText);
                Console.WriteLine($"[Parser] Grade: '{grade}'");

                // Create full URL
                string fullUrl = href.StartsWith("http") ? href : BaseUrl + href;

                Console.WriteLine($"[Parser] === RESULT: Y={year}, S={subject}, B={board} ===");

                return new PastPaperScrapeDto
                {
                    Title = cleanText,
                    Url = fullUrl,
                    Year = year,
                    Month = month,
                    Board = board,
                    Subject = subject,
                    Grade = grade
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Parser] Error parsing paper info: {ex.Message}");
                return null;
            }
        }

        private string ExtractYear(string text)
        {
            // Strategy 1: Look for 4-digit year in parentheses
            var match1 = Regex.Match(text, @"\(.*?(\d{4})\)");
            if (match1.Success)
            {
                Console.WriteLine($"[Year] Found in parentheses: {match1.Groups[1].Value}");
                return match1.Groups[1].Value;
            }

            // Strategy 2: Look for any 4-digit number that looks like a year (2000-2030)
            var match2 = Regex.Match(text, @"(20[0-3]\d)");
            if (match2.Success)
            {
                Console.WriteLine($"[Year] Found year pattern: {match2.Groups[1].Value}");
                return match2.Groups[1].Value;
            }

            // Strategy 3: Look for year after dash or hyphen
            var match3 = Regex.Match(text, @"[-–—]\s*(\d{4})");
            if (match3.Success)
            {
                Console.WriteLine($"[Year] Found after dash: {match3.Groups[1].Value}");
                return match3.Groups[1].Value;
            }

            Console.WriteLine($"[Year] No year found in: '{text}'");
            return "";
        }

        private string ExtractMonth(string text)
        {
            var monthPattern = @"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|MAR|JULY|JAN|FEB|APR|JUN|AUG|SEP|OCT|NOV|DEC)";
            var match = Regex.Match(text, monthPattern, RegexOptions.IgnoreCase);
            return match.Success ? match.Groups[1].Value : "";
        }

        private string ExtractBoard(string text)
        {
            Console.WriteLine($"[Board] Analyzing: '{text}'");
            
            // Look for common board indicators with multiple strategies
            var boardPatterns = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { @"Guj\s*MED", "Gujarat" },
                { @"ENG\s*MED", "English" },
                { @"Hindi\s*MED", "Hindi" },
                { @"English\s*Medium", "English" },
                { @"Gujarati\s*Medium", "Gujarat" },
                { @"Hindi\s*Medium", "Hindi" },
                { @"GSEB", "Gujarat" },
                { @"Gujarat", "Gujarat" },
                { @"Gujarati", "Gujarat" },
                { @"English", "English" }
            };

            foreach (var pattern in boardPatterns)
            {
                if (Regex.IsMatch(text, pattern.Key, RegexOptions.IgnoreCase))
                {
                    Console.WriteLine($"[Board] Found '{pattern.Value}' using pattern '{pattern.Key}'");
                    return pattern.Value;
                }
            }

            // If no specific pattern found, try to infer from common patterns
            if (text.Contains("10th", StringComparison.OrdinalIgnoreCase))
            {
                // Default to Gujarat for Gujarat board papers
                Console.WriteLine($"[Board] Defaulting to Gujarat for 10th grade paper");
                return "Gujarat";
            }

            Console.WriteLine($"[Board] No board found");
            return "";
        }

        private string ExtractGrade(string text)
        {
            // Look for grade patterns
            var gradeMatch = Regex.Match(text, @"(\d{1,2})th|Class\s*(\d{1,2})|Grade\s*(\d{1,2})", RegexOptions.IgnoreCase);
            if (gradeMatch.Success)
            {
                return gradeMatch.Groups[1].Value + gradeMatch.Groups[2].Value + gradeMatch.Groups[3].Value;
            }

            // Default to 10 if no grade found (based on your original assumption)
            return "10";
        }

        private string ExtractSubject(string text)
        {
            Console.WriteLine($"[Subject] Analyzing: '{text}'");
            
            // Enhanced subject mappings with more variations
            var subjectMappings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "Gujarati", "Gujarati" },
                { "Guj F.L", "Gujarati" },
                { "Guj FL", "Gujarati" },
                { "English", "English" },
                { "English F.L", "English" },
                { "English FL", "English" },
                { "Social Science", "Social Science" },
                { "Sc. & Tech", "Science and Technology" },
                { "Science & Technology", "Science and Technology" },
                { "Science", "Science" },
                { "Mathematics", "Mathematics" },
                { "Maths", "Mathematics" },
                { "Math", "Mathematics" },
                { "Hindi", "Hindi" },
                { "Sanskrit", "Sanskrit" },
                { "Computer", "Computer Science" },
                { "Physics", "Physics" },
                { "Chemistry", "Chemistry" },
                { "Biology", "Biology" }
            };

            // Try to match known subjects first
            foreach (var mapping in subjectMappings)
            {
                if (text.Contains(mapping.Key, StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine($"[Subject] Found '{mapping.Value}' from keyword '{mapping.Key}'");
                    return mapping.Value;
                }
            }

            // Try multiple extraction patterns
            var patterns = new List<string>
            {
                // Pattern 1: After year and number, before parentheses or end
                @"\d{4}\)\s*\d*[-\s]*([A-Za-z\s&.]+?)(?:\s*\(|\s*10th|\s*$)",
                
                // Pattern 2: After medium/board info
                @"(?:MED|Medium)\s+([A-Za-z\s&.]+?)(?:\s*\(|\s*$)",
                
                // Pattern 3: After grade info
                @"10th\s+(?:Guj|ENG|Hindi)?\s*(?:MED)?\s*([A-Za-z\s&.]+?)(?:\s*\(|\s*$)",
                
                // Pattern 4: Between parentheses and other text
                @"\)\s*([A-Za-z\s&.]+?)(?:\s*10th|\s*\(|\s*$)",
                
                // Pattern 5: After any number
                @"\d+\s*[-)]?\s*([A-Za-z\s&.]{3,})(?:\s*\(|\s*10th|\s*$)"
            };

            foreach (var pattern in patterns)
            {
                var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
                if (match.Success && match.Groups[1].Success)
                {
                    var extracted = match.Groups[1].Value.Trim();
                    
                    // Clean up the extracted subject
                    extracted = Regex.Replace(extracted, @"^\(|\)$", ""); // Remove parentheses
                    extracted = Regex.Replace(extracted, @"\s+", " "); // Normalize whitespace
                    extracted = extracted.Trim();
                    
                    // Skip if too short or contains unwanted patterns
                    if (!string.IsNullOrWhiteSpace(extracted) && 
                        extracted.Length > 2 && 
                        !Regex.IsMatch(extracted, @"^\d+$|^MED$|^Medium$", RegexOptions.IgnoreCase))
                    {
                        Console.WriteLine($"[Subject] Extracted '{extracted}' using pattern '{pattern}'");
                        return extracted;
                    }
                }
            }

            Console.WriteLine($"[Subject] No subject found, returning 'Unknown'");
            return "Unknown";
        }

        // Method to search papers by criteria
        public async Task<List<PastPaperScrapeDto>> SearchPapersAsync(string? keyword = null, string? year = null, string? board = null)
        {
            var allPapers = await ScrapePapersAsync();
            
            Console.WriteLine($"[Search] Searching {allPapers.Count} papers with keyword: '{keyword}', year: '{year}', board: '{board}'");
            
            return allPapers.Where(paper =>
                (string.IsNullOrEmpty(keyword) || 
                 paper.Subject.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                 paper.Title.Contains(keyword, StringComparison.OrdinalIgnoreCase)) &&
                (string.IsNullOrEmpty(year) || paper.Year == year) &&
                (string.IsNullOrEmpty(board) || 
                 paper.Board.Contains(board, StringComparison.OrdinalIgnoreCase))
            ).ToList();
        }
    }
}