import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.cortex');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULTS = {
  api_url: 'https://api.usecortex.net',
  api_key: null,
};

export function getConfigDir() {
  return CONFIG_DIR;
}

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig() {
  ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) {
    return { ...DEFAULTS };
  }
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveConfig(config) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  try {
    chmodSync(CONFIG_FILE, 0o600);
  } catch {
    // chmod may not work on Windows — that's okay
  }
}

export function getApiKey() {
  const config = loadConfig();
  const envKey = process.env.CORTEX_API_KEY;
  return envKey || config.api_key;
}

export function getApiUrl() {
  const config = loadConfig();
  return process.env.CORTEX_API_URL || config.api_url;
}

export function requireAuth() {
  const key = getApiKey();
  if (!key) {
    console.error('Not authenticated. Run `cortex init` first or set CORTEX_API_KEY.');
    process.exit(1);
  }
  return key;
}
