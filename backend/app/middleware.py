# backend/app/middleware.py
import hashlib
import ipaddress
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

def get_true_client_ip(request: Request) -> str:
    headers = request.headers

    if cf_ip := headers.get("cf-connecting-ip"):
        return cf_ip.split(",")[0].strip()

    # 2. Vercel's explicit forwarded header
    if vercel_ip := headers.get("x-vercel-forwarded-for"):
        return vercel_ip.split(",")[0].strip()

    # 3. True-Client-IP (Akamai/CF fallback)
    if true_client := headers.get("true-client-ip"):
        return true_client.split(",")[0].strip()

    # 4. Standard X-Forwarded-For (Left-most is original client)
    if xff := headers.get("x-forwarded-for"):
        return xff.split(",")[0].strip()

    # 5. X-Real-IP (Standard Nginx/Proxy)
    if x_real_ip := headers.get("x-real-ip"):
        return x_real_ip.split(",")[0].strip()

    # 6. Fallback to raw socket host
    return request.client.host if request.client else "127.0.0.1"

def compute_network_hash(ip_str: str) -> str:
    try:
        ip = ipaddress.ip_address(ip_str)
        if isinstance(ip, ipaddress.IPv4Address):
            # Mask /24 
            network_key = str(ipaddress.IPv4Network(f"{ip}/24", strict=False).network_address)
        else:
            # Mask /64 for IPv6
            network_key = str(ipaddress.IPv6Network(f"{ip}/64", strict=False).network_address)
    except ValueError:
        network_key = "default_network"

    return hashlib.sha256(network_key.encode("utf-8")).hexdigest()[:16]

class NetworkMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = get_true_client_ip(request)
        request.state.client_ip = client_ip 
        request.state.network_hash = compute_network_hash(client_ip)
        response = await call_next(request)
        return response
