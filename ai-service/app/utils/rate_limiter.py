from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass

from fastapi import HTTPException, status


@dataclass
class TokenBucket:
    capacity: int
    refill_rate: float
    tokens: float
    last_refill: float

    def consume(self, amount: int = 1) -> bool:
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
        if self.tokens >= amount:
            self.tokens -= amount
            return True
        return False


class RateLimiter:
    def __init__(self, capacity: int = 30, refill_rate: float = 0.5) -> None:
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.buckets: dict[str, TokenBucket] = defaultdict(self._create_bucket)

    def _create_bucket(self) -> TokenBucket:
        return TokenBucket(self.capacity, self.refill_rate, self.capacity, time.monotonic())

    def check(self, key: str) -> None:
        bucket = self.buckets[key]
        if not bucket.consume():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
            )


rate_limiter = RateLimiter()
