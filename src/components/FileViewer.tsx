import React, { useState } from "react";
import { File, Folder, ChevronRight, ChevronDown } from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
}

const fileTree: FileNode[] = [
  {
    name: "app",
    type: "folder",
    children: [
      {
        name: "main.py",
        type: "file",
        content:
          'import sys\nimport os\n\n# Add the project root to the Python path\nsys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))\n\nfrom PySide6.QtWidgets import QApplication\nfrom app.gui.main_window import MainWindow\n\ndef main():\n    app = QApplication(sys.path)\n    window = MainWindow()\n    window.show()\n    sys.exit(app.exec())\n\nif __name__ == "__main__":\n    main()',
      },
      {
        name: "core",
        type: "folder",
        children: [
          {
            name: "config.py",
            type: "file",
            content:
              'import yaml\nimport os\nfrom typing import Dict, Any\n\nclass ConfigManager:\n    """Manages application configuration loaded from YAML."""\n    \n    def __init__(self, config_path: str = "config/config.yaml"):\n        self.config_path = config_path\n        self.config: Dict[str, Any] = {}\n        self.load_config()\n\n    def load_config(self):\n        if not os.path.exists(self.config_path):\n            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")\n        with open(self.config_path, "r", encoding="utf-8") as f:\n            self.config = yaml.safe_load(f)\n\n    def get(self, key: str, default: Any = None) -> Any:\n        keys = key.split(".")\n        val = self.config\n        for k in keys:\n            if isinstance(val, dict) and k in val:\n                val = val[k]\n            else:\n                return default\n        return val',
          },
          {
            name: "logger.py",
            type: "file",
            content:
              'import logging\nimport os\nfrom datetime import datetime\n\ndef setup_logger(name: str = "ConnectivitySuite", log_dir: str = "logs") -> logging.Logger:\n    """Configures and returns a logger instance."""\n    os.makedirs(log_dir, exist_ok=True)\n    \n    logger = logging.getLogger(name)\n    logger.setLevel(logging.DEBUG)\n    \n    if not logger.handlers:\n        # Console Handler\n        ch = logging.StreamHandler()\n        ch.setLevel(logging.INFO)\n        \n        # File Handler\n        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")\n        fh = logging.FileHandler(os.path.join(log_dir, f"session_{timestamp}.log"), encoding="utf-8")\n        fh.setLevel(logging.DEBUG)\n        \n        formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")\n        ch.setFormatter(formatter)\n        fh.setFormatter(formatter)\n        \n        logger.addHandler(ch)\n        logger.addHandler(fh)\n        \n    return logger\n\nlogger = setup_logger()',
          },
        ],
      },
      {
        name: "gui",
        type: "folder",
        children: [
          {
            name: "main_window.py",
            type: "file",
            content:
              'import sys\nimport asyncio\nimport os\nfrom PySide6.QtWidgets import (QMainWindow, QVBoxLayout, QWidget, QPushButton, \n                               QTextEdit, QProgressBar, QLabel, QHBoxLayout)\nfrom PySide6.QtCore import QThread, Signal\n\nfrom app.core.config import ConfigManager\nfrom app.modules.profiler import SystemProfiler\nfrom app.modules.dns_bench import DNSBenchmark\nfrom app.modules.cdn_eval import CDNEvaluator\nfrom app.reporting.engine import ReportEngine\n\nclass WorkerThread(QThread):\n    log_msg = Signal(str)\n    progress = Signal(int)\n    finished_task = Signal(dict)\n\n    def __init__(self, config):\n        super().__init__()\n        self.config = config\n\n    def run(self):\n        asyncio.run(self.run_async_tasks())\n\n    async def run_async_tasks(self):\n        self.log_msg.emit("Starting Connectivity Intelligence Suite...")\n        self.progress.emit(10)\n        \n        # 1. System Profile\n        self.log_msg.emit("Gathering System Profile...")\n        profile = SystemProfiler.get_profile()\n        self.progress.emit(20)\n        \n        # Load inputs\n        try:\n            with open("inputs/dns_resolvers.txt", "r") as f:\n                resolvers = [line.strip() for line in f if line.strip()]\n            with open("inputs/cdn_targets.txt", "r") as f:\n                cdns = [line.strip() for line in f if line.strip()]\n        except Exception as e:\n            self.log_msg.emit(f"Error loading inputs: {e}")\n            return\n\n        # 2. DNS Benchmark\n        self.log_msg.emit(f"Benchmarking {len(resolvers)} DNS resolvers...")\n        dns_bench = DNSBenchmark(resolvers, ["google.com", "cloudflare.com"])\n        dns_results = await dns_bench.run_benchmark()\n        self.progress.emit(50)\n        \n        # 3. CDN Evaluation\n        self.log_msg.emit(f"Evaluating {len(cdns)} CDN targets...")\n        cdn_eval = CDNEvaluator(cdns)\n        cdn_results = await cdn_eval.evaluate()\n        self.progress.emit(80)\n        \n        results = {\n            "system_profile": profile,\n            "dns_benchmark": dns_results,\n            "cdn_evaluation": cdn_results\n        }\n        \n        # 4. Reporting\n        self.log_msg.emit("Generating Reports...")\n        engine = ReportEngine(results)\n        engine.save_json()\n        \n        # Optional: Generate AI Summary if API key is present in env\n        api_key = os.environ.get("GEMINI_API_KEY")\n        if api_key:\n            self.log_msg.emit("Generating AI Executive Summary...")\n            engine.generate_executive_summary(api_key)\n            \n        self.progress.emit(100)\n        self.log_msg.emit("All tasks completed successfully. Check \'outputs\' folder.")\n        self.finished_task.emit(results)\n\nclass MainWindow(QMainWindow):\n    def __init__(self):\n        super().__init__()\n        self.setWindowTitle("Connectivity Intelligence Suite")\n        self.resize(800, 600)\n        \n        self.config = ConfigManager()\n        \n        # UI Setup\n        central_widget = QWidget()\n        self.setCentralWidget(central_widget)\n        layout = QVBoxLayout(central_widget)\n        \n        self.title_label = QLabel("Network Optimization & Profiling")\n        self.title_label.setStyleSheet("font-size: 18px; font-weight: bold;")\n        layout.addWidget(self.title_label)\n        \n        self.log_output = QTextEdit()\n        self.log_output.setReadOnly(True)\n        layout.addWidget(self.log_output)\n        \n        self.progress_bar = QProgressBar()\n        self.progress_bar.setValue(0)\n        layout.addWidget(self.progress_bar)\n        \n        btn_layout = QHBoxLayout()\n        self.start_btn = QPushButton("Start Analysis")\n        self.start_btn.clicked.connect(self.start_analysis)\n        btn_layout.addWidget(self.start_btn)\n        \n        layout.addLayout(btn_layout)\n        \n    def log(self, message: str):\n        self.log_output.append(message)\n        \n    def start_analysis(self):\n        self.start_btn.setEnabled(False)\n        self.progress_bar.setValue(0)\n        self.log_output.clear()\n        \n        self.worker = WorkerThread(self.config)\n        self.worker.log_msg.connect(self.log)\n        self.worker.progress.connect(self.progress_bar.setValue)\n        self.worker.finished_task.connect(self.on_finished)\n        self.worker.start()\n        \n    def on_finished(self, results):\n        self.start_btn.setEnabled(True)',
          },
        ],
      },
      {
        name: "modules",
        type: "folder",
        children: [
          {
            name: "cdn_eval.py",
            type: "file",
            content:
              'import asyncio\nimport dns.asyncresolver\nfrom typing import List, Dict, Any\nfrom app.utils.network import async_ping\nfrom app.core.logger import logger\n\nclass CDNEvaluator:\n    """Resolves CDN targets and evaluates their latency via ICMP ping."""\n    \n    def __init__(self, targets: List[str]):\n        self.targets = targets\n\n    async def evaluate(self) -> List[Dict[str, Any]]:\n        logger.info(f"Evaluating {len(self.targets)} CDN targets.")\n        results = []\n        resolver = dns.asyncresolver.Resolver()\n        \n        for target in self.targets:\n            try:\n                answers = await resolver.resolve(target, "A")\n                ips = [answer.to_text() for answer in answers]\n                \n                target_results = {\n                    "target": target,\n                    "resolved_ips": [],\n                    "success": True\n                }\n                \n                for ip in ips:\n                    latency = await async_ping(ip)\n                    target_results["resolved_ips"].append({\n                        "ip": ip,\n                        "latency_ms": latency\n                    })\n                    \n                results.append(target_results)\n            except Exception as e:\n                logger.error(f"Failed to evaluate CDN target {target}: {e}")\n                results.append({\n                    "target": target,\n                    "success": False,\n                    "error": str(e)\n                })\n                \n        return results',
          },
          {
            name: "dns_bench.py",
            type: "file",
            content:
              'import asyncio\nimport dns.asyncresolver\nimport time\nfrom typing import List, Dict, Any\nfrom app.core.logger import logger\n\nclass DNSBenchmark:\n    """Benchmarks a list of DNS resolvers against target domains."""\n    \n    def __init__(self, resolvers: List[str], test_domains: List[str], timeout: float = 3.0):\n        self.resolvers = resolvers\n        self.test_domains = test_domains\n        self.timeout = timeout\n\n    async def _test_resolver(self, resolver_ip: str, domain: str) -> Dict[str, Any]:\n        res = dns.asyncresolver.Resolver(configure=False)\n        res.nameservers = [resolver_ip]\n        res.lifetime = self.timeout\n        \n        start_time = time.time()\n        try:\n            answers = await res.resolve(domain, "A")\n            latency = (time.time() - start_time) * 1000\n            return {\n                "resolver": resolver_ip,\n                "domain": domain,\n                "success": True,\n                "latency_ms": latency,\n                "records": [r.to_text() for r in answers]\n            }\n        except Exception as e:\n            return {\n                "resolver": resolver_ip,\n                "domain": domain,\n                "success": False,\n                "error": str(e)\n            }\n\n    async def run_benchmark(self) -> List[Dict[str, Any]]:\n        logger.info(f"Starting DNS benchmark for {len(self.resolvers)} resolvers.")\n        tasks = []\n        for resolver in self.resolvers:\n            for domain in self.test_domains:\n                tasks.append(self._test_resolver(resolver, domain))\n                \n        results = await asyncio.gather(*tasks)\n        logger.info("DNS benchmark completed.")\n        return results',
          },
          {
            name: "profiler.py",
            type: "file",
            content:
              'import platform\nimport socket\nimport psutil\nfrom typing import Dict, Any\n\nclass SystemProfiler:\n    """Gathers system and network interface information."""\n    \n    @staticmethod\n    def get_profile() -> Dict[str, Any]:\n        profile = {\n            "os": platform.system(),\n            "os_release": platform.release(),\n            "architecture": platform.machine(),\n            "hostname": socket.gethostname(),\n            "interfaces": []\n        }\n        \n        # Gather network interfaces\n        addrs = psutil.net_if_addrs()\n        stats = psutil.net_if_stats()\n        \n        for interface_name, interface_addresses in addrs.items():\n            iface_info = {\n                "name": interface_name,\n                "is_up": stats[interface_name].isup if interface_name in stats else False,\n                "addresses": []\n            }\n            for addr in interface_addresses:\n                if addr.family == socket.AF_INET:\n                    iface_info["addresses"].append({"type": "IPv4", "address": addr.address})\n                elif addr.family == socket.AF_INET6:\n                    iface_info["addresses"].append({"type": "IPv6", "address": addr.address})\n                    \n            profile["interfaces"].append(iface_info)\n            \n        return profile',
          },
        ],
      },
      {
        name: "reporting",
        type: "folder",
        children: [
          {
            name: "engine.py",
            type: "file",
            content:
              'import json\nimport os\nfrom typing import Dict, Any\nfrom google import genai\nfrom google.genai import types\nfrom app.core.logger import logger\n\nclass ReportEngine:\n    """Generates JSON reports and uses Gemini for executive summaries."""\n    \n    def __init__(self, results: Dict[str, Any], output_dir: str = "outputs"):\n        self.results = results\n        self.output_dir = output_dir\n        os.makedirs(self.output_dir, exist_ok=True)\n\n    def save_json(self) -> str:\n        path = os.path.join(self.output_dir, "report.json")\n        with open(path, "w", encoding="utf-8") as f:\n            json.dump(self.results, f, indent=4)\n        logger.info(f"JSON report saved to {path}")\n        return path\n\n    def generate_executive_summary(self, api_key: str) -> str:\n        """Uses Gemini to analyze the network results and generate a summary."""\n        if not api_key:\n            logger.warning("No Gemini API Key provided. Skipping AI summary.")\n            return "No Gemini API Key provided."\n            \n        logger.info("Generating executive summary using Gemini AI...")\n        try:\n            client = genai.Client(api_key=api_key)\n            \n            # Truncate results to fit in context window if necessary\n            results_str = json.dumps(self.results)\n            if len(results_str) > 50000:\n                results_str = results_str[:50000] + "\\n... [TRUNCATED]"\n                \n            prompt = (\n                "You are a Senior Network Engineer. Analyze the following network benchmark "\n                "results (DNS, CDN, Endpoints) and provide a professional executive summary. "\n                "Include recommendations for the best DNS resolver, the best CDN target, "\n                "and overall network stability. Format the output in Markdown.\\n\\n"\n                f"Results:\\n{results_str}"\n            )\n            \n            response = client.models.generate_content(\n                model="gemini-3.1-pro-preview",\n                contents=prompt,\n                config=types.GenerateContentConfig(\n                    thinking_config=types.ThinkingConfig(thinking=True)\n                )\n            )\n            \n            summary_path = os.path.join(self.output_dir, "executive_summary.md")\n            with open(summary_path, "w", encoding="utf-8") as f:\n                f.write(response.text)\n                \n            logger.info(f"Executive summary saved to {summary_path}")\n            return response.text\n            \n        except Exception as e:\n            logger.error(f"Failed to generate AI summary: {e}")\n            return f"Error generating summary: {str(e)}"\n',
          },
        ],
      },
      {
        name: "utils",
        type: "folder",
        children: [
          {
            name: "network.py",
            type: "file",
            content:
              'import asyncio\nimport time\nfrom ping3 import ping\nfrom typing import Optional\n\nasync def async_ping(host: str, timeout: float = 2.0) -> Optional[float]:\n    """Asynchronously pings a host and returns latency in ms."""\n    loop = asyncio.get_running_loop()\n    try:\n        # ping3 is blocking, so we run it in an executor\n        delay = await loop.run_in_executor(None, ping, host, timeout)\n        if delay is None or delay is False:\n            return None\n        return delay * 1000  # Convert to ms\n    except Exception:\n        return None\n\nasync def tcp_ping(host: str, port: int, timeout: float = 2.0) -> Optional[float]:\n    """Measures TCP connection latency to a host:port."""\n    start_time = time.time()\n    try:\n        reader, writer = await asyncio.wait_for(\n            asyncio.open_connection(host, port),\n            timeout=timeout\n        )\n        writer.close()\n        await writer.wait_closed()\n        return (time.time() - start_time) * 1000\n    except Exception:\n        return None',
          },
        ],
      },
    ],
  },
  {
    name: "config",
    type: "folder",
    children: [
      {
        name: "config.yaml",
        type: "file",
        content:
          '# Connectivity Intelligence Suite Configuration\n\napp:\n  name: "Connectivity Intelligence Suite"\n  version: "1.0.0"\n  log_level: "INFO"\n\nnetwork:\n  ping_timeout_ms: 2000\n  tcp_timeout_ms: 2000\n  dns_timeout_ms: 3000\n  max_concurrent_tasks: 100\n\npaths:\n  inputs_dir: "inputs"\n  outputs_dir: "outputs"\n  logs_dir: "logs"\n\nprofiles:\n  - name: "No VPN"\n    description: "Direct connection baseline"\n  - name: "With VPN"\n    description: "Connection through primary VPN tunnel"',
      },
    ],
  },
  {
    name: "requirements.txt",
    type: "file",
    content:
      "PySide6>=6.6.0\nPyYAML>=6.0.1\ndnspython>=2.6.0\nping3>=4.0.8\ngoogle-genai>=0.5.0\naiohttp>=3.9.3",
  },
  {
    name: "README.md",
    type: "file",
    content:
      '# Connectivity Intelligence & Network Optimization Suite\n\nA highly professional, modular, scalable, and production-grade Desktop Application built with Python (PySide6) for Windows.\n\n## Features\n- **System & Network Profiler**: Captures OS, interfaces, and baseline metrics.\n- **Large-Scale DNS Benchmark**: Tests thousands of resolvers concurrently.\n- **CDN Target Evaluation**: Resolves and pings CDN targets to find the lowest latency.\n- **Reporting Engine**: Generates JSON reports and uses Gemini AI for an Executive Summary.\n\n## Prerequisites\n- Python 3.10+\n- Windows OS (Recommended)\n\n## Installation\n\n1. Create a virtual environment:\n   ```bash\n   python -m venv venv\n   venv\\Scripts\\activate\n   ```\n\n2. Install dependencies:\n   ```bash\n   pip install -r requirements.txt\n   ```\n\n3. Set your Gemini API Key (Optional, for AI reporting):\n   ```bash\n   set GEMINI_API_KEY=your_api_key_here\n   ```\n\n## Running the Application\n\n```bash\npython app/main.py\n```\n\n## Building the Executable (PyInstaller)\n\nTo build a standalone Windows executable:\n\n```bash\npyinstaller --noconfirm --onedir --windowed --add-data "config;config" --add-data "inputs;inputs" app/main.py\n```\n\nThe executable will be located in the `dist/main` folder.',
  },
];

const FileTreeNode: React.FC<{
  node: FileNode;
  level: number;
  onSelect: (node: FileNode) => void;
  selectedName: string;
}> = ({ node, level, onSelect, selectedName }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedName === node.name && node.type === "file";

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-800 text-sm ${isSelected ? "bg-gray-800 text-blue-400" : "text-gray-300"}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (node.type === "folder") setIsOpen(!isOpen);
          else onSelect(node);
        }}
      >
        {node.type === "folder" ? (
          <span className="mr-1">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="mr-1 w-[14px]" />
        )}
        {node.type === "folder" ? (
          <Folder size={14} className="mr-2 text-yellow-500" />
        ) : (
          <File size={14} className="mr-2 text-gray-400" />
        )}
        {node.name}
      </div>
      {node.type === "folder" && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <FileTreeNode
              key={idx}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedName={selectedName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileViewer() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(
    fileTree.find((f) => f.name === "README.md") || null,
  );

  return (
    <div className="flex h-full bg-[#1e1e1e] text-white overflow-hidden rounded-lg border border-gray-800">
      <div className="w-64 border-r border-gray-800 overflow-y-auto bg-[#252526] py-2">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Explorer
        </div>
        {fileTree.map((node, idx) => (
          <FileTreeNode
            key={idx}
            node={node}
            level={0}
            onSelect={setSelectedFile}
            selectedName={selectedFile?.name || ""}
          />
        ))}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedFile ? (
          <>
            <div className="h-10 border-b border-gray-800 flex items-center px-4 bg-[#2d2d2d] text-sm">
              <File size={14} className="mr-2 text-gray-400" />
              {selectedFile.name}
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#1e1e1e]">
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a file to view its contents
          </div>
        )}
      </div>
    </div>
  );
}
