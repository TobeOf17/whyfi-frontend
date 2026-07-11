import { calculate } from './calculationEngine.js';

/**
 * Same async signature as the old fetch-based version, so ExplorePage and
 * everything else calling this doesn't need to change at all — only the
 * implementation underneath moved from a network call to a local
 * calculation. Wrapped in Promise.resolve so a stray synchronous throw
 * (e.g. a malformed input) still surfaces through the existing .catch()
 * chains callers already have, rather than as an uncaught exception.
 */
export async function calculateScenario(input) {
  return Promise.resolve().then(() => calculate(input));
}