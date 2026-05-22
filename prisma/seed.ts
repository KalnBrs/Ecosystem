import 'dotenv/config'; 
import { PrismaClient } from "@/generated/prisma"
import { createPrismaClient } from '@/lib/prisma';

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma ?? createPrismaClient()

async function main() {
  console.log("Start Seeding....");

  const user = await prisma.user.create({
    data: { name: 'Alice', email: 'alice@example.com', passwordHash: 'hashed_password_placeholder' }
  });

  const task = await prisma.node.create({
    data: {
      userId: user.id,
      type: 'task',
      title: 'Write project proposal',
      description: 'Draft the Q3 proposal document',
      tags: ['work', 'writing'],
      status: 'active',
      data: {
        completed: false,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        energyLevel: 'deep',
        isMorningPick: false,
        estimatedDuration: 60,
        actualDuration: 0,
      }
    }
  });

  const task2 = await prisma.node.create({
    data: {
      userId: user.id,
      type: 'task',
      title: 'Reply to emails',
      description: 'Catch up on inbox',
      tags: ['admin'],
      status: 'active',
      data: {
        completed: false,
        energyLevel: 'light',
        isMorningPick: false,
        estimatedDuration: 15,
        actualDuration: 0,
      }
    }
  });

  const task3 = await prisma.node.create({
    data: {
      userId: user.id,
      type: 'task',
      title: 'Book dentist appointment',
      description: '',
      tags: ['personal'],
      status: 'active',
      data: {
        completed: false,
        energyLevel: 'quick',
        isMorningPick: false,
        estimatedDuration: 5,
        actualDuration: 0,
      }
    }
  });

  await prisma.node.create({
    data: {
      userId: user.id,
      type: 'event',
      title: 'Team standup',
      description: 'Daily sync',
      tags: ['work', 'meeting'],
      status: 'active',
      data: {
        startTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
        isAllDay: false,
        location: 'Zoom',
      }
    }
  });

  await prisma.node.create({
    data: {
      userId: user.id,
      type: 'idea',
      title: 'Dark mode for the app',
      description: '',
      tags: ['product'],
      status: 'active',
      data: {
        content: 'Users have been asking for a dark mode. Could be a quick win.',
        pinned: true,
      }
    }
  });

  await prisma.node.create({
    data: {
      userId: user.id,
      type: 'project',
      title: 'Website Redesign',
      description: 'Full redesign of the marketing site',
      tags: ['work'],
      status: 'active',
      data: {
        projectStatus: 'active',
        progress: 0,
        childNodeIds: [task.id, task2.id, task3.id],
      }
    }
  });

  console.log("Seeding Complete");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect() })