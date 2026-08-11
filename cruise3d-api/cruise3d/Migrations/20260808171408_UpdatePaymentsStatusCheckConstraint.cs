using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cruise3d.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePaymentsStatusCheckConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_payments_status",
                table: "payments");

            migrationBuilder.AddCheckConstraint(
                name: "chk_payments_status",
                table: "payments",
                sql: "status IN ('pending','created','authorized','captured','paid','completed','failed','refunded')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_payments_status",
                table: "payments");

            migrationBuilder.AddCheckConstraint(
                name: "chk_payments_status",
                table: "payments",
                sql: "status IN ('pending','created','authorized','captured','paid','failed','refunded')");
        }
    }
}
