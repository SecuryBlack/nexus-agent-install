# Nexus Agent Install Worker

Official Cloudflare Worker that serves the installation script for **Nexus Agent** (`nexus-agent`, the SecuryBlack base agent) based on the client User-Agent and operating system. The SecuryBlack panel shows these commands with your server token filled in:

- **Linux / macOS:** `curl -fsSL https://install.securyblack.com/linux | sudo bash -s -- --token <TOKEN>`
- **Windows (PowerShell):** `& ([scriptblock]::Create((irm https://install.securyblack.com/windows))) -Token "<TOKEN>"`

The scripts are fetched from `securyblack/nexus-agent` (`scripts/`), so a push there changes what is served within a minute. Each served script is counted in the `nexusagent_installs` Workers Analytics Engine dataset (script, client type and country; no IP or identifiers).

## License

Apache-2.0 License.
