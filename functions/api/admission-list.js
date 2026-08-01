export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    const upstream = 'https://www.dvfu.ru/admission/spd/api/admission-list' + url.search;
    const resp = await fetch(upstream, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      },
      signal: AbortSignal.timeout(25000)
    });
    const body = await resp.arrayBuffer();
    return new Response(body, {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Не удалось получить данные с API ДВФУ: ' + err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
