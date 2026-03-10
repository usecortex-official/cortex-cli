import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { exportAll } from '../api.js';

export async function pullCommand(dir, opts) {
  const format = opts.format || 'md';

  console.log(`Exporting knowledge (${format})...`);
  const data = await exportAll(format);

  // Single file output
  if (opts.output) {
    const outPath = resolve(opts.output);
    writeFileSync(outPath, typeof data === 'string' ? data : JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved to ${outPath}`);
    return;
  }

  // Directory output for markdown
  if (format === 'md') {
    const outDir = resolve(dir || './cortex-export');
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    if (typeof data === 'string') {
      // Single markdown blob — save as one file
      const outPath = join(outDir, 'knowledge.md');
      writeFileSync(outPath, data, 'utf-8');
      console.log(`Saved to ${outPath}`);
    } else if (data.topics) {
      // Structured JSON — split by topic
      for (const topic of data.topics) {
        const filename = topic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
        const content = `# ${topic.name}\n\n${topic.entries.map(e => `- ${e.fact}`).join('\n')}\n`;
        writeFileSync(join(outDir, filename), content, 'utf-8');
      }
      console.log(`Saved ${data.topics.length} topic file(s) to ${outDir}`);
    }
    return;
  }

  // JSON output
  if (format === 'json') {
    const outDir = resolve(dir || '.');
    const outPath = join(outDir, 'cortex-export.json');
    writeFileSync(outPath, typeof data === 'string' ? data : JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved to ${outPath}`);
  }
}
