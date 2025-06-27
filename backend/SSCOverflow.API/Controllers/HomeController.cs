using Microsoft.AspNetCore.Mvc;

namespace SSCOverflow.API.Controllers
{
    [ApiController]
    [Route("/")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Content("Welcome to SSCOverflow API! The backend is running.", "text/plain");
        }
    }
} 