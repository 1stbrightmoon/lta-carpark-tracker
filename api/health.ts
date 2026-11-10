import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: {
    ltaKeyConfigured: boolean;
    nodeEnv: string;
  };
  endpoints: {
    carparkAvailability: string;
    health: string;
  };
}

/**
 * Serverless handler for /api/health
 * Checks service health and reports whether the LTA DataMall AccountKey is configured.
 */
export default async function handler(req: any, res: any) {
  const ltaKey =
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY;

  const data: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: {
      ltaKeyConfigured: Boolean(ltaKey && ltaKey.trim().length > 0),
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    endpoints: {
      carparkAvailability: '/api/carparkavailability',
      health: '/api/health',
    },
  };

  // Support standard Express (res.status().json())
  if (typeof res?.status === 'function') {
    return res.status(200).json(data);
  }

  // Fallback for Web API standard Response
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
