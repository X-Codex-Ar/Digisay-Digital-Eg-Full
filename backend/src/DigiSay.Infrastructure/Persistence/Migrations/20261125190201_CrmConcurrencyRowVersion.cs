using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiSay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CrmConcurrencyRowVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                schema: "crm",
                table: "Leads",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                schema: "crm",
                table: "LeadFollowUps",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "crm",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "crm",
                table: "LeadFollowUps");
        }
    }
}
