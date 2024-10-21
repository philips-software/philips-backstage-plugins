#!/usr/bin/env node
/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @backstage/no-undeclared-imports */
import { execFile as execFileCb } from "child_process";
import { promisify } from "util";

const execFile = promisify(execFileCb);

async function main() {
  let files = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));

  const workspaces = JSON.parse(files);

  console.log(workspaces);

  for (const workspace of workspaces) {
    console.log(`Deduping workspace ${workspace}`);
    let stdout;
    let stderr;
    let failed;

    try {
      const result = await execFile("yarn", ["dedupe"], {
        shell: true,
        cwd: `./workspaces/${workspace}`,
      });
      stdout = result.stdout?.trim();
      stderr = result.stderr?.trim();
      failed = false;
    } catch (error) {
      console.error(
        `Failed to dedupe workspace ${workspace} with error: ${error.message}`
      );
      stdout = error.stdout?.trim();
      stderr = error.stderr?.trim();
      failed = true;
    }

    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.error(stderr);
    }
  }
}

main().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});
