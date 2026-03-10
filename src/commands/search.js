import { search } from '../api.js';

export async function searchCommand(query) {
  console.log(`Searching: "${query}"...\n`);
  const data = await search(query);

  if (!data.results || data.results.length === 0) {
    console.log('No results found.');
    return;
  }

  console.log(`${data.total} result(s):\n`);
  for (const r of data.results) {
    const topic = r.topic ? `[${r.topic}] ` : '';
    console.log(`  ${topic}${r.fact}`);
    if (r.created_at) {
      console.log(`  ${dim(new Date(r.created_at).toLocaleDateString())}`);
    }
    console.log();
  }
}

function dim(text) {
  return `\x1b[2m${text}\x1b[0m`;
}
