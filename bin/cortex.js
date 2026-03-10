#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('cortex')
  .description('usecortex CLI — markdown sync + session capture')
  .version(pkg.version);

// ── init ──────────────────────────────────────────────────────
program
  .command('init')
  .description('Configure your API key')
  .option('--key <key>', 'API key (or set CORTEX_API_KEY env var)')
  .option('--url <url>', 'Custom API URL')
  .action(async (opts) => {
    const { initCommand } = await import('../src/commands/init.js');
    await initCommand(opts);
  });

// ── sync ──────────────────────────────────────────────────────
program
  .command('sync [dir]')
  .description('Sync a markdown folder to usecortex')
  .option('-f, --force', 'Re-sync all files, ignoring cache')
  .option('-n, --dry-run', 'Preview what would be synced')
  .option('-v, --verbose', 'Show skipped files')
  .action(async (dir, opts) => {
    const { syncCommand } = await import('../src/commands/sync.js');
    await syncCommand(dir, opts);
  });

// ── push ──────────────────────────────────────────────────────
program
  .command('push <file>')
  .description('Push a single markdown file')
  .option('-t, --topic <name>', 'Override topic name')
  .action(async (file, opts) => {
    const { pushCommand } = await import('../src/commands/push.js');
    await pushCommand(file, opts);
  });

// ── pull ──────────────────────────────────────────────────────
program
  .command('pull [dir]')
  .description('Export knowledge as markdown files')
  .option('--format <fmt>', 'Export format: md or json', 'md')
  .option('-o, --output <file>', 'Output to a single file instead of directory')
  .action(async (dir, opts) => {
    const { pullCommand } = await import('../src/commands/pull.js');
    await pullCommand(dir, opts);
  });

// ── search ────────────────────────────────────────────────────
program
  .command('search <query>')
  .description('Search your knowledge base')
  .action(async (query) => {
    const { searchCommand } = await import('../src/commands/search.js');
    await searchCommand(query);
  });

// ── ask ───────────────────────────────────────────────────────
program
  .command('ask <question>')
  .description('Ask an AI-powered question about your knowledge')
  .action(async (question) => {
    const { askCommand } = await import('../src/commands/ask.js');
    await askCommand(question);
  });

// ── capture ───────────────────────────────────────────────────
program
  .command('capture <summary>')
  .description('Capture a session memory')
  .option('-t, --tool <name>', 'Tool name (e.g. claude-code, cursor)', 'cortex-cli')
  .option('-p, --project <name>', 'Project name')
  .option('--tags <tags>', 'Comma-separated tags')
  .option('--observations <text>', 'Additional observations')
  .action(async (summary, opts) => {
    const { captureCommand } = await import('../src/commands/capture.js');
    await captureCommand(summary, opts);
  });

// ── recall ────────────────────────────────────────────────────
program
  .command('recall <query>')
  .description('Search session memories')
  .option('-t, --tool <name>', 'Filter by tool')
  .option('-p, --project <name>', 'Filter by project')
  .option('-l, --limit <n>', 'Max results', '20')
  .action(async (query, opts) => {
    const { recallCommand } = await import('../src/commands/recall.js');
    await recallCommand(query, opts);
  });

// ── sessions ──────────────────────────────────────────────────
program
  .command('sessions')
  .description('List recent session memories')
  .option('-t, --tool <name>', 'Filter by tool')
  .option('-p, --project <name>', 'Filter by project')
  .option('-l, --limit <n>', 'Max results', '10')
  .action(async (opts) => {
    const { sessionsCommand } = await import('../src/commands/sessions.js');
    await sessionsCommand(opts);
  });

// ── context ───────────────────────────────────────────────────
program
  .command('context <project>')
  .description('Get project knowledge as CLAUDE.md format')
  .option('-o, --output <file>', 'Save to file')
  .action(async (project, opts) => {
    const { contextCommand } = await import('../src/commands/context.js');
    await contextCommand(project, opts);
  });

// ── whoami ────────────────────────────────────────────────────
program
  .command('whoami')
  .description('Show current config and connection status')
  .action(async () => {
    const { whoamiCommand } = await import('../src/commands/whoami.js');
    await whoamiCommand();
  });

program.parse();
