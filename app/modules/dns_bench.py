import asyncio
import dns.asyncresolver
import time
from typing import List, Dict, Any
from app.core.logger import logger

class DNSBenchmark:
    """Benchmarks a list of DNS resolvers against target domains."""
    
    def __init__(self, resolvers: List[str], test_domains: List[str], timeout: float = 3.0):
        self.resolvers = resolvers
        self.test_domains = test_domains
        self.timeout = timeout

    async def _test_resolver(self, resolver_ip: str, domain: str) -> Dict[str, Any]:
        res = dns.asyncresolver.Resolver(configure=False)
        res.nameservers = [resolver_ip]
        res.lifetime = self.timeout
        
        start_time = time.time()
        try:
            answers = await res.resolve(domain, 'A')
            latency = (time.time() - start_time) * 1000
            return {
                "resolver": resolver_ip,
                "domain": domain,
                "success": True,
                "latency_ms": latency,
                "records": [r.to_text() for r in answers]
            }
        except Exception as e:
            return {
                "resolver": resolver_ip,
                "domain": domain,
                "success": False,
                "error": str(e)
            }

    async def run_benchmark(self) -> List[Dict[str, Any]]:
        logger.info(f"Starting DNS benchmark for {len(self.resolvers)} resolvers.")
        tasks = []
        for resolver in self.resolvers:
            for domain in self.test_domains:
                tasks.append(self._test_resolver(resolver, domain))
                
        results = await asyncio.gather(*tasks)
        logger.info("DNS benchmark completed.")
        return results
