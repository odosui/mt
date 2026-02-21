// Helper function to handle error handling
export async function safe(
  op: () => Promise<{ status: number; json: unknown }>,
) {
  try {
    return await op();
  } catch (e) {
    console.error("API error:", e);
    return error(500, "Unexpected error occurred");
  }
}

// ===============
// RESPONSES
// ===============

export function ok(json: unknown) {
  return {
    status: 200,
    json,
  };
}

export function error(status: number, message: string) {
  return {
    status,
    json: { error: message },
  };
}
