IF OBJECT_ID(N'dbo.ContactInquiries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContactInquiries
    (
        Id uniqueidentifier NOT NULL,
        FirstName nvarchar(50) NOT NULL,
        LastName nvarchar(50) NOT NULL,
        Email nvarchar(254) NOT NULL,
        Phone nvarchar(25) NULL,
        Service nvarchar(80) NOT NULL,
        Message nvarchar(2000) NULL,
        CreatedAtUtc datetimeoffset(3) NOT NULL,
        SourceIp nvarchar(45) NULL,
        CONSTRAINT PK_ContactInquiries PRIMARY KEY (Id)
    );

END;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ContactInquiries')
      AND name = N'IX_ContactInquiries_CreatedAtUtc'
)
    CREATE INDEX IX_ContactInquiries_CreatedAtUtc
        ON dbo.ContactInquiries (CreatedAtUtc);

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ContactInquiries')
      AND name = N'IX_ContactInquiries_Email'
)
    CREATE INDEX IX_ContactInquiries_Email
        ON dbo.ContactInquiries (Email);
