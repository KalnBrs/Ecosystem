-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('task', 'event', 'idea', 'note', 'project', 'area', 'custom');

-- CreateEnum
CREATE TYPE "NodeStatus" AS ENUM ('active', 'archived', 'deleted');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NodeType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "NodeStatus" NOT NULL DEFAULT 'active',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_links" (
    "id" UUID NOT NULL,
    "source_node_id" UUID NOT NULL,
    "target_node_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "node_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_nodes_user_id" ON "nodes"("user_id");

-- CreateIndex
CREATE INDEX "idx_nodes_type" ON "nodes"("type");

-- CreateIndex
CREATE INDEX "idx_nodes_status" ON "nodes"("status");

-- CreateIndex
CREATE INDEX "idx_nodes_created" ON "nodes"("created_at");

-- CreateIndex
CREATE INDEX "idx_node_links_source" ON "node_links"("source_node_id");

-- CreateIndex
CREATE INDEX "idx_node_links_target" ON "node_links"("target_node_id");

-- CreateIndex
CREATE UNIQUE INDEX "node_links_source_node_id_target_node_id_key" ON "node_links"("source_node_id", "target_node_id");

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_links" ADD CONSTRAINT "node_links_source_node_id_fkey" FOREIGN KEY ("source_node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_links" ADD CONSTRAINT "node_links_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
