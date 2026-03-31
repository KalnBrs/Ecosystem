import 'dotenv/config'; 
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start Seeding....");
  // Seed data here
  const user = await prisma.user.create({ data: { name: 'Alice', email: 'alice@example.com', passwordHash: 'hahahahha' } });

  const task = await prisma.node.create(
    {
      data: { 
        userId: user.id, 
        type: 'task', 
        title: 'Test Task', 
        description: 'Mock Task', 
        tags: ["Test", "Hello"],
        status: "active",
        data: {
          dueDate: new Date(),
          priority: "medium",
          compleated: false,
        }
      }
    }
  );

  const event = await prisma.node.create(
    {
      data: { 
        userId: user.id, 
        type: 'event', 
        title: 'Test event', 
        description: 'Mock event', 
        tags: ["Test", "Hello"],
        status: "active",
        data: {
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
        }
      }
    }
  );

  const idea = await prisma.node.create(
    {
      data: { 
        userId: user.id, 
        type: 'idea', 
        title: 'Test idea', 
        description: 'Mock idea', 
        tags: ["Test", "Hello"],
        status: "active",
        data: {
          content: "Hello",
          pinned: false
        }
      }
    }
  );

  const project = await prisma.node.create(
    {
      data: { 
        userId: user.id, 
        type: 'project', 
        title: 'Test project', 
        description: 'Mock project', 
        tags: ["Test", "Hello"],
        status: "active",
        data: {
          startDate: new Date(),
          projectStatus: "active",
          progress: 78,
          childNodeIds: [idea.id, task.id, event.id]
        }
      }
    }
  );

  await prisma.node.create(
    {
      data: {
        userId: user.id, 
        type: 'area', 
        title: 'Test area', 
        description: 'Mock area', 
        tags: ["Test", "Hello"],
        status: "active",
        data: {
          childNodeIds: [project.id]
        }
      }
    }
  )
  console.log("Seeding Complete");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect() })