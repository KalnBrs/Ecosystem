/**
 * Task List page UI tests: loading, error, empty, and energy-filtered rendering.
 * Data hooks and child components are mocked; only the page's own behavior is verified.
 *
 * @jest-environment jsdom
 */

import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Home from "@/app/tasks/page";
import { useNodes, useCreateNode } from "@/queries/nodeQueries";
import { Task, Project } from "@/lib/models";

jest.mock("@/queries/nodeQueries");
jest.mock("@/app/tasks/tasks.module.css", () => ({}));
jest.mock("next/image", () => ({ __esModule: true, default: () => null }));
jest.mock("@/app/tasks/_components/TaskElement", () => ({
  __esModule: true,
  default: ({ task }: { task: { id: string; title: string } }) =>
    React.createElement("div", { "data-testid": "task" }, task.title),
}));
jest.mock("@/app/tasks/_components/CreateTaskInline", () => ({
  __esModule: true,
  default: () => React.createElement("div", { "data-testid": "create-inline" }),
}));

const mockUseNodes = useNodes as jest.MockedFunction<typeof useNodes>;
const mockUseCreateNode = useCreateNode as jest.MockedFunction<typeof useCreateNode>;

const now = new Date("2026-01-01T00:00:00.000Z");

function makeTask(id: string, title: string, energyLevel: "deep" | "light" | "quick", projectId?: string) {
  return new Task(
    id, title, "", now, now, "user-1", [], [], [], "active",
    false, undefined, energyLevel, false, undefined, undefined, undefined, projectId
  );
}

function mockNodes(state: { data?: unknown[]; isLoading?: boolean; isError?: boolean; error?: Error | null }) {
  mockUseNodes.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
    error: state.error ?? null,
  } as unknown as ReturnType<typeof useNodes>);
}

const taskTitles = () => screen.queryAllByTestId("task").map(el => el.textContent);

beforeEach(() => {
  mockUseCreateNode.mockReturnValue({ mutate: jest.fn() } as unknown as ReturnType<typeof useCreateNode>);
});

afterEach(cleanup);

describe("Task List page", () => {
  it("renders skeleton rows and no tasks while loading", () => {
    mockNodes({ isLoading: true });
    render(React.createElement(Home));

    expect(taskTitles()).toEqual([]);
    expect(screen.queryByText("No tasks")).toBeNull();
  });

  it("renders the error message when the query fails", () => {
    mockNodes({ isError: true, error: new Error("Boom") });
    render(React.createElement(Home));

    expect(screen.getByText("Boom")).toBeTruthy();
  });

  it("renders the empty state when there are no tasks", () => {
    mockNodes({ data: [] });
    render(React.createElement(Home));

    expect(screen.getByText("No tasks")).toBeTruthy();
  });

  it("renders all active tasks by default", () => {
    mockNodes({
      data: [makeTask("1", "Deep work", "deep"), makeTask("2", "Email", "quick")],
    });
    render(React.createElement(Home));

    expect(taskTitles()).toEqual(["Deep work", "Email"]);
  });

  it("filters tasks by energy level and restores them with 'all'", () => {
    mockNodes({
      data: [
        makeTask("1", "Deep work", "deep"),
        makeTask("2", "Laundry", "light"),
        makeTask("3", "Email", "quick"),
      ],
    });
    render(React.createElement(Home));

    fireEvent.click(screen.getByRole("button", { name: "light" }));
    expect(taskTitles()).toEqual(["Laundry"]);

    fireEvent.click(screen.getByRole("button", { name: "quick" }));
    expect(taskTitles()).toEqual(["Email"]);

    fireEvent.click(screen.getByRole("button", { name: "all" }));
    expect(taskTitles()).toEqual(["Deep work", "Laundry", "Email"]);
  });

  it("shows the empty state when the energy filter matches nothing", () => {
    mockNodes({ data: [makeTask("1", "Deep work", "deep")] });
    render(React.createElement(Home));

    fireEvent.click(screen.getByRole("button", { name: "quick" }));

    expect(taskTitles()).toEqual([]);
    expect(screen.getByText("No tasks")).toBeTruthy();
  });

  it("filters by project tab", () => {
    mockNodes({
      data: [
        new Project("p1", "Alpha", "", now, now, "user-1", [], [], [], "active"),
        makeTask("1", "In project", "deep", "p1"),
        makeTask("2", "Loose", "deep"),
      ],
    });
    render(React.createElement(Home));

    fireEvent.click(screen.getByRole("button", { name: /Alpha/ }));
    expect(taskTitles()).toEqual(["In project"]);

    fireEvent.click(screen.getByRole("button", { name: "All projects" }));
    expect(taskTitles()).toEqual(["In project", "Loose"]);
  });

  it("opens the inline create form when 'Add task' is clicked", () => {
    mockNodes({ data: [] });
    render(React.createElement(Home));

    fireEvent.click(screen.getByRole("button", { name: /Add task/ }));

    expect(screen.getByTestId("create-inline")).toBeTruthy();
  });
});
