import { loadConfig, getApiKey, getApiUrl } from '../config.js';

export async function whoamiCommand() {
  const config = loadConfig();
  const key = getApiKey();
  const url = getApiUrl();

  console.log('usecortex CLI\n');
  console.log(`  API URL:  ${url}`);

  if (key) {
    const masked = key.slice(0, 14) + '...' + key.slice(-4);
    console.log(`  API Key:  ${masked}`);

    // Test connection
    try {
      const res = await fetch(`${url}/brain/search?q=ping`, {
        headers: { 'Authorization': `Bearer ${key}` },
      });
      if (res.ok) {
        console.log(`  Status:   \x1b[32mconnected\x1b[0m`);
      } else if (res.status === 401) {
        console.log(`  Status:   \x1b[31minvalid key\x1b[0m`);
      } else {
        console.log(`  Status:   \x1b[33merror (${res.status})\x1b[0m`);
      }
    } catch (err) {
      console.log(`  Status:   \x1b[31munreachable\x1b[0m (${err.message})`);
    }
  } else {
    console.log(`  API Key:  \x1b[31mnot set\x1b[0m`);
    console.log('\n  Run \`cortex init\` to configure.');
  }
}
