import TaskElement, { TaskData } from "./_components/TaskElement";

const mockTask: TaskData = {
  id: "1",
  title: "Build the task UI",
  description: "Design and implement the task list component",
  userId: "user-1",
  tags: ["ui", "frontend"],
  status: "active",
  completed: false,
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
  energyLevel: "deep",
  estimatedDuration: 60,
  actualDuration: 0,
}

export default function Home() {
  return (
    <div className="flex flex-col mx-24 my-1">
      <div className="flex flex-row justify-between w-full">
        <p className="text-2xl font-bold">Tasks</p>
        <div className="flex flex-row gap-6">
          <button>all</button>
          <button>deep</button>
          <button>light</button>
          <button>quick</button>
        </div>
      </div>

      <div>
        <TaskElement task={mockTask} />
      </div>
    </div>
  );
}