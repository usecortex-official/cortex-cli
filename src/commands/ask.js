import { ask } from '../api.js';

export async function askCommand(question) {
  console.log(`Asking: "${question}"...\n`);
  const data = await ask(question);

  console.log(data.answer);
  console.log();
  console.log(`\x1b[2mConfidence: ${Math.round(data.confidence * 100)}% | Sources: ${data.sources}\x1b[0m`);
}
