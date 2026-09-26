-- Migration: 20260926080000_cms_media_architecture
-- Architecture foundation for Central Media Library, Landing Builder, Revisions, and Navigation

-- 1. Extend Media model
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "uploadedById" TEXT;

CREATE INDEX IF NOT EXISTS "Media_deletedAt_idx" ON "Media"("deletedAt");
CREATE INDEX IF NOT EXISTS "Media_uploadedById_idx" ON "Media"("uploadedById");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Media_uploadedById_fkey') THEN
    ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 2. Extend ProductImage model with media relation
ALTER TABLE "ProductImage" ADD COLUMN IF NOT EXISTS "mediaId" TEXT;

CREATE INDEX IF NOT EXISTS "ProductImage_mediaId_idx" ON "ProductImage"("mediaId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductImage_mediaId_fkey') THEN
    ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Extend Campaign model with media relation
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "mediaId" TEXT;

CREATE INDEX IF NOT EXISTS "Campaign_mediaId_idx" ON "Campaign"("mediaId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Campaign_mediaId_fkey') THEN
    ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Extend BlogPost model with featuredMedia and ogMedia relations
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "featuredMediaId" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "ogMediaId" TEXT;

CREATE INDEX IF NOT EXISTS "BlogPost_featuredMediaId_idx" ON "BlogPost"("featuredMediaId");
CREATE INDEX IF NOT EXISTS "BlogPost_ogMediaId_idx" ON "BlogPost"("ogMediaId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BlogPost_featuredMediaId_fkey') THEN
    ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_featuredMediaId_fkey" FOREIGN KEY ("featuredMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BlogPost_ogMediaId_fkey') THEN
    ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_ogMediaId_fkey" FOREIGN KEY ("ogMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 5. Extend LandingSection model
ALTER TABLE "LandingSection" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'CUSTOM';
ALTER TABLE "LandingSection" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "LandingSection" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "LandingSection" ADD COLUMN IF NOT EXISTS "settingsJson" JSONB;
ALTER TABLE "LandingSection" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "LandingSection_type_idx" ON "LandingSection"("type");
CREATE INDEX IF NOT EXISTS "LandingSection_status_idx" ON "LandingSection"("status");
CREATE INDEX IF NOT EXISTS "LandingSection_sortOrder_idx" ON "LandingSection"("sortOrder");
CREATE INDEX IF NOT EXISTS "LandingSection_deletedAt_idx" ON "LandingSection"("deletedAt");

-- 6. Create LandingSectionRevision model
CREATE TABLE IF NOT EXISTS "LandingSectionRevision" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "badge" TEXT,
    "contentJson" JSONB,
    "settingsJson" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandingSectionRevision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LandingSectionRevision_sectionId_version_key" ON "LandingSectionRevision"("sectionId", "version");
CREATE INDEX IF NOT EXISTS "LandingSectionRevision_sectionId_idx" ON "LandingSectionRevision"("sectionId");
CREATE INDEX IF NOT EXISTS "LandingSectionRevision_status_idx" ON "LandingSectionRevision"("status");
CREATE INDEX IF NOT EXISTS "LandingSectionRevision_createdAt_idx" ON "LandingSectionRevision"("createdAt");
CREATE INDEX IF NOT EXISTS "LandingSectionRevision_createdById_idx" ON "LandingSectionRevision"("createdById");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LandingSectionRevision_sectionId_fkey') THEN
    ALTER TABLE "LandingSectionRevision" ADD CONSTRAINT "LandingSectionRevision_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LandingSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LandingSectionRevision_createdById_fkey') THEN
    ALTER TABLE "LandingSectionRevision" ADD CONSTRAINT "LandingSectionRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 7. Extend NavigationItem model
ALTER TABLE "NavigationItem" ADD COLUMN IF NOT EXISTS "destinationType" TEXT NOT NULL DEFAULT 'INTERNAL_PAGE';
ALTER TABLE "NavigationItem" ADD COLUMN IF NOT EXISTS "referenceId" TEXT;
ALTER TABLE "NavigationItem" ADD COLUMN IF NOT EXISTS "externalUrl" TEXT;

CREATE INDEX IF NOT EXISTS "NavigationItem_destinationType_idx" ON "NavigationItem"("destinationType");
