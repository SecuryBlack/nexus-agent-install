/**
 * SecuryBlack Agent (nexus-agent) Install Worker
 *
 * Serves the correct install script based on the client's User-Agent:
 *   curl -fsSL https://install.securyblack.dev/nexus-agent | bash   → install.sh  (Linux/macOS)
 *   irm  https://install.securyblack.dev/nexus-agent | iex           → install.ps1 (Windows)
 */

const REPOS = [
  "https://raw.githubusercontent.com/securyblack/nexus-agent/main/scripts",
  "https://raw.githubusercontent.com/securyblack/nexus-agent/master/scripts",
];

export default {
  async fetch(req) {
    try {
      const url = new URL(req.url);
      const ua = req.headers.get("User-Agent") ?? "";
      const isWindows = ua.includes("PowerShell") || ua.includes("WindowsPowerShell") || url.pathname.includes("windows") || url.pathname.endsWith(".ps1");

      const scriptFile = isWindows ? "install.ps1" : "install.sh";
      
      let res = null;
      for (const repoUrl of REPOS) {
        const githubUrl = `${repoUrl}/${scriptFile}`;
        const attempt = await fetch(githubUrl, {
          headers: { "User-Agent": "SecuryBlack-Installer-Worker" },
          cf: { cacheTtl: 60 },
        });
        if (attempt.ok) {
          res = attempt;
          break;
        }
      }

      if (!res) {
        return new Response(`# Error: Failed to fetch installer script from GitHub\n`, {
          status: 502,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      let scriptText = await res.text();

      if (isWindows) {
        const winHeader = `# SecuryBlack Windows Compatibility (Windows Server 2019+ / PowerShell 5.1)\r\n[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls11 -bor [Net.SecurityProtocolType]::Tls\r\nSet-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force -ErrorAction SilentlyContinue\r\n\r\n`;
        if (!scriptText.includes("[Net.ServicePointManager]::SecurityProtocol")) {
          scriptText = winHeader + scriptText;
        }
      }

      return new Response(scriptText, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=60, s-maxage=60",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new Response(`# Internal error: ${e.message}\n`, {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  },
};
