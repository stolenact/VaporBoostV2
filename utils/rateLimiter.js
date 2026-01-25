/**
 * VaporBooster - Rate Limiter
 * Controls request rate to Steam API
 * 
 * @author VaporBooster Team
 */

class RateLimiter {
    constructor(maxRequests = 30, intervalMs = 60000) {
        this.maxRequests = maxRequests;
        this.intervalMs = intervalMs;
        this.requests = [];
        this.queue = [];
        this.processing = false;
    }

    /**
     * Check if can make request now
     * @returns {boolean}
     */
    canMakeRequest() {
        this.cleanup();
        return this.requests.length < this.maxRequests;
    }

    /**
     * Cleanup old requests
     */
    cleanup() {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < this.intervalMs);
    }

    /**
     * Wait for rate limit slot
     * @returns {Promise<void>}
     */
    async waitForSlot() {
        return new Promise((resolve) => {
            const check = () => {
                if (this.canMakeRequest()) {
                    this.requests.push(Date.now());
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    /**
     * Execute function with rate limiting
     * @param {Function} fn 
     * @returns {Promise}
     */
    async execute(fn) {
        await this.waitForSlot();
        return fn();
    }

    /**
     * Get current usage stats
     * @returns {Object}
     */
    getStats() {
        this.cleanup();
        return {
            current: this.requests.length,
            max: this.maxRequests,
            percentage: (this.requests.length / this.maxRequests) * 100,
            queueLength: this.queue.length
        };
    }

    /**
     * Reset rate limiter
     */
    reset() {
        this.requests = [];
        this.queue = [];
    }
}

/**
 * Concurrent operation limiter
 */
class ConcurrencyLimiter {
    constructor(maxConcurrent = 5) {
        this.maxConcurrent = maxConcurrent;
        this.running = 0;
        this.queue = [];
    }

    /**
     * Execute with concurrency limit
     * @param {Function} fn 
     * @returns {Promise}
     */
    async execute(fn) {
        while (this.running >= this.maxConcurrent) {
            await new Promise(resolve => this.queue.push(resolve));
        }

        this.running++;

        try {
            return await fn();
        } finally {
            this.running--;

            if (this.queue.length > 0) {
                const resolve = this.queue.shift();
                resolve();
            }
        }
    }

    /**
     * Get current stats
     * @returns {Object}
     */
    getStats() {
        return {
            running: this.running,
            max: this.maxConcurrent,
            queued: this.queue.length
        };
    }
}

/**
 * Exponential backoff handler
 */
class BackoffManager {
    constructor(baseDelay = 1000, maxDelay = 60000, multiplier = 2) {
        this.baseDelay = baseDelay;
        this.maxDelay = maxDelay;
        this.multiplier = multiplier;
        this.attempts = new Map();
    }

    /**
     * Get delay for next attempt
     * @param {string} key 
     * @returns {number}
     */
    getDelay(key) {
        const attempts = this.attempts.get(key) || 0;
        const delay = Math.min(
            this.baseDelay * Math.pow(this.multiplier, attempts),
            this.maxDelay
        );
        return delay + Math.random() * 1000; // Add jitter
    }

    /**
     * Record failed attempt
     * @param {string} key 
     */
    recordFailure(key) {
        const current = this.attempts.get(key) || 0;
        this.attempts.set(key, current + 1);
    }

    /**
     * Reset attempts for key
     * @param {string} key 
     */
    reset(key) {
        this.attempts.delete(key);
    }

    /**
     * Get attempt count
     * @param {string} key 
     * @returns {number}
     */
    getAttempts(key) {
        return this.attempts.get(key) || 0;
    }

    /**
     * Wait with backoff
     * @param {string} key 
     * @returns {Promise<void>}
     */
    async wait(key) {
        const delay = this.getDelay(key);
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

module.exports = {
    RateLimiter,
    ConcurrencyLimiter,
    BackoffManager
};