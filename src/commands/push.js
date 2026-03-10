import { resolve } from 'node:path';
import { pushFile } from '../sync.js';

export async function pushCommand(file, opts) {
  await pushFile(resolve(file), { topic: opts.topic });
}
