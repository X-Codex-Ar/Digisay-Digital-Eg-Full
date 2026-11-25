using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiSay.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AlignRuntimeModelSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OutboxMessages_Dispatch",
                schema: "integration",
                table: "OutboxMessages");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "ProcessedAtUtc",
                schema: "integration",
                table: "OutboxMessages",
                type: "datetimeoffset(3)",
                precision: 3,
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset(3)",
                oldPrecision: 3);

            migrationBuilder.AlterColumn<string>(
                name: "Payload",
                schema: "integration",
                table: "OutboxMessages",
                type: "nvarchar(max)",
                maxLength: 16000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(16000)",
                oldMaxLength: 16000);

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "DeadLetteredAtUtc",
                schema: "integration",
                table: "OutboxMessages",
                type: "datetimeoffset(3)",
                precision: 3,
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset(3)",
                oldPrecision: 3);

            migrationBuilder.CreateIndex(
                name: "IX_OutboxMessages_Dispatch",
                schema: "integration",
                table: "OutboxMessages",
                columns: new[] { "NextAttemptAtUtc", "LeaseExpiresAtUtc", "OccurredAtUtc" },
                filter: "[ProcessedAtUtc] IS NULL AND [DeadLetteredAtUtc] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OutboxMessages_Dispatch",
                schema: "integration",
                table: "OutboxMessages");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "ProcessedAtUtc",
                schema: "integration",
                table: "OutboxMessages",
                type: "datetimeoffset(3)",
                precision: 3,
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)),
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset(3)",
                oldPrecision: 3,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Payload",
                schema: "integration",
                table: "OutboxMessages",
                type: "nvarchar(16000)",
                maxLength: 16000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldMaxLength: 16000);

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "DeadLetteredAtUtc",
                schema: "integration",
                table: "OutboxMessages",
                type: "datetimeoffset(3)",
                precision: 3,
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)),
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset(3)",
                oldPrecision: 3,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OutboxMessages_Dispatch",
                schema: "integration",
                table: "OutboxMessages",
                columns: new[] { "NextAttemptAtUtc", "LeaseExpiresAtUtc", "OccurredAtUtc" },
                filter: "[ProcessedAtUtc] IS NULL AND [DeadLetteredAtUtc] IS NULL");
        }
    }
}
