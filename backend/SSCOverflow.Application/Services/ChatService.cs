using Microsoft.EntityFrameworkCore;
using SSCOverflow.Application.DTOs;
using SSCOverflow.Application.Interfaces;
using SSCOverflow.Core.Entities;
using SSCOverflow.Infrastructure.Data;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace SSCOverflow.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public ChatService(ApplicationDbContext context, IConfiguration configuration, HttpClient httpClient)
        {
            _context = context;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<ChatResponseDto> GetChatResponseAsync(ChatRequestDto chatRequest, int? userId = null)
        {
            try
            {
                // Generate AI response
                var aiResponse = await GenerateAIResponseAsync(chatRequest.Message);

                // Save chat message to database
                var chatMessage = new ChatMessage
                {
                    Message = chatRequest.Message,
                    Response = aiResponse,
                    UserId = userId,
                    SessionId = chatRequest.SessionId ?? Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow
                };

                _context.ChatMessages.Add(chatMessage);
                await _context.SaveChangesAsync();

                return new ChatResponseDto
                {
                    Response = aiResponse,
                    SessionId = chatMessage.SessionId
                };
            }
            catch (Exception ex)
            {
                // Fallback response if AI fails
                var fallbackResponse = "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
                
                return new ChatResponseDto
                {
                    Response = fallbackResponse,
                    SessionId = chatRequest.SessionId ?? Guid.NewGuid().ToString()
                };
            }
        }

        public async Task<IEnumerable<ChatMessage>> GetChatHistoryAsync(int? userId = null, string? sessionId = null)
        {
            var query = _context.ChatMessages.AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(c => c.UserId == userId);
            }

            if (!string.IsNullOrEmpty(sessionId))
            {
                query = query.Where(c => c.SessionId == sessionId);
            }

            return await query
                .OrderBy(c => c.CreatedAt)
                .Take(50) // Limit to last 50 messages
                .ToListAsync();
        }

        public async Task ClearChatHistoryAsync(int? userId = null, string? sessionId = null)
        {
            var query = _context.ChatMessages.AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(c => c.UserId == userId);
            }

            if (!string.IsNullOrEmpty(sessionId))
            {
                query = query.Where(c => c.SessionId == sessionId);
            }

            var messagesToDelete = await query.ToListAsync();
            _context.ChatMessages.RemoveRange(messagesToDelete);
            await _context.SaveChangesAsync();
        }

        private async Task<string> GenerateAIResponseAsync(string message)
        {
            try
            {
                // Check if Gemini API key is configured
                var geminiApiKey = _configuration["Gemini:ApiKey"];
                
                if (!string.IsNullOrEmpty(geminiApiKey))
                {
                    try
                    {
                        // Try Gemini API first
                        var geminiResponse = await CallGeminiAsync(message, geminiApiKey);
                        Console.WriteLine($"Gemini API call successful for message: {message.Substring(0, Math.Min(50, message.Length))}...");
                        return geminiResponse;
                    }
                    catch (Exception geminiEx)
                    {
                        Console.WriteLine($"Gemini API call failed: {geminiEx.Message}");
                        // Continue to OpenAI or mock response
                    }
                }
                else
                {
                    Console.WriteLine("No Gemini API key configured");
                }

                // Check if OpenAI API key is configured
                var openAiApiKey = _configuration["OpenAI:ApiKey"];
                
                if (!string.IsNullOrEmpty(openAiApiKey))
                {
                    try
                    {
                        // Try OpenAI API
                        var openAiResponse = await CallOpenAIAsync(message, openAiApiKey);
                        Console.WriteLine($"OpenAI API call successful for message: {message.Substring(0, Math.Min(50, message.Length))}...");
                        return openAiResponse;
                    }
                    catch (Exception openAiEx)
                    {
                        Console.WriteLine($"OpenAI API call failed: {openAiEx.Message}");
                        // Continue to mock response
                    }
                }
                else
                {
                    Console.WriteLine("No OpenAI API key configured");
                }

                // Return mock response if no API key or all API calls failed
                Console.WriteLine("Using mock response as fallback");
                return await GenerateMockResponseAsync(message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GenerateAIResponseAsync: {ex.Message}");
                // Fallback to mock response
                return await GenerateMockResponseAsync(message);
            }
        }

        private async Task<string> CallGeminiAsync(string message, string apiKey)
        {
            // Detect language of the message
            var detectedLanguage = DetectLanguage(message);
            Console.WriteLine($"Detected language: {detectedLanguage} for message: {message.Substring(0, Math.Min(30, message.Length))}...");
            
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new
                            {
                                text = $@"
You are an expert educational assistant for SSC (Secondary School Certificate) students.

Your role is to provide comprehensive, detailed, and educational responses that help students understand concepts thoroughly.

CRITICAL LANGUAGE REQUIREMENT: You MUST respond in exactly the same language as the student's question.
- If the student asks in Hindi, respond ONLY in Hindi
- If the student asks in Gujarati, respond ONLY in Gujarati
- If the student asks in English, respond ONLY in English
- If the student uses mixed language, respond in the primary language they used

Guidelines for your responses:
1. **Organize your answer clearly** using **bold headings** (e.g., **Photosynthesis Process**), subheadings, and bullet points.
2. Use **numbered steps** for processes or explanations.
3. Indent sub-points and examples for clarity.
4. Highlight key points in bold or with symbols.
5. Include relevant formulas, definitions, and key facts.
6. Add practical examples and real-world applications.
7. Provide study tips and exam preparation advice when appropriate.
8. If possible, include relevant images or diagrams by providing direct image URLs (e.g., https://...jpg or .png) with a short caption. If no image is available, suggest what kind of image or diagram would help.
9. Structure your response for easy reading and revision.
10. ALWAYS use the same language as the student's question.
11.give paragraph wise content

Student Question: {message}
Detected Language: {detectedLanguage}

IMPORTANT: Respond in {detectedLanguage} language only. Do not mix languages.
**Format your answer with bold headings, clear indentation, bullet/numbered lists, and image links (with captions) where helpful.**
"
                            }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.7,
                    topK = 40,
                    topP = 0.95,
                    maxOutputTokens = 2048,
                    candidateCount = 1
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();

            // Use the Gemini 2.0 Flash model with v1beta endpoint
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";
            Console.WriteLine($"Calling Gemini API with URL: {url}");
            
            var response = await _httpClient.PostAsync(url, content);
            Console.WriteLine($"Gemini API response status: {response.StatusCode}");
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Gemini API response content length: {responseContent.Length}");
                var responseObject = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
                
                var result = responseObject?.candidates?.FirstOrDefault()?.content?.parts?.FirstOrDefault()?.text ?? "I'm sorry, I couldn't generate a response.";
                Console.WriteLine($"Gemini response extracted: {result.Substring(0, Math.Min(100, result.Length))}...");
                return result;
            }

            // Log the error response for debugging
            var errorContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Gemini API error response: {errorContent}");
            throw new Exception($"Gemini API call failed: {response.StatusCode}. Response: {errorContent}");
        }

        private string DetectLanguage(string message)
        {
            // Simple language detection based on common words and characters
            var lowerMessage = message.ToLower();
            
            // Check for explicit language requests first
            if (lowerMessage.Contains("in hindi") || lowerMessage.Contains("हिंदी में") || lowerMessage.Contains("હિન્દીમાં"))
            {
                return "Hindi";
            }
            
            if (lowerMessage.Contains("in gujarati") || lowerMessage.Contains("ગુજરાતીમાં") || lowerMessage.Contains("गुजराती में"))
            {
                return "Gujarati";
            }
            
            if (lowerMessage.Contains("in english") || lowerMessage.Contains("अंग्रेजी में") || lowerMessage.Contains("ઇંગ્લિશમાં"))
            {
                return "English";
            }
            
            // Hindi detection - check for Hindi characters first, then common words
            if (ContainsHindiCharacters(message))
            {
                return "Hindi";
            }
            
            // Gujarati detection - check for Gujarati characters first, then common words
            if (ContainsGujaratiCharacters(message))
            {
                return "Gujarati";
            }
            
            // Check for common Hindi words (even in English script)
            var hindiWords = new[] { "kya", "kaise", "kahan", "kab", "kaun", "kyun", "mein", "ka", "ki", "hai", "hain", "tha", "thi", "the", "thin" };
            if (hindiWords.Any(word => lowerMessage.Contains(word)))
            {
                return "Hindi";
            }
            
            // Check for common Gujarati words (even in English script)
            var gujaratiWords = new[] { "shu", "kevi", "kyan", "kyare", "kon", "sha mate", "mane", "no", "ni", "che", "hatu", "hati", "hata", "hati" };
            if (gujaratiWords.Any(word => lowerMessage.Contains(word)))
            {
                return "Gujarati";
            }
            
            // Check for explicit language indicators in the message
            if (lowerMessage.Contains("hindi") || lowerMessage.Contains("हिंदी") || lowerMessage.Contains("હિન્દી"))
            {
                return "Hindi";
            }
            
            if (lowerMessage.Contains("gujarati") || lowerMessage.Contains("ગુજરાતી") || lowerMessage.Contains("गुजराती"))
            {
                return "Gujarati";
            }
            
            // Default to English
            return "English";
        }

        private bool ContainsHindiCharacters(string text)
        {
            // Hindi Unicode range: \u0900-\u097F
            return text.Any(c => c >= '\u0900' && c <= '\u097F');
        }

        private bool ContainsGujaratiCharacters(string text)
        {
            // Gujarati Unicode range: \u0A80-\u0AFF
            return text.Any(c => c >= '\u0A80' && c <= '\u0AFF');
        }

        private async Task<string> CallOpenAIAsync(string message, string apiKey)
        {
            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = new[]
                {
                    new { role = "system", content = "You are a helpful educational assistant for SSC (Secondary School Certificate) students. Provide clear, accurate, and educational responses. Keep answers concise but informative." },
                    new { role = "user", content = message }
                },
                max_tokens = 500,
                temperature = 0.7
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var responseObject = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);
                
                return responseObject?.choices?.FirstOrDefault()?.message?.content ?? "I'm sorry, I couldn't generate a response.";
            }

            throw new Exception($"OpenAI API call failed: {response.StatusCode}");
        }

        private async Task<string> GenerateMockResponseAsync(string message)
        {
            var lowerMessage = message.ToLower();
            var random = new Random();
            
            // Generate dynamic responses based on message content
            if (lowerMessage.Contains("hello") || lowerMessage.Contains("hi"))
            {
                var greetings = new[]
                {
                    "Hello there! I'm excited to help you with your SSC studies today. What subject would you like to explore?",
                    "Hi! Welcome to your personalized SSC study assistant. I'm here to make learning easier for you. What can I help you with?",
                    "Greetings! I'm ready to assist you with your SSC exam preparation. Which topic would you like to discuss?"
                };
                return greetings[random.Next(greetings.Length)];
            }
            
            if (lowerMessage.Contains("math") || lowerMessage.Contains("mathematics") || lowerMessage.Contains("algebra") || lowerMessage.Contains("geometry"))
            {
                var mathTopics = new[]
                {
                    "Mathematics is fascinating! I can help you with algebra, geometry, trigonometry, calculus, and more. What specific concept are you struggling with?",
                    "Math can be challenging but very rewarding. I'm here to break down complex problems into simple steps. What math topic would you like to explore?",
                    "From basic arithmetic to advanced algebra, I can guide you through any mathematical concept. What's your current math question?"
                };
                return mathTopics[random.Next(mathTopics.Length)];
            }
            
            if (lowerMessage.Contains("english") || lowerMessage.Contains("grammar") || lowerMessage.Contains("literature"))
            {
                var englishTopics = new[]
                {
                    "English is essential for effective communication. I can help with grammar rules, literature analysis, writing skills, and comprehension. What area interests you?",
                    "Mastering English opens many doors. Whether it's grammar, vocabulary, or literature, I'm here to help you improve. What would you like to focus on?",
                    "English skills are crucial for SSC success. I can assist with grammar, writing, reading comprehension, and literary analysis. What's your question?"
                };
                return englishTopics[random.Next(englishTopics.Length)];
            }
            
            if (lowerMessage.Contains("science") || lowerMessage.Contains("physics") || lowerMessage.Contains("chemistry") || lowerMessage.Contains("biology"))
            {
                var scienceTopics = new[]
                {
                    "Science is all around us! I can help you understand physics, chemistry, and biology concepts. Which branch of science are you studying?",
                    "Science explains how our world works. From atoms to ecosystems, I can make complex scientific concepts easy to understand. What science topic do you need help with?",
                    "The scientific method helps us discover truth. I can guide you through physics, chemistry, and biology concepts. What scientific question do you have?"
                };
                return scienceTopics[random.Next(scienceTopics.Length)];
            }
            
            if (lowerMessage.Contains("history") || lowerMessage.Contains("historical"))
            {
                var historyTopics = new[]
                {
                    "History teaches us valuable lessons from the past. I can help you understand historical events, their causes, and their significance. What period of history interests you?",
                    "Understanding history helps us make sense of the present. I can assist with dates, events, and their impact on society. What historical topic would you like to explore?",
                    "History is a story of human progress and challenges. I can help you analyze historical events and their relevance to today's world. What history question do you have?"
                };
                return historyTopics[random.Next(historyTopics.Length)];
            }
            
            if (lowerMessage.Contains("geography") || lowerMessage.Contains("map") || lowerMessage.Contains("climate"))
            {
                var geographyTopics = new[]
                {
                    "Geography helps us understand our planet and its diverse environments. I can assist with physical geography, human geography, and map reading. What geographical concept do you want to learn about?",
                    "From mountains to oceans, geography covers our entire world. I can help you understand climate, population, resources, and geographical features. What geography topic interests you?",
                    "Geography connects us to different places and cultures. I can guide you through physical features, climate patterns, and human geography. What would you like to explore?"
                };
                return geographyTopics[random.Next(geographyTopics.Length)];
            }
            
            if (lowerMessage.Contains("exam") || lowerMessage.Contains("test") || lowerMessage.Contains("study"))
            {
                var studyTips = new[]
                {
                    "Effective studying is key to SSC success! I can share study strategies, time management tips, and exam preparation techniques. What aspect of studying would you like to improve?",
                    "Preparing for exams requires a good strategy. I can help you develop study plans, memory techniques, and test-taking skills. What study challenge are you facing?",
                    "Success in SSC exams comes from smart preparation. I can guide you through effective study methods, revision techniques, and stress management. What study help do you need?"
                };
                return studyTips[random.Next(studyTips.Length)];
            }
            
            if (lowerMessage.Contains("formula") || lowerMessage.Contains("equation"))
            {
                var formulaTopics = new[]
                {
                    "Formulas and equations are the language of science and math. I can help you understand when and how to use different formulas. What specific formula are you working with?",
                    "Mathematical and scientific formulas can seem complex, but they follow logical patterns. I can break down any formula and explain its components. What formula do you need help understanding?",
                    "Formulas are tools that help us solve problems efficiently. I can teach you how to derive, remember, and apply various formulas. Which formula would you like to learn about?"
                };
                return formulaTopics[random.Next(formulaTopics.Length)];
            }
            
            if (lowerMessage.Contains("help") || lowerMessage.Contains("confused"))
            {
                var helpResponses = new[]
                {
                    "I'm here to help clarify any confusion! Learning can be challenging, but together we can make it easier. What specific concept is unclear to you?",
                    "Don't worry about being confused - it's part of the learning process! I can explain things in different ways until they make sense. What topic are you struggling with?",
                    "Confusion often leads to better understanding. Let me help you work through this step by step. What exactly is unclear to you?"
                };
                return helpResponses[random.Next(helpResponses.Length)];
            }
            
            if (lowerMessage.Contains("thank"))
            {
                var thankResponses = new[]
                {
                    "You're very welcome! I'm glad I could help. Feel free to ask more questions anytime - I'm here to support your learning journey.",
                    "It's my pleasure to help you learn! Don't hesitate to come back with more questions. Good luck with your studies!",
                    "You're welcome! I enjoy helping students succeed. Keep up the great work and remember that learning is a continuous process."
                };
                return thankResponses[random.Next(thankResponses.Length)];
            }

            // Dynamic default responses for unrecognized messages
            var defaultResponses = new[]
            {
                "That's an interesting question! I'm here to help you with all your SSC studies. I can assist with Mathematics, English, Science, History, Geography, and more. What would you like to learn about?",
                "I'm excited to help you explore this topic! As your SSC study assistant, I can provide detailed explanations, examples, and study tips. What specific area would you like to focus on?",
                "Great question! I'm designed to help SSC students like you succeed. I can break down complex topics, provide examples, and guide you through difficult concepts. What subject are you working on?",
                "I'm here to make your SSC studies easier and more effective! I can help with any subject, provide step-by-step explanations, and share study strategies. What would you like to discuss?",
                "That's a wonderful topic to explore! I can help you understand concepts deeply, provide relevant examples, and prepare you for your SSC exams. What specific question do you have?"
            };
            
            return defaultResponses[random.Next(defaultResponses.Length)];
        }

        // OpenAI API response models
        private class OpenAIResponse
        {
            public List<Choice> choices { get; set; } = new();
        }

        private class Choice
        {
            public Message message { get; set; } = new();
        }

        private class Message
        {
            public string content { get; set; } = string.Empty;
        }

        // Gemini API response models
        private class GeminiResponse
        {
            public List<GeminiCandidate> candidates { get; set; } = new();
        }

        private class GeminiCandidate
        {
            public GeminiContent content { get; set; } = new();
        }

        private class GeminiContent
        {
            public List<GeminiPart> parts { get; set; } = new();
        }

        private class GeminiPart
        {
            public string text { get; set; } = string.Empty;
        }
    }
} 