import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { OpenquokApi } from "./api";
import { resolveOpenquokConfig } from "./config";
import { printErrorJson } from "./output";
import { registerAllCommands } from "./commands";

/**
 * `npm run` / `pnpm run` forward extra args as `node entry.js -- <args>`. Yargs treats a leading `--`
 * as "end of options", so the subcommand name becomes a positional and nothing runs (silent exit).
 */
function stripNpmRunArgvPassthrough(args: string[]): string[] {
  return args[0] === "--" ? args.slice(1) : args;
}

async function buildApi(): Promise<OpenquokApi> {
  // Stored credentials (from `openquok auth:login`) take priority over `OPENQUOK_API_KEY` so an
  // active OAuth2 session is not silently overridden by an env var left in the shell. `api_url`
  // from device login is persisted when `OPENQUOK_API_URL` is unset (typical local dev).
  return new OpenquokApi(await resolveOpenquokConfig());
}

async function main(): Promise<void> {
  const ctx = { buildApi };

  const cliArgs = stripNpmRunArgvPassthrough(hideBin(process.argv));

  const cli = registerAllCommands(
    yargs(cliArgs)
      .scriptName("openquok")
      .strict()
      .fail((msg: string, err: Error | undefined, y: any) => {
        if (err) return;
        printErrorJson(new Error(msg || y.help()));
      }),
    ctx
  )
    .demandCommand(1)
    .help();

  if (cliArgs.length === 0) {
    cli.showHelp("log");
    return;
  }

  await cli.parseAsync();
}

main().catch((err) => {
  printErrorJson(err);
  process.exitCode = 1;
});

