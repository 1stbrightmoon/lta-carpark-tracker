const LTA_DATAMALL_ENDPOINT =
  'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LtaCarparkRaw {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // e.g. "1.29375 103.85718" (lat lon)
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y'; // C: Car, H: Heavy, Y: Motorcycle
  Agency: 'HDB' | 'LTA' | 'URA';
}

export interface LtaApiResponse {
  'odata.metadata'?: string;
  value: LtaCarparkRaw[];
}

/**
 * Serverless handler for /api/carparkavailability
 * Connects directly to Singapore LTA DataMall CarParkAvailabilityv2 endpoint
 * Header required: AccountKey
 */
export default async function handler(req: any, res: any) {
  // Extract AccountKey from environment variables or incoming request headers
  const accountKey =
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    (typeof req.headers?.get === 'function'
      ? req.headers.get('accountkey') || req.headers.get('x-account-key')
      : req.headers?.['accountkey'] || req.headers?.['x-account-key']);

  // If no API key is provided, return informative instruction
  if (!accountKey || typeof accountKey !== 'string' || accountKey.trim().length === 0) {
    const errorPayload = {
      error: 'LTA_DATAMALL_KEY_MISSING',
      message:
        'LTA DataMall AccountKey is not configured. Please set the LTA_DATAMALL_KEY environment variable or pass an AccountKey header.',
      endpoint: LTA_DATAMALL_ENDPOINT,
      instructions: [
        '1. Obtain a free key from LTA DataMall (https://datamall.lta.gov.sg/content/datamall/en/request-api.html)',
        '2. Set LTA_DATAMALL_KEY="YOUR_KEY_HERE" in your environment or Secrets',
        '3. Alternatively, supply header "AccountKey: YOUR_KEY" in the request',
      ],
    };

    if (typeof res?.status === 'function') {
      return res.status(401).json(errorPayload);
    }
    return new Response(JSON.stringify(errorPayload), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Check if client requested pagination skip
    const urlObj = new URL(req.url || '', 'http://localhost');
    const skip = urlObj.searchParams.get('$skip') || urlObj.searchParams.get('skip') || '';
    const targetUrl = skip
      ? `${LTA_DATAMALL_ENDPOINT}?$skip=${encodeURIComponent(skip)}`
      : LTA_DATAMALL_ENDPOINT;

    // Call official LTA DataMall endpoint
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      const statusPayload = {
        error: 'LTA_UPSTREAM_ERROR',
        status: response.status,
        statusText: response.statusText,
        details: errText,
      };

      if (typeof res?.status === 'function') {
        return res.status(response.status).json(statusPayload);
      }
      return new Response(JSON.stringify(statusPayload), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: LtaApiResponse = await response.json();

    const responsePayload = {
      status: 'success',
      source: 'LTA DataMall CarParkAvailabilityv2',
      timestamp: new Date().toISOString(),
      totalLotsTracked: data.value ? data.value.length : 0,
      value: data.value || [],
    };

    // Cache header for 60 seconds (LTA DataMall refresh cadence is 1-2 mins)
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
      'Access-Control-Allow-Origin': '*',
    };

    if (typeof res?.status === 'function') {
      res.setHeader('Cache-Control', headers['Cache-Control']);
      res.setHeader('Access-Control-Allow-Origin', headers['Access-Control-Allow-Origin']);
      return res.status(200).json(responsePayload);
    }

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    const errorPayload = {
      error: 'SERVERLESS_PROXY_FAILED',
      message: err?.message || 'Failed to connect to LTA DataMall',
    };

    if (typeof res?.status === 'function') {
      return res.status(502).json(errorPayload);
    }
    return new Response(JSON.stringify(errorPayload), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
