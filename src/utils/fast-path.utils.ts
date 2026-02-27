export type FastPathFlow = 'invoice' | 'bookkeeping' | 'tax' | 'quickstore';

export function isFastPathCompleted(businessId: string, flow: FastPathFlow): boolean {
  try {
    const stored = localStorage.getItem(`accurify_fp_${businessId}`);
    if (!stored) return false;
    return JSON.parse(stored)[flow] === true;
  } catch {
    return false;
  }
}

export function markFastPathCompleted(businessId: string, flow: FastPathFlow): void {
  try {
    const key = `accurify_fp_${businessId}`;
    const stored = localStorage.getItem(key);
    const current = stored ? JSON.parse(stored) : {};
    localStorage.setItem(key, JSON.stringify({ ...current, [flow]: true }));
  } catch {
    // ignore
  }
}
