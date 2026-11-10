import React, { useState } from 'react';
import { Server, Check, Copy, Play, Activity } from 'lucide-react';

export const ApiIntegrationGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [testKey, setTestKey] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTestEndpoint = async (endpoint: string, includeKey: boolean) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const headers: Record<string, string> = { accept: 'application/json' };
      if (includeKey && testKey.trim()) {
        headers['accountkey'] = testKey.trim();
      }
      const res = await fetch(endpoint, { headers });
      const data = await res.json();
      setTestResult({
        status: res.status,
        ok: res.ok,
        data,
      });
    } catch (err: any) {
      setTestResult({
        status: 'Error',
        ok: false,
        data: { message: err?.message || 'Failed to connect to local API route' },
      });
    } finally {
      setIsTesting(false);
    }
  };

  const codeSnippets = [
    {
      title: '1. Serverless Endpoint: /api/carparkavailability.ts',
      description: 'Pulls live lots (HDB + LTA + URA) from LTA DataMall CarParkAvailabilityv2 with AccountKey header:',
      code: `// GET /api/carparkavailability
// Automatically injects process.env.LTA_DATAMALL_KEY into AccountKey header:
curl -X GET "https://your-domain.com/api/carparkavailability"

// Or test with a custom header directly:
curl -X GET "https://your-domain.com/api/carparkavailability" \\
  -H "AccountKey: YOUR_LTA_DATAMALL_KEY"`,
    },
    {
      title: '2. Serverless Health Check: /api/health.ts',
      description: 'Returns serverless runtime status and verifies if LTA_DATAMALL_KEY is configured:',
      code: `curl -X GET "https://your-domain.com/api/health"

// Response:
{
  "status": "ok",
  "timestamp": "2026-11-10T04:00:00.000Z",
  "uptimeSeconds": 142,
  "environment": {
    "ltaKeyConfigured": true,
    "nodeEnv": "development"
  },
  "endpoints": {
    "carparkAvailability": "/api/carparkavailability",
    "health": "/api/health"
  }
}`,
    },
    {
      title: '3. Environment Variable Configuration',
      description: 'Add this to your environment / .env file without committing secrets to git:',
      code: `# .env file or Cloud Environment Secret:
LTA_DATAMALL_KEY="YOUR_OFFICIAL_ACCOUNT_KEY"

# Free key registration:
# https://datamall.lta.gov.sg/content/datamall/en/request-api.html`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <Server className="w-4 h-4" />
          <span>Serverless Architecture</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
          LTA DataMall Serverless Connection
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your project includes root-level serverless functions in <code className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">/api/health.ts</code> and <code className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">/api/carparkavailability.ts</code>.
        </p>
      </div>

      {/* Interactive Endpoint Tester */}
      <div className="mb-8 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Interactive Endpoint Tester</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Live in-app test</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Test the serverless routes right now. You can test <code className="font-mono text-slate-700 dark:text-slate-300">/api/health</code>, test <code className="font-mono text-slate-700 dark:text-slate-300">/api/carparkavailability</code> without a key (returns expected missing-key response), or paste an AccountKey to test live LTA pulls.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
          <input
            type="text"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            placeholder="Optional: Paste AccountKey to test live (not saved)..."
            className="flex-1 py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestEndpoint('/api/health', false)}
              disabled={isTesting}
              className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Test /api/health
            </button>
            <button
              onClick={() => handleTestEndpoint('/api/carparkavailability', true)}
              disabled={isTesting}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Play className="w-3 h-3" />
              <span>Test /api/carparkavailability</span>
            </button>
          </div>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className="mt-3 p-3.5 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px]">
              <span className="text-slate-400">Response Code:</span>
              <span
                className={`font-bold ${
                  testResult.ok ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {testResult.status} {testResult.ok ? 'OK' : 'Notice / Auth Required'}
              </span>
            </div>
            <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Code Snippets */}
      <div className="space-y-6">
        {codeSnippets.map((snippet, idx) => (
          <div
            key={snippet.title}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {snippet.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {snippet.description}
                </p>
              </div>

              <button
                onClick={() => handleCopy(snippet.code, idx)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{snippet.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
