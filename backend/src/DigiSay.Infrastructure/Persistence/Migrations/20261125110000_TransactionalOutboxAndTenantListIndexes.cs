using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DigiSay.Infrastructure.Persistence.Migrations;

[DbContext(typeof(DigiSayDbContext))]
[Migration("20261125110000_TransactionalOutboxAndTenantListIndexes")]
public sealed class TransactionalOutboxAndTenantListIndexes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF SCHEMA_ID(N'integration') IS NULL EXEC(N'CREATE SCHEMA [integration]');

            IF OBJECT_ID(N'integration.OutboxMessages', N'U') IS NULL
            BEGIN
                CREATE TABLE [integration].[OutboxMessages]
                (
                    [Id] uniqueidentifier NOT NULL,
                    [EventType] nvarchar(160) NOT NULL,
                    [Payload] nvarchar(max) NOT NULL,
                    [OccurredAtUtc] datetimeoffset(3) NOT NULL,
                    [AttemptCount] int NOT NULL DEFAULT (0),
                    [NextAttemptAtUtc] datetimeoffset(3) NOT NULL,
                    [LeaseId] uniqueidentifier NULL,
                    [LeaseExpiresAtUtc] datetimeoffset(3) NULL,
                    [ProcessedAtUtc] datetimeoffset(3) NULL,
                    [DeadLetteredAtUtc] datetimeoffset(3) NULL,
                    [LastError] nvarchar(200) NULL,
                    CONSTRAINT [PK_OutboxMessages] PRIMARY KEY CLUSTERED ([Id]),
                    CONSTRAINT [CK_OutboxMessages_AttemptCount] CHECK ([AttemptCount] >= 0)
                );
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'integration.OutboxMessages') AND name = N'IX_OutboxMessages_Dispatch')
                CREATE INDEX [IX_OutboxMessages_Dispatch]
                    ON [integration].[OutboxMessages] ([NextAttemptAtUtc], [LeaseExpiresAtUtc], [OccurredAtUtc])
                    WHERE [ProcessedAtUtc] IS NULL AND [DeadLetteredAtUtc] IS NULL;

            IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.Leads') AND name = N'IX_Leads_OrganizationId_Status_CreatedAtUtc')
                DROP INDEX [IX_Leads_OrganizationId_Status_CreatedAtUtc] ON [crm].[Leads];
            IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.Leads') AND name = N'IX_Leads_OrganizationId_Email')
                DROP INDEX [IX_Leads_OrganizationId_Email] ON [crm].[Leads];
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.Leads') AND name = N'IX_Leads_OrganizationId_CreatedAtUtc_Id')
                CREATE INDEX [IX_Leads_OrganizationId_CreatedAtUtc_Id]
                    ON [crm].[Leads] ([OrganizationId], [CreatedAtUtc] DESC, [Id]);

            IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.ServiceRequests') AND name = N'IX_ServiceRequests_OrganizationId_Status_CreatedAtUtc')
                DROP INDEX [IX_ServiceRequests_OrganizationId_Status_CreatedAtUtc] ON [crm].[ServiceRequests];
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.ServiceRequests') AND name = N'IX_ServiceRequests_OrganizationId_CreatedAtUtc_Id')
                CREATE INDEX [IX_ServiceRequests_OrganizationId_CreatedAtUtc_Id]
                    ON [crm].[ServiceRequests] ([OrganizationId], [CreatedAtUtc] DESC, [Id]);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.Leads') AND name = N'IX_Leads_OrganizationId_CreatedAtUtc_Id')
                DROP INDEX [IX_Leads_OrganizationId_CreatedAtUtc_Id] ON [crm].[Leads];
            IF OBJECT_ID(N'crm.Leads', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.Leads') AND name = N'IX_Leads_OrganizationId_Status_CreatedAtUtc')
                CREATE INDEX [IX_Leads_OrganizationId_Status_CreatedAtUtc]
                    ON [crm].[Leads] ([OrganizationId], [Status], [CreatedAtUtc]);
            IF OBJECT_ID(N'crm.Leads', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.Leads') AND name = N'IX_Leads_OrganizationId_Email')
                CREATE INDEX [IX_Leads_OrganizationId_Email] ON [crm].[Leads] ([OrganizationId], [Email]);

            IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.ServiceRequests') AND name = N'IX_ServiceRequests_OrganizationId_CreatedAtUtc_Id')
                DROP INDEX [IX_ServiceRequests_OrganizationId_CreatedAtUtc_Id] ON [crm].[ServiceRequests];
            IF OBJECT_ID(N'crm.ServiceRequests', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'crm.ServiceRequests') AND name = N'IX_ServiceRequests_OrganizationId_Status_CreatedAtUtc')
                CREATE INDEX [IX_ServiceRequests_OrganizationId_Status_CreatedAtUtc]
                    ON [crm].[ServiceRequests] ([OrganizationId], [Status], [CreatedAtUtc]);

            IF OBJECT_ID(N'integration.OutboxMessages', N'U') IS NOT NULL
                DROP TABLE [integration].[OutboxMessages];
            """);
    }
}
