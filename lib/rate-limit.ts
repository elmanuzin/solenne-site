type RateLimitOptions = {
    limit: number;
    windowMs: number;
};

type BucketState = {
    count: number;
    resetAt: number;
};

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
};

const buckets = new Map<string, BucketState>();

function nowMs(): number {
    return Date.now();
}

function cleanupExpiredBuckets(current: number) {
    for (const [key, value] of buckets.entries()) {
        if (value.resetAt <= current) {
            buckets.delete(key);
        }
    }
}

export function consumeRateLimit(
    key: string,
    options: RateLimitOptions
): RateLimitResult {
    const current = nowMs();
    cleanupExpiredBuckets(current);

    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= current) {
        buckets.set(key, {
            count: 1,
            resetAt: current + options.windowMs,
        });

        return {
            allowed: true,
            remaining: Math.max(0, options.limit - 1),
            retryAfterSeconds: 0,
        };
    }

    if (existing.count >= options.limit) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.max(
                1,
                Math.ceil((existing.resetAt - current) / 1000)
            ),
        };
    }

    existing.count += 1;
    buckets.set(key, existing);

    return {
        allowed: true,
        remaining: Math.max(0, options.limit - existing.count),
        retryAfterSeconds: 0,
    };
}

export function resetRateLimit(key: string) {
    buckets.delete(key);
}
