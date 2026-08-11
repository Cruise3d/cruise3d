using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cruise3d.API.Migrations
{
    /// <inheritdoc />
    public partial class CreatePaymentsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "payments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    order_id = table.Column<Guid>(type: "uuid", nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    razorpay_order_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    razorpay_payment_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    cart_snapshot = table.Column<string>(type: "text", nullable: true),
                    amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "INR"),
                    provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "razorpay"),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "pending"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payments", x => x.id);
                    table.CheckConstraint("chk_payments_status", "status IN ('pending', 'completed', 'failed', 'refunded')");
                    table.ForeignKey(
                        name: "FK_payments_orders_OrderId",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_payments_users_UserId",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_payments_razorpay_order_id",
                table: "payments",
                column: "razorpay_order_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_payments_razorpay_payment_id",
                table: "payments",
                column: "razorpay_payment_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Use DROP TABLE IF EXISTS to avoid errors if table doesn't exist
            migrationBuilder.Sql("DROP TABLE IF EXISTS \"payments\"");
        }
    }
}
