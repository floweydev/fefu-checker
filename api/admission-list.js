const https = require('https');

const UPSTREAM_HOST = 'www.dvfu.ru';
const UPSTREAM_PATH = '/admission/spd/api/admission-list';
const TIMEOUT_MS = 25000;

function fetchUpstream(queryString) {
  return new Promise((resolve, reject) => {
    const target = `https://${UPSTREAM_HOST}${UPSTREAM_PATH}${queryString ? '?' + queryString : ''}`;
    const attempt = (isRetry) => {
      const req = https.get(target, {
        family: 4,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      }, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
      });
      req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('timeout')));
      req.on('error', (err) => {
        if (!isRetry) {
          attempt(true);
        } else {
          reject(err);
        }
      });
    };
    attempt(false);
  });
}

module.exports = async function handler(req, res) {
  try {
    const queryString = (req.url || '').split('?')[1] || '';
    const upstream = await fetchUpstream(queryString);
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(upstream.body);
  } catch (err) {
    res.status(502).json({ error: 'Не удалось получить данные с API ДВФУ: ' + err.message });
  }
};

module.exports.config = { maxDuration: 60 };
