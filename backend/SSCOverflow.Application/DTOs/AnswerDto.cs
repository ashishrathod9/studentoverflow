using System.ComponentModel.DataAnnotations;

namespace SSCOverflow.Application.DTOs
{
    public class CreateAnswerDto
    {
        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public int QuestionId { get; set; }
    }

    public class UpdateAnswerDto
    {
        [Required]
        public string Content { get; set; } = string.Empty;
    }

    public class AnswerDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int VoteCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsAccepted { get; set; }
        public UserDto Author { get; set; } = null!;
        public List<CommentDto> Comments { get; set; } = new List<CommentDto>();
    }
} 