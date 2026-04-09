/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import FileViewer from "./components/FileViewer";
import Chatbot from "./components/Chatbot";
import { Download, Terminal } from "lucide-react";

export default function App() {
  const handleDownload = () => {
    alert(
      "برای دانلود پروژه:\n\n" +
      "۱. به بالای همین صفحه (خارج از این کادر سفید) نگاه کنید.\n" +
      "۲. روی آیکون چرخ‌دنده (Settings) کلیک کنید.\n" +
      "۳. گزینه 'Export' و سپس 'Download as ZIP' را انتخاب کنید.\n\n" +
      "این روش کل فایل‌های پایتون را برای شما دانلود می‌کند."
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Terminal className="text-blue-600" />
            Connectivity Intelligence Suite
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Python Desktop Application Generator
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            onClick={handleDownload}
          >
            <Download size={16} />
            راهنمای دانلود پروژه
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-800">
              Generated Python Source Code
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Explore the PySide6 application files generated in the workspace.
            </p>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            <FileViewer />
          </div>
        </div>

        <div className="w-[400px] shrink-0 flex flex-col">
          <Chatbot />
        </div>
      </main>
    </div>
  );
}
