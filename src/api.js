import { getApiUrl, requireAuth } from './config.js';

async function request(method, path, body = null) {
  const apiKey = requireAuth();
  const url = `${getApiUrl()}${path}`;

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const opts = { method, headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);

  if (res.status === 401) {
    console.error('Authentication failed. Check your API key with `cortex init`.');
    process.exit(1);
  }

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    console.error(`Rate limit exceeded. ${data.error || 'Upgrade your plan at https://usecortex.net'}`);
    process.exit(1);
  }

  if (res.status === 403) {
    const data = await res.json().catch(() => ({}));
    console.error(`Access denied: ${data.error || 'This feature requires a higher plan.'}`);
    if (data.upgrade_url) console.error(`Upgrade at ${data.upgrade_url}`);
    process.exit(1);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

// Knowledge API
export const learn = (fact, topic, source = 'cortex-cli') =>
  request('POST', '/brain/learn', { fact, topic, source });

export const ask = (q) =>
  request('GET', `/brain/ask?q=${encodeURIComponent(q)}`);

export const search = (q) =>
  request('GET', `/brain/search?q=${encodeURIComponent(q)}`);

export const getContext = (slug) =>
  request('GET', `/brain/context/${encodeURIComponent(slug)}`);

export const getTopic = (name) =>
  request('GET', `/brain/topic/${encodeURIComponent(name)}`);

export const exportAll = (format = 'md') =>
  request('GET', `/brain/export?format=${encodeURIComponent(format)}`);

// Memory API
export const captureSession = (summary, opts = {}) =>
  request('POST', '/brain/memory/capture', {
    summary,
    tool: opts.tool || 'cortex-cli',
    project: opts.project,
    tags: opts.tags,
    observations: opts.observations,
  });

export const searchMemory = (q, opts = {}) => {
  const params = new URLSearchParams({ q });
  if (opts.tool) params.set('tool', opts.tool);
  if (opts.project) params.set('project', opts.project);
  if (opts.limit) params.set('limit', String(opts.limit));
  return request('GET', `/brain/memory/search?${params}`);
};

export const listSessions = (opts = {}) => {
  const params = new URLSearchParams();
  if (opts.tool) params.set('tool', opts.tool);
  if (opts.project) params.set('project', opts.project);
  if (opts.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  return request('GET', `/brain/memory/sessions${qs ? '?' + qs : ''}`);
};

export const getSession = (id) =>
  request('GET', `/brain/memory/session/${encodeURIComponent(id)}`);

export const deleteSession = (id) =>
  request('DELETE', `/brain/memory/session/${encodeURIComponent(id)}`);
