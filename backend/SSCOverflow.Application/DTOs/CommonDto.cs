namespace SSCOverflow.Application.DTOs
{
    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int UsageCount { get; set; }
    }

    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public UserDto Author { get; set; } = null!;
    }

    public class CreateCommentDto
    {
        public string Content { get; set; } = string.Empty;
        public int? QuestionId { get; set; }
        public int? AnswerId { get; set; }
    }

    public class VoteDto
    {
        public int VoteType { get; set; } // 1 for upvote, -1 for downvote
        public int? QuestionId { get; set; }
        public int? AnswerId { get; set; }
    }

    public class ChatRequestDto
    {
        public string Message { get; set; } = string.Empty;
        public string? SessionId { get; set; }
    }

    public class ChatResponseDto
    {
        public string Response { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
    }

    public class PastPaperDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string? Board { get; set; }
        public string? PaperType { get; set; }
        public string? Description { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public int DownloadCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<TagDto> Tags { get; set; } = new List<TagDto>();
    }

    public class SearchDto
    {
        public string Query { get; set; } = string.Empty;
        public string? Type { get; set; } // "questions", "answers", "past-papers"
        public List<string> Tags { get; set; } = new List<string>();
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
} 