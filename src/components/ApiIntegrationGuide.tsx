import React, { useState } from 'react';
import { Server, Check, Copy } from 'lucide-react';

export const ApiIntegrationGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    {
      title: '1. Official Singapore Data Sources',
      description: 'The real-time availability feeds provided by the Singapore Government:',
      code: `# 1. Real-Time Availability Feed (Updated every 1-2 mins)
GET https://api.data.gov.sg/v1/transport/carpark-availability

# 2. HDB Carpark Location & Metadata (Static details & coordinates)
GET https://data.gov.sg/api/action/datastore_search?resource_id=139a30e7-3b7c-48e0-ac51-78c9359e358b

# 3. LTA DataMall Carpark Availability
GET https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
Headers: { "AccountKey": "<YOUR_LTA_KEY>" }`,
    },
    {
      title: '2. Node.js / Express Proxy Route Example',
      description: 'You can add this endpoint directly to your backend / Express server:',
      code: `import express from 'express';
const router = express.Router();

// Proxy live Singapore lot availability to avoid CORS
router.get('/api/carparks/availability', async (req, res) => {
  try {
    const response = await fetch('https://api.data.gov.sg/v1/transport/carpark-availability');
    const data = await response.json();
    
    // Each item contains carpark_number and lot_data
    // e.g. { carpark_number: "ACB", lot_data: [{ lot_type: "C", lots_available: "118", total_lots: "320" }] }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live Singapore carpark data' });
  }
});

export default router;`,
    },
    {
      title: '3. Connecting carparkService.ts to Your Backend',
      description: 'In src/services/carparkService.ts, switch the data loader method:',
      code: `// Inside CarparkService class:
public async fetchCarparks(): Promise<Carpark[]> {
  try {
    const response = await fetch('/api/carparks/availability');
    if (!response.ok) throw new Error('Network error');
    const liveData = await response.json();

    // Map your live API schema into the frontend Carpark interface:
    return this.mapLiveApiToCarpark(liveData);
  } catch (err) {
    console.warn('Backend unavailable, fallback to cached store:', err);
    return [...this.carparks];
  }
}`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <Server className="w-4 h-4" />
          <span>Developer Integration Spec</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Singapore Carpark Backend Connection Guide
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Everything is modularly structured so you can seamlessly plug in your Node/Express, Python, or Go backend service when ready.
        </p>
      </div>

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
