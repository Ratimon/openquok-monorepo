import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { OpenquokApi } from "./api";
import { getConfig, readCredentialsFile } from "./config";
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
  const base = getConfig();
  if (!base.apiKey) {
    const creds = await readCredentialsFile();
    if (creds?.apiKey) {
      return new OpenquokApi({ ...base, apiKey: creds.apiKey });
    }
  }
  return new OpenquokApi(base);
}

async function main(): Promise<void> {
  const ctx = { buildApi };

  const cliArgs = stripNpmRunArgvPassthrough(hideBin(process.argv));

  await registerAllCommands(
    yargs(cliArgs)
      .scriptName("openquok")
      .strict()
      .fail((msg: string, err: Error | undefined, y: any) => {
        if (err) {
          printErrorJson(err);
          return;
        }
        printErrorJson(new Error(msg || y.help()));
      }),
    ctx
  )
    .demandCommand(1)
    .help()
    .parseAsync();
}

main().catch((err) => {
  printErrorJson(err);
  process.exitCode = 1;
});

