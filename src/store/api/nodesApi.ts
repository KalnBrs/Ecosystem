export async function listNodes(): Promise<JSON> {
  const res = await fetch("/api/nodes");

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  return await res.json();
}

export async function getNodeById(id: string): Promise<JSON> {
  const res = await fetch(`/api/nodes/${id}`)

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  return await res.json();
}

export async function createNode(data: object) {
  const res = await fetch("/api/nodes", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  return await res.json();
}

export async function updateNodeById(id: string, data: object) {
  const res = await fetch(`/api/nodes/${id}`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  return await res.json();
}

export async function deleteNodeById(id: string) {
  const res = await fetch(`/api/nodes/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  return await res.json();
}

export async function createLink(id: string, targetNodeId: string) {
  const res = await fetch(`/api/nodes/${id}/links`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({targetNodeId})
  })

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  return await res.json();
}

export async function deleteLink(id: string, targetNodeId: string) {
  const res = await fetch(`/api/nodes/${id}/links`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({targetNodeId})
  })

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  return await res.json();
}