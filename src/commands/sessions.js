import { listSessions } from '../api.js';

export async function sessionsCommand(opts) {
  const data = await listSessions({
    tool: opts.tool,
    project: opts.project,
    limit: parseInt(opts.limit, 10),
  });

  if (!data.sessions || data.sessions.length === 0) {
    console.log('No sessions found.');
    return;
  }

  console.log(`${data.count} session(s):\n`);
  for (const s of data.sessions) {
    const tool = s.tool ? `[${s.tool}]` : '';
    const project = s.project ? ` (${s.project})` : '';
    const tags = s.tags?.length ? ` #${s.tags.join(' #')}` : '';
    const date = new Date(s.created_at).toLocaleString();

    console.log(`  ${s.id.slice(0, 8)}  ${tool}${project}${tags}`);
    console.log(`  \x1b[2m${date}\x1b[0m`);
    console.log();
  }
}
