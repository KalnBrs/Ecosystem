/**
 * nodesApi tests
 *
 * Tests the behavior of each exported helper in src/store/api/nodesApi.ts.
 * global.fetch is mocked — only HTTP method, URL, headers, body, and
 * error-propagation contracts are verified.
 *
 * Covered functions:
 *   listNodes, getNodeById, createNode, updateNodeById,
 *   deleteNodeById, createLink, deleteLink
 */

import {
  listNodes,
  getNodeById,
  createNode,
  updateNodeById,
  deleteNodeById,
  createLink,
  deleteLink,
} from "@/store/api/nodesApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NODE_ID = "550e8400-e29b-41d4-a716-446655440001";
const TARGET_ID = "550e8400-e29b-41d4-a716-446655440002";

function makeFetchMock(ok: boolean, body: unknown) {
  return jest.fn().mockResolvedValue({
    ok,
    json: jest.fn().mockResolvedValue(body),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("listNodes", () => {
  it("calls GET /api/nodes with no query string when type is omitted", async () => {
    const data = [{ id: NODE_ID, title: "My Task" }];
    global.fetch = makeFetchMock(true, { data });

    const result = await listNodes();

    expect(global.fetch).toHaveBeenCalledWith("/api/nodes");
    expect(result).toEqual(data);
  });

  it("appends ?type= when a type is provided", async () => {
    const data = [{ id: NODE_ID, title: "My Task", type: "task" }];
    global.fetch = makeFetchMock(true, { data });

    const result = await listNodes("task");

    expect(global.fetch).toHaveBeenCalledWith("/api/nodes?type=task");
    expect(result).toEqual(data);
  });

  it("throws the server error message when the response is not ok (error key)", async () => {
    global.fetch = makeFetchMock(false, { error: "Unauthorized" });

    await expect(listNodes()).rejects.toThrow("Unauthorized");
  });

  it("throws the server error message when the response is not ok (message key)", async () => {
    global.fetch = makeFetchMock(false, { message: "Unauthorized" });

    await expect(listNodes()).rejects.toThrow("Unauthorized");
  });

  it("falls back to 'Something went wrong' when the error body has no message", async () => {
    global.fetch = makeFetchMock(false, {});

    await expect(listNodes()).rejects.toThrow("Something went wrong");
  });
});

describe("getNodeById", () => {
  it("calls GET /api/nodes/:id and returns parsed JSON on success", async () => {
    const data = { id: NODE_ID, title: "My Task" };
    global.fetch = makeFetchMock(true, { data });

    const result = await getNodeById(NODE_ID);

    expect(global.fetch).toHaveBeenCalledWith(`/api/nodes/${NODE_ID}`);
    expect(result).toEqual(data);
  });

  it("throws the server error message when the response is not ok", async () => {
    global.fetch = makeFetchMock(false, { error: "Not found" });

    await expect(getNodeById(NODE_ID)).rejects.toThrow("Not found");
  });

  it("falls back to 'Something went wrong' when the error body has no message", async () => {
    global.fetch = makeFetchMock(false, {});

    await expect(getNodeById(NODE_ID)).rejects.toThrow("Something went wrong");
  });
});

describe("createNode", () => {
  const payload = { title: "New Task", type: "task" };

  it("calls POST /api/nodes with JSON body and returns parsed JSON on success", async () => {
    const data = { id: NODE_ID, ...payload };
    global.fetch = makeFetchMock(true, { data });

    const result = await createNode(payload);

    expect(global.fetch).toHaveBeenCalledWith("/api/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(data);
  });

  it("throws the server error message when the response is not ok", async () => {
    global.fetch = makeFetchMock(false, { error: "Validation failed" });

    await expect(createNode(payload)).rejects.toThrow("Validation failed");
  });

  it("falls back to 'Something went wrong' when the error body has no message", async () => {
    global.fetch = makeFetchMock(false, {});

    await expect(createNode(payload)).rejects.toThrow("Something went wrong");
  });
});

describe("updateNodeById", () => {
  const patch = { title: "Updated title" };

  it("calls PATCH /api/nodes/:id with JSON body and returns parsed JSON on success", async () => {
    const data = { id: NODE_ID, title: "Updated title" };
    global.fetch = makeFetchMock(true, { data });

    const result = await updateNodeById(NODE_ID, patch);

    expect(global.fetch).toHaveBeenCalledWith(`/api/nodes/${NODE_ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    expect(result).toEqual(data);
  });

  it("throws the server error message when the response is not ok", async () => {
    global.fetch = makeFetchMock(false, { error: "Node not found" });

    await expect(updateNodeById(NODE_ID, patch)).rejects.toThrow("Node not found");
  });

  it("falls back to 'Something went wrong' when the error body has no message", async () => {
    global.fetch = makeFetchMock(false, {});

    await expect(updateNodeById(NODE_ID, patch)).rejects.toThrow("Something went wrong");
  });
});

describe("deleteNodeById", () => {
  it("calls DELETE /api/nodes/:id and resolves as void on success", async () => {
    global.fetch = makeFetchMock(true, null);

    await expect(deleteNodeById(NODE_ID)).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledWith(`/api/nodes/${NODE_ID}`, {
      method: "DELETE",
    });
  });

  it("throws the server error message when the response is not ok", async () => {
    global.fetch = makeFetchMock(false, { error: "Node not found" });

    await expect(deleteNodeById(NODE_ID)).rejects.toThrow("Node not found");
  });

  it("falls back to 'Something went wrong' when the error body has no message", async () => {
    global.fetch = makeFetchMock(false, {});

    await expect(deleteNodeById(NODE_ID)).rejects.toThrow("Something went wrong");
  });
});

describe("createLink", () => {
  it("calls POST /api/nodes/:id/links with targetNodeId body and returns parsed JSON on success", async () => {
    const data = { outgoingIds: [TARGET_ID], incomingIds: [] };
    global.fetch = makeFetchMock(true, { data });

    const result = await createLink(NODE_ID, TARGET_ID);

    expect(global.fetch).toHaveBeenCalledWith(`/api/nodes/${NODE_ID}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetNodeId: TARGET_ID }),
    });
    expect(result).toEqual(data);
  });

  it("throws the server error message when the response is not ok", async () => {
    global.fetch = makeFetchMock(false, { error: "Node not found" });

    await expect(createLink(NODE_ID, TARGET_ID)).rejects.toThrow("Node not found");
  });

  it("falls back to 'Something went wrong' when the error body has no message", async () => {
    global.fetch = makeFetchMock(false, {});

    await expect(createLink(NODE_ID, TARGET_ID)).rejects.toThrow("Something went wrong");
  });
});

describe("deleteLink", () => {
  it("calls DELETE /api/nodes/:id/links with targetNodeId body and returns parsed JSON on success", async () => {
    const data = { outgoingIds: [], incomingIds: [] };
    global.fetch = makeFetchMock(true, { data });

    const result = await deleteLink(NODE_ID, TARGET_ID);

    expect(global.fetch).toHaveBeenCalledWith(`/api/nodes/${NODE_ID}/links`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetNodeId: TARGET_ID }),
    });
    expect(result).toEqual(data);
  });

  it("throws the server error message when the response is not ok", async () => {
    global.fetch = makeFetchMock(false, { error: "Node not found" });

    await expect(deleteLink(NODE_ID, TARGET_ID)).rejects.toThrow("Node not found");
  });

  it("falls back to 'Something went wrong' when the error body has no message", async () => {
    global.fetch = makeFetchMock(false, {});

    await expect(deleteLink(NODE_ID, TARGET_ID)).rejects.toThrow("Something went wrong");
  });
});
