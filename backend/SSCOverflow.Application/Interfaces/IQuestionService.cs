using SSCOverflow.Application.DTOs;

namespace SSCOverflow.Application.Interfaces
{
    public interface IQuestionService
    {
        Task<IEnumerable<QuestionListDto>> GetAllQuestionsAsync(int page = 1, int pageSize = 10);
        Task<QuestionDto?> GetQuestionByIdAsync(int id);
        Task<QuestionDto> CreateQuestionAsync(CreateQuestionDto createQuestionDto, int authorId);
        Task<QuestionDto> UpdateQuestionAsync(int id, UpdateQuestionDto updateQuestionDto, int authorId);
        Task<bool> DeleteQuestionAsync(int id, int authorId);
        Task<IEnumerable<QuestionListDto>> SearchQuestionsAsync(string query, int page = 1, int pageSize = 10);
        Task<IEnumerable<QuestionListDto>> GetQuestionsByTagAsync(string tagName, int page = 1, int pageSize = 10);
        Task IncrementViewCountAsync(int questionId);
    }
} 