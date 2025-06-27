using SSCOverflow.Application.DTOs;

namespace SSCOverflow.Application.Interfaces
{
    public interface IAnswerService
    {
        Task<IEnumerable<AnswerDto>> GetAnswersByQuestionIdAsync(int questionId);
        Task<AnswerDto> CreateAnswerAsync(CreateAnswerDto createAnswerDto, int authorId);
        Task<AnswerDto> UpdateAnswerAsync(int id, UpdateAnswerDto updateAnswerDto, int authorId);
        Task<bool> DeleteAnswerAsync(int id, int authorId);
        Task<bool> AcceptAnswerAsync(int answerId, int questionAuthorId);
        Task<bool> VoteAnswerAsync(int answerId, int userId, int voteType);
    }
} 