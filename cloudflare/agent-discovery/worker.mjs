const catalogPath = '/.well-known/api-catalog';
const descriptionPath = '/openapi.json';
const documentationPath = '/agent-docs';
const homepagePaths = new Set(['/', '/en', '/en/', '/de', '/de/']);

export const discoveryLinks = [
  `<${catalogPath}>; rel="api-catalog"; type="application/linkset+json"`,
  `<${descriptionPath}>; rel="service-desc"; type="application/vnd.oai.openapi+json"`,
  `<${documentationPath}>; rel="service-doc"; type="text/plain"`,
  '</index.md>; rel="describedby"; type="text/markdown"',
].join(', ');

const documentation = `Portfolio document API

This website publishes read-only portfolio documents. No authentication is required.
GET /index.md returns the full English portfolio as text/markdown.
GET /llms.txt returns a concise overview as text/markdown.
These documents describe consulting services, projects, capabilities and contact details.
They do not provide an API for booking appointments or contacting the site owner.
GET /openapi.json describes these document endpoints in OpenAPI format.
GET /.well-known/api-catalog returns an RFC 9727 API catalog.
`;

function discoveryDocument(path, origin) {
  if (path === documentationPath) return [documentation, 'text/plain; charset=utf-8'];
  if (path === catalogPath) return [JSON.stringify({
    linkset: [{
      anchor: `${origin}/index.md`,
      'service-desc': [{ href: `${origin}${descriptionPath}`, type: 'application/vnd.oai.openapi+json' }],
      'service-doc': [{ href: `${origin}${documentationPath}`, type: 'text/plain' }],
      describedby: [{ href: `${origin}/llms.txt`, type: 'text/markdown' }],
    }],
  }), 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"'];
  if (path === descriptionPath) return [JSON.stringify({
    openapi: '3.1.0',
    info: { title: 'Noël Schwabenland portfolio documents', version: '1.0.0', description: 'Read-only access to the public portfolio documents.' },
    servers: [{ url: origin }],
    externalDocs: { url: `${origin}${documentationPath}` },
    paths: Object.fromEntries([
      ['/index.md', 'getPortfolio', 'Full English portfolio'],
      ['/llms.txt', 'getOverview', 'Concise portfolio overview'],
    ].map(([path, operationId, summary]) => [path, {
      get: { operationId, summary, responses: { '200': {
        description: summary,
        content: { 'text/markdown': { schema: { type: 'string' } } },
      } } },
    }])),
  }), 'application/vnd.oai.openapi+json'];
}

// Inject fetch in tests; production uses Cloudflare's origin subrequest behavior.
export async function handleRequest(request, originFetch = fetch) {
  const url = new URL(request.url);
  const document = discoveryDocument(url.pathname, url.origin);
  if (document) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    return new Response(request.method === 'HEAD' ? null : document[0], {
      headers: {
        'Content-Type': document[1],
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  const response = await originFetch(request);
  if (!homepagePaths.has(url.pathname) || !['GET', 'HEAD'].includes(request.method)) return response;

  const headers = new Headers(response.headers);
  headers.append('Link', discoveryLinks);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default { fetch: request => handleRequest(request) };
