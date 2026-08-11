using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using cruise3d.API.Data;

#nullable disable

namespace cruise3d.API.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260808120000_MakeRazorpayPaymentIdNullable")]
    public partial class MakeRazorpayPaymentIdNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "razorpay_payment_id",
                table: "payments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "razorpay_payment_id",
                table: "payments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: string.Empty,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);
        }
    }
}
