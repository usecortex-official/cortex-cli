import { resolve } from 'node:path';
import { syncFolder } from '../sync.js';

export async function syncCommand(dir, opts) {
  const target = resolve(dir || '.');
  await syncFolder(target, {
    dryRun: opts.dryRun,
    force: opts.force,
    verbose: opts.verbose,
  });
}
