// the Api class is the server-agnostic entrypoint
// for the API functionality.

import LocalEngine from "../LocalEngine";

const CoreApi = {
  health: () => {
    return ok({ status: "ok" });
  },
  tags: {
    get: async () => {
      return withEngine((e) => e.allTags());
    },
  },
  notes: {
    counts: async () => {
      return withEngine((e) => e.noteCounts());
    },
    list: async (tags: string | undefined, is_review: string | undefined) => {
      return withEngine((e) =>
        e.notes({
          tags: tags ?? "",
          isReview: is_review === "true",
        }),
      );
    },
    get: async (id: string) => {
      return withEngine((e) => {
        const note = e.note(id);
        if (!note) {
          return error(404, "Note not found");
        }
        return note;
      });
    },
    create: async (body: string) => {
      return withEngine((e) => e.createNote(body));
    },
  },
  reviews: {
    counts: async () => {
      return withEngine((e) => e.reviewCounts());
    },
  },
};

export default CoreApi;

function ok(json: unknown) {
  return {
    status: 200,
    json,
  };
}

function error(status: number, message: string) {
  return {
    status,
    json: { error: message },
  };
}

// Helper function to handle LocalEngine initialization and error handling
async function withEngine<T>(
  operation: (engine: LocalEngine) => T | Promise<T>,
) {
  try {
    const engine = new LocalEngine();
    await engine.init();
    const result = await operation(engine);
    return ok(result);
  } catch (e) {
    return error(500, "Unexpected error occurred");
  }
}
