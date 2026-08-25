using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cruise3d.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDtdcTrackingIdToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "dtdc_tracking_id",
                table: "orders",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "i_x_orders_dtdc_tracking_id",
                table: "orders",
                column: "dtdc_tracking_id",
                unique: true,
                filter: "dtdc_tracking_id IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "i_x_orders_dtdc_tracking_id",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "dtdc_tracking_id",
                table: "orders");
        }
    }
}
