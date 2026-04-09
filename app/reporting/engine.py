import json
import os
from typing import Dict, Any
from google import genai
from google.genai import types
from app.core.logger import logger

class ReportEngine:
    """Generates JSON reports and uses Gemini for executive summaries."""
    
    def __init__(self, results: Dict[str, Any], output_dir: str = "outputs"):
        self.results = results
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def save_json(self) -> str:
        path = os.path.join(self.output_dir, "report.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.results, f, indent=4)
        logger.info(f"JSON report saved to {path}")
        return path

    def generate_executive_summary(self, api_key: str) -> str:
        """Uses Gemini to analyze the network results and generate a summary."""
        if not api_key:
            logger.warning("No Gemini API Key provided. Skipping AI summary.")
            return "No Gemini API Key provided."
            
        logger.info("Generating executive summary using Gemini AI...")
        try:
            client = genai.Client(api_key=api_key)
            
            # Truncate results to fit in context window if necessary
            results_str = json.dumps(self.results)
            if len(results_str) > 50000:
                results_str = results_str[:50000] + "\n... [TRUNCATED]"
                
            prompt = (
                "You are a Senior Network Engineer. Analyze the following network benchmark "
                "results (DNS, CDN, Endpoints) and provide a professional executive summary. "
                "Include recommendations for the best DNS resolver, the best CDN target, "
                "and overall network stability. Format the output in Markdown.\n\n"
                f"Results:\n{results_str}"
            )
            
            response = client.models.generate_content(
                model='gemini-3.1-pro-preview',
                contents=prompt,
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking=True)
                )
            )
            
            summary_path = os.path.join(self.output_dir, "executive_summary.md")
            with open(summary_path, "w", encoding="utf-8") as f:
                f.write(response.text)
                
            logger.info(f"Executive summary saved to {summary_path}")
            return response.text
            
        except Exception as e:
            logger.error(f"Failed to generate AI summary: {e}")
            return f"Error generating summary: {str(e)}"
