/**
 * Task filtering tests (energy level, project, active-only selection).
 */

import { Task, Project, Node } from "@/lib/models";
import { selectActiveTasks, filterTasks } from "@/app/tasks/tasks.util";

const now = new Date("2026-01-01T00:00:00.000Z");

function makeTask(
  id: string,
  energyLevel?: "deep" | "light" | "quick",
  overrides: { completed?: boolean; status?: "active" | "archived" | "deleted"; projectId?: string } = {}
) {
  return new Task(
    id, `Task ${id}`, "", now, now, "user-1", [], [], [],
    overrides.status ?? "active",
    overrides.completed ?? false,
    undefined,
    energyLevel,
    false,
    undefined,
    undefined,
    undefined,
    overrides.projectId
  );
}

describe("selectActiveTasks", () => {
  it("returns an empty array for no nodes", () => {
    expect(selectActiveTasks([])).toEqual([]);
  });

  it("keeps only active, incomplete tasks", () => {
    const active = makeTask("1", "deep");
    const completed = makeTask("2", "deep", { completed: true });
    const archived = makeTask("3", "deep", { status: "archived" });
    const project = new Project("p1", "Proj", "", now, now, "user-1", [], [], [], "active");
    const bare = new Node("n1", "Node", "", "idea", now, now, "user-1", [], [], [], "active");

    expect(selectActiveTasks([active, completed, archived, project, bare])).toEqual([active]);
  });
});

describe("filterTasks", () => {
  const deep = makeTask("1", "deep", { projectId: "p1" });
  const light = makeTask("2", "light", { projectId: "p2" });
  const quick = makeTask("3", "quick");
  const none = makeTask("4");
  const tasks = [deep, light, quick, none];

  it("returns all tasks for the 'all' filter", () => {
    expect(filterTasks(tasks, "all")).toEqual(tasks);
  });

  it.each([
    ["deep", [deep]],
    ["light", [light]],
    ["quick", [quick]],
  ] as const)("filters by %s energy level", (level, expected) => {
    expect(filterTasks(tasks, level)).toEqual(expected);
  });

  it("returns an empty array when no task matches the energy level", () => {
    expect(filterTasks([deep, light], "quick")).toEqual([]);
  });

  it("returns an empty array for an empty input", () => {
    expect(filterTasks([], "deep")).toEqual([]);
  });

  it("filters by project id", () => {
    expect(filterTasks(tasks, "all", "p2")).toEqual([light]);
  });

  it("combines energy and project filters", () => {
    expect(filterTasks(tasks, "deep", "p1")).toEqual([deep]);
    expect(filterTasks(tasks, "deep", "p2")).toEqual([]);
  });

  it("treats a null project filter as no project filter", () => {
    expect(filterTasks(tasks, "all", null)).toEqual(tasks);
  });
});
