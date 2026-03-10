import { searchMemory } from '../api.js';

export async function recallCommand(query, opts) {
  console.log(`Recalling: "${query}"...\n`);
  const data = await searchMemory(query, {
    tool: opts.tool,
    project: opts.project,
    limit: parseInt(opts.limit, 10),
  });

  console.log(data.answer);
  console.log();
  console.log(`\x1b[2mSessions searched: ${data.sessions}\x1b[0m`);
}
