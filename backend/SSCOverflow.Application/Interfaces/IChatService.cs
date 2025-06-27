using SSCOverflow.Application.DTOs;
using SSCOverflow.Core.Entities;

namespace SSCOverflow.Application.Interfaces
{
    public interface IChatService
    {
        Task<ChatResponseDto> GetChatResponseAsync(ChatRequestDto chatRequest, int? userId = null);
        Task<IEnumerable<ChatMessage>> GetChatHistoryAsync(int? userId = null, string? sessionId = null);
        Task ClearChatHistoryAsync(int? userId = null, string? sessionId = null);
    }
} 