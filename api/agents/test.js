export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Test endpoint working',
    method: req.method,
    env: {
      hasGoogleKey: !!process.env.GOOGLE_AI_API_KEY,
      keys: Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('AI'))
    }
  }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}