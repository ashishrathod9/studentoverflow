using System.ComponentModel.DataAnnotations;

namespace SSCOverflow.Application.DTOs
{
    public class CreateQuestionDto
    {
        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public List<string> Tags { get; set; } = new List<string>();
    }

    public class UpdateQuestionDto
    {
        [Required]
        [StringLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public List<string> Tags { get; set; } = new List<string>();
    }

    public class QuestionDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public int VoteCount { get; set; }
        public int AnswerCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsAnswered { get; set; }
        public bool IsClosed { get; set; }
        public UserDto Author { get; set; } = null!;
        public List<TagDto> Tags { get; set; } = new List<TagDto>();
        public List<AnswerDto> Answers { get; set; } = new List<AnswerDto>();
        public List<CommentDto> Comments { get; set; } = new List<CommentDto>();
    }

    public class QuestionListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public int VoteCount { get; set; }
        public int AnswerCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsAnswered { get; set; }
        public UserDto Author { get; set; } = null!;
        public List<TagDto> Tags { get; set; } = new List<TagDto>();
    }
} 