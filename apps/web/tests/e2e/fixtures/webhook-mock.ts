import http from 'node:http';
import type { AddressInfo } from 'node:net';

export interface MockWebhookServer {
  /** e.g. http://127.0.0.1.nip.io:5001 — passes isInternalUrl string checks */
  url: string;
  /** Raw parsed POST bodies received, in order */
  captured: unknown[];
  close: () => Promise<void>;
}

/**
 * Starts a minimal HTTP server on a random free port and returns a handle.
 *
 * URL uses the nip.io wildcard DNS trick: `127.0.0.1.nip.io` resolves to
 * 127.0.0.1 via public DNS, but isInternalUrl() only checks for string patterns
 * ("localhost", "127.0.0.1", "::1", "10.*", "192.168.*", "172.16-31.*",
 * ".internal", ".local") — none of which match "127.0.0.1.nip.io", so the
 * webhook POST is allowed through while still reaching our local mock server.
 */
export async function startMockWebhook(): Promise<MockWebhookServer> {
  const captured: unknown[] = [];

  const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end();
      return;
    }
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        captured.push(JSON.parse(body));
      } catch {
        captured.push(body);
      }
      res.writeHead(200);
      res.end('ok');
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1.nip.io:${port}`,
    captured,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
