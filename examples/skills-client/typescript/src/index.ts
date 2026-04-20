import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SkillsClient } from "@modelcontextprotocol/mcp-native-skills";
import * as path from "path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const serverPath = path.resolve(__dirname, "../../../skills-server/typescript/dist/index.js");

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
  });

  const client = new Client(
    { name: "example-skills-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);

  const skillsClient = new SkillsClient(client);

  console.log("Fetching skills list...");
  const listResponse = await skillsClient.listSkills();
  console.log(JSON.stringify(listResponse, null, 2));

  if (listResponse.skills.length > 0) {
    const skillToActivate = listResponse.skills[0].name;
    console.log(`\nActivating skill: ${skillToActivate}`);
    
    const activateResponse = await skillsClient.activateSkill(skillToActivate);
    console.log(JSON.stringify(activateResponse, null, 2));

    const tools = activateResponse.contents?.tools || [];
    const weatherTool = tools.find(t => t.name === "get_weather");

    if (weatherTool) {
      console.log(`\nExecuting discovered tool: ${weatherTool.name}`);
      const toolResult = await client.callTool({
        name: weatherTool.name,
        arguments: { city: "Cambridge" }
      });
      console.log(JSON.stringify(toolResult, null, 2));
    }
  } else {
    console.log("No skills found.");
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
