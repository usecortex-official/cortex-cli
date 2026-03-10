import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, dirname, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { learn } from './api.js';

const SYNC_FILE = '.cortex-sync.json';
const IGNORED = ['.git', 'node_modules', '.cortex-sync.json', '.DS_Store', 'Thumbs.db'];

function loadSyncState(dir) {
  const file = join(dir, SYNC_FILE);
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, 'utf-8'));
  } catch {
    return {};
  }
}

function saveSyncState(dir, state) {
  writeFileSync(join(dir, SYNC_FILE), JSON.stringify(state, null, 2), 'utf-8');
}

function hashContent(content) {
  return createHash('sha256').update(content).digest('hex');
}

function findMarkdownFiles(dir, baseDir = dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (IGNORED.includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(full, baseDir));
    } else if (extname(entry).toLowerCase() === '.md') {
      files.push({
        absolute: full,
        relative: relative(baseDir, full),
      });
    }
  }
  return files;
}

function deriveTopicFromPath(relPath) {
  const dir = dirname(relPath);
  if (dir === '.' || dir === '') {
    // Use filename without extension as topic
    return basename(relPath, '.md');
  }
  // Use first directory level as topic
  return dir.split(/[\\/]/)[0];
}

function splitIntoFacts(content, filename) {
  // Split markdown into meaningful chunks
  const lines = content.split('\n');
  const facts = [];
  let current = [];
  let currentHeading = '';

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);

    if (headingMatch) {
      // Flush previous section
      if (current.length > 0) {
        const text = current.join('\n').trim();
        if (text.length > 10) {
          const prefix = currentHeading ? `${currentHeading}: ` : '';
          facts.push(`${prefix}${text}`);
        }
      }
      currentHeading = headingMatch[1];
      current = [];
    } else {
      current.push(line);
    }
  }

  // Flush last section
  if (current.length > 0) {
    const text = current.join('\n').trim();
    if (text.length > 10) {
      const prefix = currentHeading ? `${currentHeading}: ` : '';
      facts.push(`${prefix}${text}`);
    }
  }

  // If no headings found, treat whole file as one fact
  if (facts.length === 0 && content.trim().length > 10) {
    facts.push(content.trim());
  }

  return facts;
}

export async function syncFolder(dir, opts = {}) {
  const { dryRun = false, force = false, verbose = false } = opts;

  if (!existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  const files = findMarkdownFiles(dir);
  if (files.length === 0) {
    console.log('No markdown files found.');
    return { synced: 0, skipped: 0 };
  }

  const state = force ? {} : loadSyncState(dir);
  let synced = 0;
  let skipped = 0;
  let errors = 0;

  console.log(`Found ${files.length} markdown file(s) in ${dir}`);

  for (const file of files) {
    const content = readFileSync(file.absolute, 'utf-8');
    const hash = hashContent(content);
    const prevHash = state[file.relative];

    if (prevHash === hash && !force) {
      if (verbose) console.log(`  skip  ${file.relative} (unchanged)`);
      skipped++;
      continue;
    }

    const topic = deriveTopicFromPath(file.relative);
    const facts = splitIntoFacts(content, file.relative);

    if (facts.length === 0) {
      if (verbose) console.log(`  skip  ${file.relative} (empty)`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`  would sync  ${file.relative} → topic "${topic}" (${facts.length} facts)`);
      synced++;
      continue;
    }

    console.log(`  sync  ${file.relative} → topic "${topic}" (${facts.length} facts)`);

    for (const fact of facts) {
      try {
        await learn(fact, topic, 'cortex-cli');
      } catch (err) {
        console.error(`    error: ${err.message}`);
        errors++;
      }
    }

    state[file.relative] = hash;
    synced++;
  }

  if (!dryRun) {
    saveSyncState(dir, state);
  }

  console.log(`\nDone: ${synced} synced, ${skipped} skipped${errors ? `, ${errors} errors` : ''}`);
  return { synced, skipped, errors };
}

export async function pushFile(filePath, opts = {}) {
  const { topic: overrideTopic } = opts;

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  const topic = overrideTopic || basename(filePath, '.md');
  const facts = splitIntoFacts(content, filePath);

  if (facts.length === 0) {
    console.log('No content to push.');
    return;
  }

  console.log(`Pushing ${facts.length} fact(s) to topic "${topic}"...`);

  let errors = 0;
  for (const fact of facts) {
    try {
      await learn(fact, topic, 'cortex-cli');
      process.stdout.write('.');
    } catch (err) {
      console.error(`\n  error: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone: ${facts.length - errors} pushed${errors ? `, ${errors} errors` : ''}`);
}
