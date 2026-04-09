import asyncio
import time
from ping3 import ping
from typing import Optional

async def async_ping(host: str, timeout: float = 2.0) -> Optional[float]:
    """Asynchronously pings a host and returns latency in ms."""
    loop = asyncio.get_running_loop()
    try:
        # ping3 is blocking, so we run it in an executor
        delay = await loop.run_in_executor(None, ping, host, timeout)
        if delay is None or delay is False:
            return None
        return delay * 1000  # Convert to ms
    except Exception:
        return None

async def tcp_ping(host: str, port: int, timeout: float = 2.0) -> Optional[float]:
    """Measures TCP connection latency to a host:port."""
    start_time = time.time()
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port),
            timeout=timeout
        )
        writer.close()
        await writer.wait_closed()
        return (time.time() - start_time) * 1000
    except Exception:
        return None
