using Microsoft.AspNetCore.Mvc;

namespace cruise3d.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestimonialsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll() => Ok(new object[0]);

        [HttpPost]
        public IActionResult Create([FromBody] object model) => Created("", model);

        [HttpPut("{id}/approve")]
        public IActionResult Approve(int id) => NoContent();
    }
}
