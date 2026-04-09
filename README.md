# Connectivity Intelligence & Network Optimization Suite

A highly professional, modular, scalable, and production-grade Desktop Application built with Python (PySide6) for Windows.

## Features
- **System & Network Profiler**: Captures OS, interfaces, and baseline metrics.
- **Large-Scale DNS Benchmark**: Tests thousands of resolvers concurrently.
- **CDN Target Evaluation**: Resolves and pings CDN targets to find the lowest latency.
- **Reporting Engine**: Generates JSON reports and uses Gemini AI for an Executive Summary.

## Prerequisites
- Python 3.10+
- Windows OS (Recommended)

## Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set your Gemini API Key (Optional, for AI reporting):
   ```bash
   set GEMINI_API_KEY=your_api_key_here
   ```

## Running the Application

```bash
python app/main.py
```

## Building the Executable (PyInstaller)

To build a standalone Windows executable:

```bash
pyinstaller --noconfirm --onedir --windowed --add-data "config;config" --add-data "inputs;inputs" app/main.py
```

The executable will be located in the `dist/main` folder.
