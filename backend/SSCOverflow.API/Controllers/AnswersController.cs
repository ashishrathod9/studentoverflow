using Microsoft.AspNetCore.Mvc;
using SSCOverflow.Application.DTOs;
using SSCOverflow.Application.Interfaces;

namespace SSCOverflow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnswersController : ControllerBase
    {
        private readonly IAnswerService _answerService;

        public AnswersController(IAnswerService answerService)
        {
            _answerService = answerService;
        }

        // GET: api/answers/question/{questionId}
        [HttpGet("question/{questionId}")]
        public async Task<ActionResult<IEnumerable<AnswerDto>>> GetAnswersByQuestion(int questionId)
        {
            try
            {
                var answers = await _answerService.GetAnswersByQuestionIdAsync(questionId);
                return Ok(answers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving answers", error = ex.Message });
            }
        }

        // POST: api/answers
        [HttpPost]
        public async Task<ActionResult<AnswerDto>> CreateAnswer(CreateAnswerDto createAnswerDto)
        {
            try
            {
                // TODO: Get actual user ID from JWT token
                int authorId = 1;

                var answer = await _answerService.CreateAnswerAsync(createAnswerDto, authorId);
                return CreatedAtAction(nameof(GetAnswersByQuestion), new { questionId = answer.Id }, answer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the answer", error = ex.Message });
            }
        }

        // PUT: api/answers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnswer(int id, UpdateAnswerDto updateAnswerDto)
        {
            try
            {
                // TODO: Get actual user ID from JWT token
                int authorId = 1;

                var answer = await _answerService.UpdateAnswerAsync(id, updateAnswerDto, authorId);
                return Ok(answer);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the answer", error = ex.Message });
            }
        }

        // DELETE: api/answers/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnswer(int id)
        {
            try
            {
                // TODO: Get actual user ID from JWT token
                int authorId = 1;

                var result = await _answerService.DeleteAnswerAsync(id, authorId);
                if (!result)
                {
                    return NotFound(new { message = "Answer not found or you don't have permission to delete it" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the answer", error = ex.Message });
            }
        }

        // POST: api/answers/{id}/accept
        [HttpPost("{id}/accept")]
        public async Task<IActionResult> AcceptAnswer(int id)
        {
            try
            {
                // TODO: Get actual user ID from JWT token
                int questionAuthorId = 1;

                var result = await _answerService.AcceptAnswerAsync(id, questionAuthorId);
                if (!result)
                {
                    return BadRequest(new { message = "Unable to accept answer. Make sure you are the question author." });
                }

                return Ok(new { message = "Answer accepted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while accepting the answer", error = ex.Message });
            }
        }

        // POST: api/answers/{id}/vote
        [HttpPost("{id}/vote")]
        public async Task<IActionResult> VoteAnswer(int id, [FromBody] VoteDto voteDto)
        {
            try
            {
                // TODO: Get actual user ID from JWT token
                int userId = 1;

                if (voteDto.VoteType != 1 && voteDto.VoteType != -1)
                {
                    return BadRequest(new { message = "Vote type must be 1 (upvote) or -1 (downvote)" });
                }

                var result = await _answerService.VoteAnswerAsync(id, userId, voteDto.VoteType);
                if (!result)
                {
                    return BadRequest(new { message = "Unable to vote on answer" });
                }

                return Ok(new { message = "Vote recorded successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while voting on the answer", error = ex.Message });
            }
        }
    }
} 