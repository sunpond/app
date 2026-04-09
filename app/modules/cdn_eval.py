import asyncio
import dns.asyncresolver
from typing import List, Dict, Any
from app.utils.network import async_ping
from app.core.logger import logger

class CDNEvaluator:
    """Resolves CDN targets and evaluates their latency via ICMP ping."""
    
    def __init__(self, targets: List[str]):
        self.targets = targets

    async def evaluate(self) -> List[Dict[str, Any]]:
        logger.info(f"Evaluating {len(self.targets)} CDN targets.")
        results = []
        resolver = dns.asyncresolver.Resolver()
        
        for target in self.targets:
            try:
                answers = await resolver.resolve(target, 'A')
                ips = [answer.to_text() for answer in answers]
                
                target_results = {
                    'target': target,
                    'resolved_ips': [],
                    'success': True
                }
                
                for ip in ips:
                    latency = await async_ping(ip)
                    target_results['resolved_ips'].append({
                        'ip': ip,
                        'latency_ms': latency
                    })
                    
                results.append(target_results)
            except Exception as e:
                logger.error(f"Failed to evaluate CDN target {target}: {e}")
                results.append({
                    'target': target,
                    'success': False,
                    'error': str(e)
                })
                
        return results
