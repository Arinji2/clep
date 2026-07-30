import hashlib
import ipaddress
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

def get_true_client_ip(request: Request) -> str:
    headers = request.headers

    ip_headers = [
        "x-clep-client-ip",       # 1. Custom header from Next.js server actions
        "x-vercel-forwarded-for", # 2. Vercel's explicit forwarded header
        "cf-connecting-ip",       # 3. Cloudflare
        "true-client-ip",         # 4. Akamai/CF fallback
        "x-forwarded-for",        # 5. Standard proxy
        "x-real-ip"               # 6. Standard Nginx
    ]

    for header in ip_headers:
        if value := headers.get(header):
            ip = value.split(",")[0].strip()
            if ip:
                return ip

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
