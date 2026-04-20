import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupSkills, ServerSkill } from "@modelcontextprotocol/mcp-native-skills";

const server = new Server(
  {
    name: "example-skills-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      skills: {
        listChanged: false,
      },
      tools: {},
    } as any,
  }
);

// Define a sample skill
const weatherSkill: ServerSkill = {
  skill: {
    name: "weather-forecaster",
    description: "A skill for resolving weather metrics.",
  },
  instructions: () => {
    return "# Weather Forecaster\nUse the provided tool `get_weather` to fetch weather.";
  },
  contents: () => {
    return {
      tools: [
        {
          name: "get_weather",
          description: "Check weather in a city.",
          inputSchema: {
            type: "object",
            properties: {
              city: {
                type: "string",
              },
            },
            required: ["city"],
          },
        },
      ],
    };
  },
};

setupSkills(server, [weatherSkill]);

// The tools in the skill generally need to be routed if the client invokes them via tools/call.
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  if (request.params.name === "get_weather") {
    return {
      content: [
        {
          type: "text",
          text: `The weather in ${request.params.arguments?.city} is sunny.`,
        }
      ]
    };
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Example Skills server running on stdio");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
