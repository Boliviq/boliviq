// Boliviq Security Sentinel — shared defensive rate-limiting utility.
// In-memory per-instance limiter. Each Deno function instance maintains its own
// map; for platform-managed scaling this provides best-effort throttling that
// raises the bar for abuse without guaranteeing distributed precision.

interface RateBucket {
  count: number;
  reset: number;
}

const buckets = new Map<string, RateBucket>();

/**
 * Returns true if the caller should be rate-limited (i.e. has exceeded maxCount
 * within the windowMs). Otherwise increments the counter and returns false.
 *
 * @param key     — composite key (e.g. `checkout:${userId}` or `chatbot:${visitorId}`)
 * @param maxCount — maximum allowed requests in the window
 * @param windowMs — sliding window in milliseconds (default 60s)
 */
export function rateLimited(key: string, maxCount: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > maxCount;
}

/** Returns the current count for a key without incrementing (for observability). */
export function rateCount(key: string): number {
  const b = buckets.get(key);
  return b ? b.count : 0;
}

/**
 * Sanitize a user-controlled string for safe logging/storage.
 * Strips control characters and truncates to a max length.
 */
export function sanitizeForLog(value: unknown, maxLen = 1000): string {
  if (value == null) return '';
  const s = String(value).replace(/[\x00-\x1F\x7F]/g, '').trim();
  return s.slice(0, maxLen);
}

/**
 * Detect common attack patterns in user input. Returns an array of detected
 * pattern names (empty array = clean input).
 */
export function detectAttackPatterns(input: string): string[] {
  const patterns: string[] = [];
  const lower = (input || '').toLowerCase();
  if (lower.includes('<script') || lower.includes('javascript:') || lower.includes('onerror=')) patterns.push('xss');
  if (lower.includes('../') || lower.includes('..\\') || lower.includes('%2e%2e')) patterns.push('path_traversal');
  if (lower.includes('$env') || lower.includes('process.env') || lower.includes('deno.env')) patterns.push('env_probe');
  if (/\b(union|select|insert|update|delete|drop)\b.*\b(from|into|table)\b/i.test(lower)) patterns.push('sqli_pattern');
  if (lower.includes('{{') && lower.includes('}}') && (lower.includes('system') || lower.includes('ignore') || lower.includes('instruction'))) patterns.push('prompt_injection');
  return patterns;
}