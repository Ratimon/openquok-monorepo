import type { Argv } from "yargs";

import type { CommandContext } from "./types";
import { registerAnalyticsCommands } from "./analytics";
import { registerAuthCommands } from "./auth";
import { registerConfigCommands } from "./config";
import { registerIntegrationCommands } from "./integrations";
import { registerPlugCommands } from "./plugs";
import { registerPostCommands } from "./posts";
import { registerUploadCommands } from "./upload";

export function registerAllCommands(y: Argv, ctx: CommandContext): Argv {
  let out = y;
  out = registerConfigCommands(out, ctx);
  out = registerAuthCommands(out, ctx);
  out = registerIntegrationCommands(out, ctx);
  out = registerPlugCommands(out, ctx);
  out = registerPostCommands(out, ctx);
  out = registerAnalyticsCommands(out, ctx);
  out = registerUploadCommands(out, ctx);
  return out;
}

