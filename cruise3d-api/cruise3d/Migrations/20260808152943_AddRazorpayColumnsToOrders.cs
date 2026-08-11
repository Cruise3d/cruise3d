using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cruise3d.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRazorpayColumnsToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "razorpay_order_id",
                table: "orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "razorpay_payment_id",
                table: "orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_orders_RazorpayOrderId",
                table: "orders",
                column: "razorpay_order_id",
                unique: true,
                filter: "razorpay_order_id IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_orders_RazorpayOrderId",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "razorpay_order_id",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "razorpay_payment_id",
                table: "orders");
        }
    }
}
