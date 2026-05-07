import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { OpenquokApi } from "./api";
import { getConfig, readCredentialsFile } from "./config";
import { printErrorJson } from "./output";
import { registerAllCommands } from "./commands";

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

  const argv = registerAllCommands(
    yargs(hideBin(process.argv))
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
    .parse();

  void argv;
}

main().catch((err) => {
  printErrorJson(err);
  process.exitCode = 1;
});

