import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getContext } from '../api.js';

export async function contextCommand(project, opts) {
  console.log(`Fetching context for "${project}"...`);
  const data = await getContext(project);

  if (opts.output) {
    const outPath = resolve(opts.output);
    writeFileSync(outPath, data, 'utf-8');
    console.log(`Saved to ${outPath}`);
  } else {
    console.log();
    console.log(data);
  }
}
