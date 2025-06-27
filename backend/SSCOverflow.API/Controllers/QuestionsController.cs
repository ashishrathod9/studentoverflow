using Microsoft.AspNetCore.Mvc;
using SSCOverflow.Application.DTOs;
using SSCOverflow.Application.Interfaces;

namespace SSCOverflow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly IQuestionService _questionService;

        public QuestionsController(IQuestionService questionService)
        {
            _questionService = questionService;
        }

        // GET: api/questions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuestionListDto>>> GetQuestions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var questions = await _questionService.GetAllQuestionsAsync(page, pageSize);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving questions", error = ex.Message });
            }
        }

        // GET: api/questions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<QuestionDto>> GetQuestion(int id)
        {
            try
            {
                var question = await _questionService.GetQuestionByIdAsync(id);
                if (question == null)
                {
                    return NotFound(new { message = "Question not found" });
                }

                // Increment view count
                await _questionService.IncrementViewCountAsync(id);

                return Ok(question);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the question", error = ex.Message });
            }
        }

        // POST: api/questions
        [HttpPost]
        public async Task<ActionResult<QuestionDto>> CreateQuestion(CreateQuestionDto createQuestionDto)
        {
            try
            {
                // TODO: Get actual user ID from JWT token
                // For now, using a hardcoded user ID for testing
                int authorId = 1;

                var question = await _questionService.CreateQuestionAsync(createQuestionDto, authorId);
                return CreatedAtAction(nameof(GetQuestion), new { id = question.Id }, question);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the question", error = ex.Message });
            }
        }

        // PUT: api/questions/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestion(int id, UpdateQuestionDto updateQuestionDto)
        {
            try
            {
                // TODO: Get actual user ID from JWT token
                int authorId = 1;

                var question = await _questionService.UpdateQuestionAsync(id, updateQuestionDto, authorId);
                return Ok(question);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the question", error = ex.Message });
            }
        }

        // DELETE: api/questions/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            try
            {
                // TODO: Get actual user ID from JWT token
                int authorId = 1;

                var result = await _questionService.DeleteQuestionAsync(id, authorId);
                if (!result)
                {
                    return NotFound(new { message = "Question not found or you don't have permission to delete it" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the question", error = ex.Message });
            }
        }

        // GET: api/questions/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<QuestionListDto>>> SearchQuestions(
            [FromQuery] string query,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return BadRequest(new { message = "Search query is required" });
                }

                var questions = await _questionService.SearchQuestionsAsync(query, page, pageSize);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while searching questions", error = ex.Message });
            }
        }

        // GET: api/questions/tag/{tagName}
        [HttpGet("tag/{tagName}")]
        public async Task<ActionResult<IEnumerable<QuestionListDto>>> GetQuestionsByTag(
            string tagName,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var questions = await _questionService.GetQuestionsByTagAsync(tagName, page, pageSize);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving questions by tag", error = ex.Message });
            }
        }
    }
} 