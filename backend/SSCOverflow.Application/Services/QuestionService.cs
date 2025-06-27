using Microsoft.EntityFrameworkCore;
using SSCOverflow.Application.DTOs;
using SSCOverflow.Application.Interfaces;
using SSCOverflow.Core.Entities;
using SSCOverflow.Infrastructure.Data;

namespace SSCOverflow.Application.Services
{
    public class QuestionService : IQuestionService
    {
        private readonly ApplicationDbContext _context;

        public QuestionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<QuestionListDto>> GetAllQuestionsAsync(int page = 1, int pageSize = 10)
        {
            var questions = await _context.Questions
                .Include(q => q.Author)
                .Include(q => q.QuestionTags)
                .ThenInclude(qt => qt.Tag)
                .OrderByDescending(q => q.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return questions.Select(q => new QuestionListDto
            {
                Id = q.Id,
                Title = q.Title,
                ViewCount = q.ViewCount,
                VoteCount = q.VoteCount,
                AnswerCount = q.AnswerCount,
                CreatedAt = q.CreatedAt,
                IsAnswered = q.IsAnswered,
                Author = new UserDto
                {
                    Id = q.Author.Id,
                    Username = q.Author.Username,
                    FullName = q.Author.FullName
                },
                Tags = q.QuestionTags.Select(qt => new TagDto
                {
                    Id = qt.Tag.Id,
                    Name = qt.Tag.Name,
                    Description = qt.Tag.Description,
                    UsageCount = qt.Tag.UsageCount
                }).ToList()
            });
        }

        public async Task<QuestionDto?> GetQuestionByIdAsync(int id)
        {
            var question = await _context.Questions
                .Include(q => q.Author)
                .Include(q => q.QuestionTags)
                .ThenInclude(qt => qt.Tag)
                .Include(q => q.Answers)
                .ThenInclude(a => a.Author)
                .Include(q => q.Comments)
                .ThenInclude(c => c.Author)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (question == null) return null;

            return new QuestionDto
            {
                Id = question.Id,
                Title = question.Title,
                Content = question.Content,
                ViewCount = question.ViewCount,
                VoteCount = question.VoteCount,
                AnswerCount = question.AnswerCount,
                CreatedAt = question.CreatedAt,
                UpdatedAt = question.UpdatedAt,
                IsAnswered = question.IsAnswered,
                IsClosed = question.IsClosed,
                Author = new UserDto
                {
                    Id = question.Author.Id,
                    Username = question.Author.Username,
                    FullName = question.Author.FullName,
                    Bio = question.Author.Bio,
                    ProfilePictureUrl = question.Author.ProfilePictureUrl,
                    CreatedAt = question.Author.CreatedAt,
                    Reputation = question.Author.Reputation
                },
                Tags = question.QuestionTags.Select(qt => new TagDto
                {
                    Id = qt.Tag.Id,
                    Name = qt.Tag.Name,
                    Description = qt.Tag.Description,
                    UsageCount = qt.Tag.UsageCount
                }).ToList(),
                Answers = question.Answers.Select(a => new AnswerDto
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
                    }
                }).ToList(),
                Comments = question.Comments.Select(c => new CommentDto
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

        public async Task<QuestionDto> CreateQuestionAsync(CreateQuestionDto createQuestionDto, int authorId)
        {
            var question = new Question
            {
                Title = createQuestionDto.Title,
                Content = createQuestionDto.Content,
                AuthorId = authorId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            // Handle tags
            foreach (var tagName in createQuestionDto.Tags)
            {
                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name.ToLower() == tagName.ToLower());
                if (tag == null)
                {
                    tag = new Tag
                    {
                        Name = tagName,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Tags.Add(tag);
                    await _context.SaveChangesAsync();
                }

                var questionTag = new QuestionTag
                {
                    QuestionId = question.Id,
                    TagId = tag.Id
                };
                _context.QuestionTags.Add(questionTag);
            }

            await _context.SaveChangesAsync();

            return await GetQuestionByIdAsync(question.Id) ?? throw new InvalidOperationException("Failed to create question");
        }

        public async Task<QuestionDto> UpdateQuestionAsync(int id, UpdateQuestionDto updateQuestionDto, int authorId)
        {
            var question = await _context.Questions
                .Include(q => q.QuestionTags)
                .FirstOrDefaultAsync(q => q.Id == id && q.AuthorId == authorId);

            if (question == null)
                throw new InvalidOperationException("Question not found or you don't have permission to edit it");

            question.Title = updateQuestionDto.Title;
            question.Content = updateQuestionDto.Content;
            question.UpdatedAt = DateTime.UtcNow;

            // Update tags
            _context.QuestionTags.RemoveRange(question.QuestionTags);
            foreach (var tagName in updateQuestionDto.Tags)
            {
                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name.ToLower() == tagName.ToLower());
                if (tag == null)
                {
                    tag = new Tag
                    {
                        Name = tagName,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Tags.Add(tag);
                    await _context.SaveChangesAsync();
                }

                var questionTag = new QuestionTag
                {
                    QuestionId = question.Id,
                    TagId = tag.Id
                };
                _context.QuestionTags.Add(questionTag);
            }

            await _context.SaveChangesAsync();

            return await GetQuestionByIdAsync(question.Id) ?? throw new InvalidOperationException("Failed to update question");
        }

        public async Task<bool> DeleteQuestionAsync(int id, int authorId)
        {
            var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == id && q.AuthorId == authorId);
            if (question == null) return false;

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<QuestionListDto>> SearchQuestionsAsync(string query, int page = 1, int pageSize = 10)
        {
            var questions = await _context.Questions
                .Include(q => q.Author)
                .Include(q => q.QuestionTags)
                .ThenInclude(qt => qt.Tag)
                .Where(q => q.Title.Contains(query) || q.Content.Contains(query))
                .OrderByDescending(q => q.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return questions.Select(q => new QuestionListDto
            {
                Id = q.Id,
                Title = q.Title,
                ViewCount = q.ViewCount,
                VoteCount = q.VoteCount,
                AnswerCount = q.AnswerCount,
                CreatedAt = q.CreatedAt,
                IsAnswered = q.IsAnswered,
                Author = new UserDto
                {
                    Id = q.Author.Id,
                    Username = q.Author.Username,
                    FullName = q.Author.FullName
                },
                Tags = q.QuestionTags.Select(qt => new TagDto
                {
                    Id = qt.Tag.Id,
                    Name = qt.Tag.Name,
                    Description = qt.Tag.Description,
                    UsageCount = qt.Tag.UsageCount
                }).ToList()
            });
        }

        public async Task<IEnumerable<QuestionListDto>> GetQuestionsByTagAsync(string tagName, int page = 1, int pageSize = 10)
        {
            var questions = await _context.Questions
                .Include(q => q.Author)
                .Include(q => q.QuestionTags)
                .ThenInclude(qt => qt.Tag)
                .Where(q => q.QuestionTags.Any(qt => qt.Tag.Name.ToLower() == tagName.ToLower()))
                .OrderByDescending(q => q.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return questions.Select(q => new QuestionListDto
            {
                Id = q.Id,
                Title = q.Title,
                ViewCount = q.ViewCount,
                VoteCount = q.VoteCount,
                AnswerCount = q.AnswerCount,
                CreatedAt = q.CreatedAt,
                IsAnswered = q.IsAnswered,
                Author = new UserDto
                {
                    Id = q.Author.Id,
                    Username = q.Author.Username,
                    FullName = q.Author.FullName
                },
                Tags = q.QuestionTags.Select(qt => new TagDto
                {
                    Id = qt.Tag.Id,
                    Name = qt.Tag.Name,
                    Description = qt.Tag.Description,
                    UsageCount = qt.Tag.UsageCount
                }).ToList()
            });
        }

        public async Task IncrementViewCountAsync(int questionId)
        {
            var question = await _context.Questions.FindAsync(questionId);
            if (question != null)
            {
                question.ViewCount++;
                await _context.SaveChangesAsync();
            }
        }
    }
} 