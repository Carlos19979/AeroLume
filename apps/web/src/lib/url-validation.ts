export function isInternalUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
    if (hostname.startsWith('10.')) return true;
    if (hostname.startsWith('192.168.')) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true;
    if (hostname === '169.254.169.254') return true;
    if (hostname.endsWith('.internal') || hostname.endsWith('.local')) return true;
    return false;
  } catch {
    return true;
  }
}
