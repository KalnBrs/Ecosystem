/**
 * useTaskEditor tests
 *
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useTaskEditor } from "@/_hooks/useTaskEditor";
import { useUpdateNode } from "@/queries/nodeQueries";
import type { TaskData } from "@/@types";

jest.mock("@/queries/nodeQueries", () => ({
  useUpdateNode: jest.fn(),
}));

const mutate = jest.fn();
const onClose = jest.fn();
const onDelete = jest.fn();

const task: TaskData = {
  id: "task-1",
  title: "Write tests",
  description: "Cover the hooks",
  userId: "user-1",
  tags: [],
  status: "todo",
  completed: false,
  createdAt: "2026-03-05T12:00:00.000Z",
  updatedAt: "2026-03-05T12:00:00.000Z",
  isMorningPick: false,
  estimatedDuration: 30,
};

function setup(overrides: Partial<TaskData> = {}) {
  return renderHook(() => useTaskEditor({ task: { ...task, ...overrides }, onClose, onDelete }));
}

beforeEach(() => {
  (useUpdateNode as jest.Mock).mockReturnValue({ mutate });
});

describe("useTaskEditor", () => {
  it("initializes fields from the task", () => {
    const { result } = setup();
    const fields = result.current[3];

    expect(fields.title).toBe("Write tests");
    expect(fields.description).toBe("Cover the hooks");
    expect(fields.estimate).toBe("30");
  });

  it("uses an empty estimate when the task has none", () => {
    const { result } = setup({ estimatedDuration: undefined });

    expect(result.current[3].estimate).toBe("");
  });

  it("formats the created label", () => {
    const { result } = setup();

    expect(result.current[0]).toBe("Mar 5");
  });

  describe("save", () => {
    it("sends a task update for the node", () => {
      const { result } = setup();

      act(() => result.current[1]({ title: "New" }));

      expect(mutate).toHaveBeenCalledWith({
        nodeId: "task-1",
        data: { type: "task", title: "New" },
      });
    });
  });

  describe("handleDelete", () => {
    it("calls onDelete then onClose", () => {
      const order: string[] = [];
      onDelete.mockImplementation(() => order.push("delete"));
      onClose.mockImplementation(() => order.push("close"));
      const { result } = setup();

      act(() => result.current[2]());

      expect(order).toEqual(["delete", "close"]);
    });
  });

  describe("commitTitle", () => {
    it("saves a trimmed, changed title", () => {
      const { result } = setup();

      act(() => result.current[3].setTitle("  Renamed  "));
      act(() => result.current[4].commitTitle());

      expect(mutate).toHaveBeenCalledWith({
        nodeId: "task-1",
        data: { type: "task", title: "Renamed" },
      });
    });

    it("does not save an unchanged title", () => {
      const { result } = setup();

      act(() => result.current[3].setTitle("  Write tests "));
      act(() => result.current[4].commitTitle());

      expect(mutate).not.toHaveBeenCalled();
    });

    it("reverts a blank title without saving", () => {
      const { result } = setup();

      act(() => result.current[3].setTitle("   "));
      act(() => result.current[4].commitTitle());

      expect(result.current[3].title).toBe("Write tests");
      expect(mutate).not.toHaveBeenCalled();
    });
  });

  describe("commitDescription", () => {
    it("saves a changed description", () => {
      const { result } = setup();

      act(() => result.current[3].setDescription("Updated"));
      act(() => result.current[4].commitDescription());

      expect(mutate).toHaveBeenCalledWith({
        nodeId: "task-1",
        data: { type: "task", description: "Updated" },
      });
    });

    it("does not save an unchanged description", () => {
      const { result } = setup();

      act(() => result.current[4].commitDescription());

      expect(mutate).not.toHaveBeenCalled();
    });
  });

  describe("commitEstimate", () => {
    it("saves a changed positive integer", () => {
      const { result } = setup();

      act(() => result.current[3].setEstimate("45"));
      act(() => result.current[4].commitEstimate());

      expect(mutate).toHaveBeenCalledWith({
        nodeId: "task-1",
        data: { type: "task", data: { estimatedDuration: 45 } },
      });
    });

    it("saves null when the estimate is cleared", () => {
      const { result } = setup();

      act(() => result.current[3].setEstimate("  "));
      act(() => result.current[4].commitEstimate());

      expect(mutate).toHaveBeenCalledWith({
        nodeId: "task-1",
        data: { type: "task", data: { estimatedDuration: null } },
      });
    });

    it("does not save an unchanged estimate", () => {
      const { result } = setup();

      act(() => result.current[4].commitEstimate());

      expect(mutate).not.toHaveBeenCalled();
    });

    it("does not save when clearing an already empty estimate", () => {
      const { result } = setup({ estimatedDuration: undefined });

      act(() => result.current[4].commitEstimate());

      expect(mutate).not.toHaveBeenCalled();
    });

    it.each(["abc", "0", "-5", "1.5"])("reverts invalid estimate %s without saving", (value) => {
      const { result } = setup();

      act(() => result.current[3].setEstimate(value));
      act(() => result.current[4].commitEstimate());

      expect(result.current[3].estimate).toBe("30");
      expect(mutate).not.toHaveBeenCalled();
    });
  });
});
