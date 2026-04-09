import sys
import asyncio
import os
from PySide6.QtWidgets import (QMainWindow, QVBoxLayout, QWidget, QPushButton, 
                               QTextEdit, QProgressBar, QLabel, QHBoxLayout)
from PySide6.QtCore import QThread, Signal

from app.core.config import ConfigManager
from app.modules.profiler import SystemProfiler
from app.modules.dns_bench import DNSBenchmark
from app.modules.cdn_eval import CDNEvaluator
from app.reporting.engine import ReportEngine

class WorkerThread(QThread):
    log_msg = Signal(str)
    progress = Signal(int)
    finished_task = Signal(dict)

    def __init__(self, config):
        super().__init__()
        self.config = config

    def run(self):
        asyncio.run(self.run_async_tasks())

    async def run_async_tasks(self):
        self.log_msg.emit("Starting Connectivity Intelligence Suite...")
        self.progress.emit(10)
        
        # 1. System Profile
        self.log_msg.emit("Gathering System Profile...")
        profile = SystemProfiler.get_profile()
        self.progress.emit(20)
        
        # Load inputs
        try:
            with open("inputs/dns_resolvers.txt", "r") as f:
                resolvers = [line.strip() for line in f if line.strip()]
            with open("inputs/cdn_targets.txt", "r") as f:
                cdns = [line.strip() for line in f if line.strip()]
        except Exception as e:
            self.log_msg.emit(f"Error loading inputs: {e}")
            return

        # 2. DNS Benchmark
        self.log_msg.emit(f"Benchmarking {len(resolvers)} DNS resolvers...")
        dns_bench = DNSBenchmark(resolvers, ["google.com", "cloudflare.com"])
        dns_results = await dns_bench.run_benchmark()
        self.progress.emit(50)
        
        # 3. CDN Evaluation
        self.log_msg.emit(f"Evaluating {len(cdns)} CDN targets...")
        cdn_eval = CDNEvaluator(cdns)
        cdn_results = await cdn_eval.evaluate()
        self.progress.emit(80)
        
        results = {
            "system_profile": profile,
            "dns_benchmark": dns_results,
            "cdn_evaluation": cdn_results
        }
        
        # 4. Reporting
        self.log_msg.emit("Generating Reports...")
        engine = ReportEngine(results)
        engine.save_json()
        
        # Optional: Generate AI Summary if API key is present in env
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            self.log_msg.emit("Generating AI Executive Summary...")
            engine.generate_executive_summary(api_key)
            
        self.progress.emit(100)
        self.log_msg.emit("All tasks completed successfully. Check 'outputs' folder.")
        self.finished_task.emit(results)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Connectivity Intelligence Suite")
        self.resize(800, 600)
        
        self.config = ConfigManager()
        
        # UI Setup
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        
        self.title_label = QLabel("Network Optimization & Profiling")
        self.title_label.setStyleSheet("font-size: 18px; font-weight: bold;")
        layout.addWidget(self.title_label)
        
        self.log_output = QTextEdit()
        self.log_output.setReadOnly(True)
        layout.addWidget(self.log_output)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        layout.addWidget(self.progress_bar)
        
        btn_layout = QHBoxLayout()
        self.start_btn = QPushButton("Start Analysis")
        self.start_btn.clicked.connect(self.start_analysis)
        btn_layout.addWidget(self.start_btn)
        
        layout.addLayout(btn_layout)
        
    def log(self, message: str):
        self.log_output.append(message)
        
    def start_analysis(self):
        self.start_btn.setEnabled(False)
        self.progress_bar.setValue(0)
        self.log_output.clear()
        
        self.worker = WorkerThread(self.config)
        self.worker.log_msg.connect(self.log)
        self.worker.progress.connect(self.progress_bar.setValue)
        self.worker.finished_task.connect(self.on_finished)
        self.worker.start()
        
    def on_finished(self, results):
        self.start_btn.setEnabled(True)
