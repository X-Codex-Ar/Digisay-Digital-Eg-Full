using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiSay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CrmLeadAndServiceRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "crm");

            migrationBuilder.CreateTable(
                name: "Leads",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    Source = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leads", x => new { x.OrganizationId, x.Id });
                    table.ForeignKey(
                        name: "FK_Leads_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Leads_AspNetUsers_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Leads_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "organizations",
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceRequests",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Service = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRequests", x => new { x.OrganizationId, x.Id });
                    table.ForeignKey(
                        name: "FK_ServiceRequests_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceRequests_AspNetUsers_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceRequests_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "organizations",
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_CreatedByUserId",
                schema: "crm",
                table: "Leads",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_OrganizationId_Email",
                schema: "crm",
                table: "Leads",
                columns: new[] { "OrganizationId", "Email" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_OrganizationId_Status_CreatedAtUtc",
                schema: "crm",
                table: "Leads",
                columns: new[] { "OrganizationId", "Status", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_UpdatedByUserId",
                schema: "crm",
                table: "Leads",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_CreatedByUserId",
                schema: "crm",
                table: "ServiceRequests",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_OrganizationId_Status_CreatedAtUtc",
                schema: "crm",
                table: "ServiceRequests",
                columns: new[] { "OrganizationId", "Status", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_UpdatedByUserId",
                schema: "crm",
                table: "ServiceRequests",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Leads",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "ServiceRequests",
                schema: "crm");
        }
    }
}
