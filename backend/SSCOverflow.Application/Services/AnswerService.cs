using Microsoft.EntityFrameworkCore;
using SSCOverflow.Application.DTOs;
using SSCOverflow.Application.Interfaces;
using SSCOverflow.Core.Entities;
using SSCOverflow.Infrastructure.Data;

namespace SSCOverflow.Application.Services
{
    public class AnswerService : IAnswerService
    {
        private readonly ApplicationDbContext _context;

        public AnswerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AnswerDto>> GetAnswersByQuestionIdAsync(int questionId)
        {
            var answers = await _context.Answers
                .Include(a => a.Author)
                .Include(a => a.Comments)
                .ThenInclude(c => c.Author)
                .Where(a => a.QuestionId == questionId)
                .OrderByDescending(a => a.IsAccepted)
                .ThenByDescending(a => a.VoteCount)
                .ThenBy(a => a.CreatedAt)
                .ToListAsync();

            return answers.Select(a => new AnswerDto
            {
                Id = a.Id,
                Content = a.Content,
                VoteCount = a.VoteCount,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
                IsAccepted = a.IsAccepted,
                Author = new UserDto
                {
                    Id = a.Author.Id,
                    Username = a.Author.Username,
                    FullName = a.Author.FullName
                },
                Comments = a.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Author = new UserDto
                    {
                        Id = c.Author.Id,
                        Username = c.Author.Username,
                        FullName = c.Author.FullName
                    }
                }).ToList()
            });
        }

        public async Task<AnswerDto> CreateAnswerAsync(CreateAnswerDto createAnswerDto, int authorId)
        {
            var answer = new Answer
            {
                Content = createAnswerDto.Content,
                QuestionId = createAnswerDto.QuestionId,
                AuthorId = authorId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Answers.Add(answer);

            // Update answer count on question
            var question = await _context.Questions.FindAsync(createAnswerDto.QuestionId);
            if (question != null)
            {
                question.AnswerCount++;
            }

            await _context.SaveChangesAsync();

            return await GetAnswerByIdAsync(answer.Id) ?? throw new InvalidOperationException("Failed to create answer");
        }

        public async Task<AnswerDto> UpdateAnswerAsync(int id, UpdateAnswerDto updateAnswerDto, int authorId)
        {
            var answer = await _context.Answers.FirstOrDefaultAsync(a => a.Id == id && a.AuthorId == authorId);
            if (answer == null)
                throw new InvalidOperationException("Answer not found or you don't have permission to edit it");

            answer.Content = updateAnswerDto.Content;
            answer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetAnswerByIdAsync(answer.Id) ?? throw new InvalidOperationException("Failed to update answer");
        }

        public async Task<bool> DeleteAnswerAsync(int id, int authorId)
        {
            var answer = await _context.Answers.FirstOrDefaultAsync(a => a.Id == id && a.AuthorId == authorId);
            if (answer == null) return false;

            // Update answer count on question
            var question = await _context.Questions.FindAsync(answer.QuestionId);
            if (question != null)
            {
                question.AnswerCount--;
            }

            _context.Answers.Remove(answer);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AcceptAnswerAsync(int answerId, int questionAuthorId)
        {
            var answer = await _context.Answers
                .Include(a => a.Question)
                .FirstOrDefaultAsync(a => a.Id == answerId && a.Question.AuthorId == questionAuthorId);

            if (answer == null) return false;

            // Unaccept any previously accepted answers for this question
            var previouslyAcceptedAnswers = await _context.Answers
                .Where(a => a.QuestionId == answer.QuestionId && a.IsAccepted)
                .ToListAsync();

            foreach (var prevAnswer in previouslyAcceptedAnswers)
            {
                prevAnswer.IsAccepted = false;
            }

            // Accept the new answer
            answer.IsAccepted = true;

            // Update question status
            answer.Question.IsAnswered = true;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VoteAnswerAsync(int answerId, int userId, int voteType)
        {
            // Check if user already voted
            var existingVote = await _context.Votes
                .FirstOrDefaultAsync(v => v.AnswerId == answerId && v.UserId == userId);

            if (existingVote != null)
            {
                // Update existing vote
                existingVote.VoteType = voteType;
                existingVote.CreatedAt = DateTime.UtcNow;
            }
            else
            {
                // Create new vote
                var vote = new Vote
                {
                    AnswerId = answerId,
                    UserId = userId,
                    VoteType = voteType,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Votes.Add(vote);
            }

            // Update answer vote count
            var answer = await _context.Answers.FindAsync(answerId);
            if (answer != null)
            {
                answer.VoteCount = await _context.Votes
                    .Where(v => v.AnswerId == answerId)
                    .SumAsync(v => v.VoteType);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<AnswerDto?> GetAnswerByIdAsync(int id)
        {
            var answer = await _context.Answers
                .Include(a => a.Author)
                .Include(a => a.Comments)
                .ThenInclude(c => c.Author)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (answer == null) return null;

            return new AnswerDto
            {
                Id = answer.Id,
                Content = answer.Content,
                VoteCount = answer.VoteCount,
                CreatedAt = answer.CreatedAt,
                UpdatedAt = answer.UpdatedAt,
                IsAccepted = answer.IsAccepted,
                Author = new UserDto
                {
                    Id = answer.Author.Id,
                    Username = answer.Author.Username,
                    FullName = answer.Author.FullName
                },
                Comments = answer.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Author = new UserDto
                    {
                        Id = c.Author.Id,
                        Username = c.Author.Username,
                        FullName = c.Author.FullName
                    }
                }).ToList()
            };
        }
    }
} 