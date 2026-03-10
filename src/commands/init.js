import { loadConfig, saveConfig, getConfigDir } from '../config.js';
import { createInterface } from 'node:readline';

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function initCommand(opts) {
  const config = loadConfig();

  // API key
  let key = opts.key;
  if (!key) {
    console.log('Enter your usecortex API key.');
    console.log('Get one at https://usecortex.net → Settings → API Keys\n');
    key = await prompt('API key: ');
  }

  if (!key) {
    console.error('No API key provided.');
    process.exit(1);
  }

  if (!key.startsWith('ctx_sk_')) {
    console.error('Invalid API key format. Keys start with "ctx_sk_".');
    process.exit(1);
  }

  config.api_key = key;

  if (opts.url) {
    config.api_url = opts.url;
  }

  saveConfig(config);

  console.log(`\nConfig saved to ${getConfigDir()}/config.json`);
  console.log('Testing connection...');

  // Quick health check — try a search
  try {
    const res = await fetch(`${config.api_url}/brain/search?q=test`, {
      headers: { 'Authorization': `Bearer ${key}` },
    });

    if (res.ok) {
      console.log('Connected successfully!');
    } else if (res.status === 401) {
      console.error('API key is invalid. Double-check and try again.');
      process.exit(1);
    } else {
      console.log(`Warning: API returned ${res.status}. Key saved but connection may have issues.`);
    }
  } catch (err) {
    console.log(`Warning: Could not reach API (${err.message}). Key saved for later use.`);
  }
}
