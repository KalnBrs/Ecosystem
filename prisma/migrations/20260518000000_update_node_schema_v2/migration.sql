-- Remove obsolete NodeType enum values: note, area, custom
-- Safe to apply after prisma migrate reset (no rows with these types exist)

ALTER TYPE "NodeType" RENAME TO "NodeType_old";

CREATE TYPE "NodeType" AS ENUM ('task', 'event', 'idea', 'project');

ALTER TABLE "nodes"
ALTER COLUMN "type" TYPE "NodeType" USING ("type"::text::"NodeType");

DROP TYPE "NodeType_old";