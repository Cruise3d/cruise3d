using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using cruise3d.API.Data;

#nullable disable

namespace cruise3d.API.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260907120000_AddShippingPhones")]
public partial class AddShippingPhones : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Keep both columns nullable so legacy rows remain valid. New API DTOs
        // and order creation paths enforce a real address phone going forward.
        migrationBuilder.AddColumn<string>(
            name: "phone",
            table: "addresses",
            type: "character varying(20)",
            maxLength: 20,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "shipping_phone",
            table: "orders",
            type: "character varying(20)",
            maxLength: 20,
            nullable: true);

        // Backfill only from an actual account phone. Never invent a value.
        migrationBuilder.Sql(@"
            UPDATE addresses AS address
            SET phone = NULLIF(BTRIM(customer.phone), '')
            FROM users AS customer
            WHERE customer.id = address.user_id
              AND NULLIF(BTRIM(customer.phone), '') IS NOT NULL;
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "shipping_phone",
            table: "orders");

        migrationBuilder.DropColumn(
            name: "phone",
            table: "addresses");
    }
}