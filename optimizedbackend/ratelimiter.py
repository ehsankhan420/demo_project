from fastapi import Request, HTTPException, status
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self, limit: int, window: int):
        self.limit = limit
        self.window = window
        self.requests = defaultdict(list)

    def is_allowed(self, request: Request):
        client_ip = request.client.host
        current_time = time.time()
        # Clean up old requests
        self.requests[client_ip] = [t for t in self.requests[client_ip] if t > current_time - self.window]
        if len(self.requests[client_ip]) >= self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {self.limit} requests per {self.window} seconds."
            )
        self.requests[client_ip].append(current_time)

rate_limiter = RateLimiter(limit=5, window=10)  # 5 requests per 10 seconds
