import platform
import socket
import psutil
from typing import Dict, Any

class SystemProfiler:
    """Gathers system and network interface information."""
    
    @staticmethod
    def get_profile() -> Dict[str, Any]:
        profile = {
            "os": platform.system(),
            "os_release": platform.release(),
            "architecture": platform.machine(),
            "hostname": socket.gethostname(),
            "interfaces": []
        }
        
        # Gather network interfaces
        addrs = psutil.net_if_addrs()
        stats = psutil.net_if_stats()
        
        for interface_name, interface_addresses in addrs.items():
            iface_info = {
                "name": interface_name,
                "is_up": stats[interface_name].isup if interface_name in stats else False,
                "addresses": []
            }
            for addr in interface_addresses:
                if addr.family == socket.AF_INET:
                    iface_info["addresses"].append({"type": "IPv4", "address": addr.address})
                elif addr.family == socket.AF_INET6:
                    iface_info["addresses"].append({"type": "IPv6", "address": addr.address})
                    
            profile["interfaces"].append(iface_info)
            
        return profile
