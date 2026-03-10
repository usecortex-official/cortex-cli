import { captureSession } from '../api.js';

export async function captureCommand(summary, opts) {
  const tags = opts.tags ? opts.tags.split(',').map(t => t.trim()) : undefined;

  console.log('Capturing session...');
  const data = await captureSession(summary, {
    tool: opts.tool,
    project: opts.project,
    tags,
    observations: opts.observations,
  });

  console.log(`Session captured (id: ${data.id})`);
}
