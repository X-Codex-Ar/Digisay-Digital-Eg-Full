-- ==============================================================================
-- DigiSay Platform — Supabase Storage Buckets & Row Level Security Policies
-- Version: 001_storage_buckets.sql
-- ==============================================================================

-- 1. Create Storage Buckets
-- ------------------------------------------------------------------------------

-- Bucket: public-media
-- Used for public site imagery, showreel videos, brand marks, and blog media.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'public-media',
    'public-media',
    true,
    104857600, -- 100 MB max file size
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'application/pdf'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: digisay-private
-- Private backend-owned files. The API derives paths as
-- organizations/{organization-guid-N}/{object-guid-N} and enforces membership.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'digisay-private',
    'digisay-private',
    false,
    10485760, -- 10 MiB max; the API also validates the actual stream size
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: client-assets
-- Private bucket for authenticated clients: contracts, reports, brand decks.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'client-assets',
    'client-assets',
    false,
    524288000, -- 500 MB max file size
    NULL -- All MIME types permitted for authorized client documents
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: creator-submissions
-- Private bucket for influencer and creator network video submissions.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'creator-submissions',
    'creator-submissions',
    false,
    1073741824, -- 1 GB max file size for raw video files
    ARRAY[
        'video/mp4',
        'video/quicktime',
        'video/x-matroska',
        'image/jpeg',
        'image/png'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;


-- 2. Row Level Security (RLS) Policies on storage.objects
-- ------------------------------------------------------------------------------

-- Ensure RLS is active on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2.1 Public Media Policies
-- Anyone can view public media objects
DROP POLICY IF EXISTS "Public media is accessible to all" ON storage.objects;
CREATE POLICY "Public media is accessible to all"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-media');

-- Only authenticated staff/service-role can upload or modify public media
DROP POLICY IF EXISTS "Only staff can manage public media" ON storage.objects;
CREATE POLICY "Only staff can manage public media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'public-media'
    AND (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true')
);

-- 2.2 Client Assets Policies (Private)
-- Authenticated clients can only access assets within their organization folder
DROP POLICY IF EXISTS "Clients can access their own organization assets" ON storage.objects;
CREATE POLICY "Clients can access their own organization assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'client-assets'
    AND (
        auth.jwt() ->> 'role' = 'service_role'
        OR (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'org_id')
    )
);

-- Clients can upload into their organization folder
DROP POLICY IF EXISTS "Clients can upload into their organization folder" ON storage.objects;
CREATE POLICY "Clients can upload into their organization folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'client-assets'
    AND (
        auth.jwt() ->> 'role' = 'service_role'
        OR (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'org_id')
    )
);

-- 2.3 Creator Submissions Policies (Private)
-- Authenticated creators or admins can upload video submissions
DROP POLICY IF EXISTS "Creators can upload video submissions" ON storage.objects;
CREATE POLICY "Creators can upload video submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'creator-submissions'
    AND (
        auth.jwt() ->> 'role' = 'service_role'
        OR (storage.foldername(name))[1] = auth.uid()::text
    )
);

-- Creators can view their own video submissions
DROP POLICY IF EXISTS "Creators can view their own video submissions" ON storage.objects;
CREATE POLICY "Creators can view their own video submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'creator-submissions'
    AND (
        auth.jwt() ->> 'role' = 'service_role'
        OR (storage.foldername(name))[1] = auth.uid()::text
        OR auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true'
    )
);

-- 2.4 DigiSay private API bucket
-- The API uses a server-only Supabase secret key, whose service_role bypasses
-- RLS. This policy records the expected bucket/path shape but does not enforce
-- the current API requests; membership authorization remains in the backend.
-- Browser roles receive no access to this bucket.
DROP POLICY IF EXISTS "DigiSay API manages tenant private objects" ON storage.objects;
CREATE POLICY "DigiSay API manages tenant private objects"
ON storage.objects FOR ALL
TO service_role
USING (
    bucket_id = 'digisay-private'
    AND name ~ '^organizations/[0-9a-f]{32}/[0-9a-f]{32}$'
)
WITH CHECK (
    bucket_id = 'digisay-private'
    AND name ~ '^organizations/[0-9a-f]{32}/[0-9a-f]{32}$'
);
