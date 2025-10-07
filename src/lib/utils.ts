// Utility function for GET requests
export async function apiGet(url: string) {
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Utility function for POST requests
export async function apiPost(url: string, data: any) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Utility function for PUT requests
export async function apiPut(url: string, data: any) {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Utility function for DELETE requests
export async function apiDelete(url: string) {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    throw error;
  }
}
