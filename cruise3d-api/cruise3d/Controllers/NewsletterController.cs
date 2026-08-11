using Microsoft.AspNetCore.Mvc;

namespace cruise3d.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsletterController : ControllerBase
    {
        [HttpPost("subscribe")]
        public IActionResult Subscribe([FromBody] object model) => Ok(new { message = "Not implemented" });

        [HttpPost("confirm")]
        public IActionResult Confirm([FromBody] object model) => Ok(new { message = "Not implemented" });
    }
}
