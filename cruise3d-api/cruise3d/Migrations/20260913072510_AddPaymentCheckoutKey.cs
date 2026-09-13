using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cruise3d.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentCheckoutKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "checkout_key",
                table: "payments",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "i_x_payments_user_id_checkout_key",
                table: "payments",
                columns: new[] { "user_id", "checkout_key" },
                unique: true,
                filter: "checkout_key IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "i_x_payments_user_id_checkout_key",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "checkout_key",
                table: "payments");
        }
    }
}
