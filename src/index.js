/**
 * SecuryBlack Agent (nexus-agent) Install Worker
 *
 * Serves the correct install script based on the client's User-Agent:
 *   curl -fsSL https://install.securyblack.dev/nexus-agent | bash   → install.sh  (Linux/macOS)
 *   irm  https://install.securyblack.dev/nexus-agent | iex           → install.ps1 (Windows)
 */

const REPO_RAW = "https://raw.githubusercontent.com/securyblack/nexus-agent/main/scripts";

export default {
  async fetch(req) {
    const ua = req.headers.get("User-Agent") ?? "";
    const isWindows = ua.includes("PowerShell") || ua.includes("WindowsPowerShell");

    const scriptUrl = isWindows
      ? `${REPO_RAW}/install.ps1`
      : `${REPO_RAW}/install.sh`;

    return Response.redirect(scriptUrl, 302);
  },
};
