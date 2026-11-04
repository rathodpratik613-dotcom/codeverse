'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Code2, Play, RotateCcw, Settings } from 'lucide-react';
import Editor from '@monaco-editor/react';

export default function PlaygroundPage() {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, World!");');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      if (language === 'javascript') {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));

        try {
          const result = eval(code);
          console.log = originalLog;
          setOutput(logs.join('\n') || (result !== undefined ? String(result) : 'Code executed successfully'));
        } catch (error) {
          console.log = originalLog;
          setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        setOutput(`${language} execution is not yet implemented. JavaScript is fully supported.`);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    setIsRunning(false);
  };

  const handleReset = () => {
    setCode('// Write your code here\nconsole.log("Hello, World!");');
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            CODEVERSE
          </span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Code Playground</h1>
          <p className="text-gray-400">Write and execute code in your browser</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python (Coming Soon)</option>
                    <option value="java">Java (Coming Soon)</option>
                  </select>
                  <span className="text-gray-400 text-sm">main.{language === 'python' ? 'py' : 'js'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Reset Code"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                </div>
              </div>

              <div className="h-[500px]">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <span className="text-gray-400 text-sm">Output</span>
              </div>
              <div className="p-4 min-h-[200px] max-h-[400px] overflow-auto">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                  {output || 'Click "Run" to execute your code'}
                </pre>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Editor Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Font Size</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                    <option>12px</option>
                    <option selected>14px</option>
                    <option>16px</option>
                    <option>18px</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Theme</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                    <option selected>Dark</option>
                    <option>Light</option>
                    <option>High Contrast</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Run Code</span>
                  <span className="text-white">Ctrl + Enter</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Save</span>
                  <span className="text-white">Ctrl + S</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Format</span>
                  <span className="text-white">Shift + Alt + F</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Code Snippets</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-white/5 rounded text-gray-300 text-sm hover:bg-white/10 transition-colors">
                  Hello World
                </button>
                <button className="w-full text-left px-3 py-2 bg-white/5 rounded text-gray-300 text-sm hover:bg-white/10 transition-colors">
                  For Loop
                </button>
                <button className="w-full text-left px-3 py-2 bg-white/5 rounded text-gray-300 text-sm hover:bg-white/10 transition-colors">
                  Function
                </button>
                <button className="w-full text-left px-3 py-2 bg-white/5 rounded text-gray-300 text-sm hover:bg-white/10 transition-colors">
                  Array Methods
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
