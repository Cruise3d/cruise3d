using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace cruise3d.API.Migrations;

public partial class EnforceOneDefaultAddress : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Address has no created_at column, so the oldest row cannot be identified
        // reliably. Keep an existing default when present; otherwise use the
        // lowest UUID as a deterministic fallback without deleting any rows.
        migrationBuilder.Sql(@"
            WITH ranked_defaults AS (
                SELECT id,
                       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id) AS row_number
                FROM addresses
                WHERE is_default = TRUE
            )
            UPDATE addresses
            SET is_default = FALSE
            WHERE id IN (SELECT id FROM ranked_defaults WHERE row_number > 1);

            UPDATE addresses AS address
            SET is_default = TRUE
            WHERE address.id = (
                SELECT candidate.id
                FROM addresses AS candidate
                WHERE candidate.user_id = address.user_id
                ORDER BY candidate.id
                LIMIT 1
            )
            AND NOT EXISTS (
                SELECT 1
                FROM addresses AS existing_default
                WHERE existing_default.user_id = address.user_id
                  AND existing_default.is_default = TRUE
            );
        ");

        migrationBuilder.CreateIndex(
            name: "ix_addresses_one_default_per_user",
            table: "addresses",
            column: "user_id",
            unique: true,
            filter: "is_default = TRUE");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_addresses_one_default_per_user",
            table: "addresses");
    }
}