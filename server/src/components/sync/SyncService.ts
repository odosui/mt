import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export type SyncStatus = {
  changed_files: number;
  branch: string | null;
  ahead: number;
  behind: number;
  is_git_repo?: boolean;
};

const NO_GIT_RESPONSE: SyncStatus = {
  changed_files: 0,
  branch: null,
  ahead: 0,
  behind: 0,
  is_git_repo: false,
};

const createSyncService = (mtHome: string) => {
  async function getStatus(): Promise<SyncStatus> {
    try {
      const [statusResult, branchResult] = await Promise.all([
        execAsync("git status --porcelain", { cwd: mtHome }),
        execAsync("git branch --show-current", { cwd: mtHome }),
      ]);
      const lines = statusResult.stdout.trim().split("\n").filter(Boolean);
      const branch = branchResult.stdout.trim();

      const { ahead, behind } = await getBehind(mtHome);

      return { changed_files: lines.length, branch, ahead, behind };
    } catch (e: any) {
      // Not a git repo or git not installed
      if (
        e.code === 128 ||
        e.message?.includes("not a git repository") ||
        e.message?.includes("git: not found") ||
        e.message?.includes("'git' is not recognized")
      ) {
        return NO_GIT_RESPONSE;
      }
      throw e;
    }
  }

  return {
    getStatus,
  };
};

async function getBehind(mtHome: string) {
  // Get ahead/behind counts relative to upstream
  let ahead = 0;
  let behind = 0;
  try {
    const { stdout } = await execAsync(
      "git rev-list --left-right --count HEAD...@{upstream}",
      { cwd: mtHome },
    );
    const parts = stdout.trim().split(/\s+/);
    ahead = parseInt(parts[0] ?? "0", 10) || 0;
    behind = parseInt(parts[1] ?? "0", 10) || 0;
  } catch {
    // No upstream configured, ignore
  }

  return { ahead, behind };
}

export default createSyncService;
