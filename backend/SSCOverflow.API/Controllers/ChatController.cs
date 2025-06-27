// File: SSCOverflow.API/Controllers/ChatController.cs

using Microsoft.AspNetCore.Mvc;
using SSCOverflow.Application.DTOs;
using SSCOverflow.Application.Interfaces;
using SSCOverflow.Core.Entities;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration; // Added this using statement

namespace SSCOverflow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public ChatController(IChatService chatService, IConfiguration configuration, HttpClient httpClient)
        {
            _chatService = chatService;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        // POST: api/chat
        [HttpPost]
        public async Task<ActionResult<ChatResponseDto>> SendMessage(ChatRequestDto chatRequest)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(chatRequest.Message))
                {
                    return BadRequest(new { message = "Message cannot be empty" });
                }

                // TODO: Get actual user ID from JWT token
                int? userId = null;

                // Use the service to generate response (which handles fallbacks)
                var response = await _chatService.GetChatResponseAsync(chatRequest, userId);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing your message", error = ex.Message });
            }
        }

        // GET: api/chat/history
        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<ChatMessage>>> GetChatHistory(
            [FromQuery] string? sessionId = null)
        {
            try
            {
                int? userId = null;
                var history = await _chatService.GetChatHistoryAsync(userId, sessionId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving chat history", error = ex.Message });
            }
        }

        // DELETE: api/chat/history
        [HttpDelete("history")]
        public async Task<IActionResult> ClearChatHistory([FromQuery] string? sessionId = null)
        {
            try
            {
                int? userId = null;
                await _chatService.ClearChatHistoryAsync(userId, sessionId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while clearing chat history", error = ex.Message });
            }
        }

        // GET: api/chat/session
        [HttpGet("session")]
        public ActionResult<string> GetNewSession()
        {
            var sessionId = Guid.NewGuid().ToString();
            return Ok(new { sessionId });
        }

        // GET: api/chat/debug-config
        [HttpGet("debug-config")]
        public ActionResult<object> DebugConfig()
        {
            var geminiApiKey = _configuration["Gemini:ApiKey"];
            var openAiApiKey = _configuration["OpenAI:ApiKey"];
            
            return Ok(new
            {
                GeminiApiKeyConfigured = !string.IsNullOrEmpty(geminiApiKey),
                GeminiApiKeyLength = geminiApiKey?.Length ?? 0,
                GeminiApiKeyStart = geminiApiKey?.Substring(0, Math.Min(10, geminiApiKey?.Length ?? 0)) + "...",
                OpenAiApiKeyConfigured = !string.IsNullOrEmpty(openAiApiKey),
                OpenAiApiKeyLength = openAiApiKey?.Length ?? 0
            });
        }

        // GET: api/chat/test-gemini
        [HttpGet("test-gemini")]
        public async Task<ActionResult<string>> TestGemini()
        {
            try
            {
                var geminiApiKey = _configuration["Gemini:ApiKey"];
                
                if (string.IsNullOrEmpty(geminiApiKey))
                {
                    return BadRequest("Gemini API key not configured");
                }

                var testRequestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new
                                {
                                    text = "Hello, please respond with 'Gemini API is working' if you can see this message."
                                }
                            }
                        }
                    }
                };

                var json = JsonSerializer.Serialize(testRequestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={geminiApiKey}";
                
                Console.WriteLine($"Testing Gemini API with URL: {url}");
                var response = await _httpClient.PostAsync(url, content);
                
                Console.WriteLine($"Test response status: {response.StatusCode}");
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Test response content: {responseContent}");
                
                if (response.IsSuccessStatusCode)
                {
                    return Ok($"Gemini API Test Successful! Response: {responseContent}");
                }
                else
                {
                    return BadRequest($"Gemini API Test Failed! Status: {response.StatusCode}, Response: {responseContent}");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Test failed with exception: {ex.Message}");
            }
        }
    }
}