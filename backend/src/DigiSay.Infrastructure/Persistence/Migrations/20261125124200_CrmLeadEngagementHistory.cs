using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiSay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CrmLeadEngagementHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LeadFollowUps",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Details = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DueAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    CompletedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    CompletedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadFollowUps", x => new { x.OrganizationId, x.Id });
                    table.ForeignKey(
                        name: "FK_LeadFollowUps_AspNetUsers_CompletedByUserId",
                        column: x => x.CompletedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeadFollowUps_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeadFollowUps_Leads_OrganizationId_LeadId",
                        columns: x => new { x.OrganizationId, x.LeadId },
                        principalSchema: "crm",
                        principalTable: "Leads",
                        principalColumns: new[] { "OrganizationId", "Id" },
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeadFollowUps_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "organizations",
                        principalTable: "Organizations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadNotes",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadNotes", x => new { x.OrganizationId, x.Id });
                    table.ForeignKey(
                        name: "FK_LeadNotes_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeadNotes_Leads_OrganizationId_LeadId",
                        columns: x => new { x.OrganizationId, x.LeadId },
                        principalSchema: "crm",
                        principalTable: "Leads",
                        principalColumns: new[] { "OrganizationId", "Id" },
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeadNotes_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "organizations",
                        principalTable: "Organizations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadStatusHistory",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ToStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ChangedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChangedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadStatusHistory", x => new { x.OrganizationId, x.Id });
                    table.ForeignKey(
                        name: "FK_LeadStatusHistory_AspNetUsers_ChangedByUserId",
                        column: x => x.ChangedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeadStatusHistory_Leads_OrganizationId_LeadId",
                        columns: x => new { x.OrganizationId, x.LeadId },
                        principalSchema: "crm",
                        principalTable: "Leads",
                        principalColumns: new[] { "OrganizationId", "Id" },
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeadStatusHistory_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "organizations",
                        principalTable: "Organizations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_LeadFollowUps_CompletedByUserId",
                schema: "crm",
                table: "LeadFollowUps",
                column: "CompletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadFollowUps_CreatedByUserId",
                schema: "crm",
                table: "LeadFollowUps",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadFollowUps_OrganizationId_LeadId_CompletedAtUtc_DueAtUtc",
                schema: "crm",
                table: "LeadFollowUps",
                columns: new[] { "OrganizationId", "LeadId", "CompletedAtUtc", "DueAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_LeadNotes_CreatedByUserId",
                schema: "crm",
                table: "LeadNotes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadNotes_OrganizationId_LeadId_CreatedAtUtc",
                schema: "crm",
                table: "LeadNotes",
                columns: new[] { "OrganizationId", "LeadId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_LeadStatusHistory_ChangedByUserId",
                schema: "crm",
                table: "LeadStatusHistory",
                column: "ChangedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadStatusHistory_OrganizationId_LeadId_ChangedAtUtc",
                schema: "crm",
                table: "LeadStatusHistory",
                columns: new[] { "OrganizationId", "LeadId", "ChangedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeadFollowUps",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "LeadNotes",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "LeadStatusHistory",
                schema: "crm");
        }
    }
}
