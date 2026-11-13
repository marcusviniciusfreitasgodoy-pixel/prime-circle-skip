// ga4-daily-sync: puxa os números do GA4 do dia anterior e grava em ga4.daily_snapshot.
// Autenticação: header x-cron-secret precisa bater com o segredo 'ga4_cron_secret' do Vault.
// Credencial do Google: secret de ambiente GA4_SERVICE_ACCOUNT_JSON (conteúdo completo do JSON da conta de serviço).
// ID da propriedade: tabela ga4.config (key='property_id') ou env GA4_PROPERTY_ID.
// Backfill manual: POST com body {"date":"AAAA-MM-DD"}.
import postgres from "npm:postgres@3.4.4";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 1 });

const enc = new TextEncoder();
function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function pemToDer(pem: string): Uint8Array {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function getAccessToken(sa: { client_email: string; private_key: string; token_uri?: string }) {
  const tokenUri = sa.token_uri ?? "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  };
  const unsigned = b64url(enc.encode(JSON.stringify(header))) + "." + b64url(enc.encode(JSON.stringify(claims)));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(unsigned)));
  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: unsigned + "." + b64url(sig),
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error("Token Google falhou: " + JSON.stringify(j));
  return j.access_token as string;
}

function addDays(d: string, n: number): string {
  const t = new Date(d + "T12:00:00Z");
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}
function yesterdaySaoPaulo(): string {
  // Brasil sem horário de verão desde 2019: UTC-3 fixo
  const now = new Date(Date.now() - 3 * 3600 * 1000);
  now.setUTCDate(now.getUTCDate() - 1);
  return now.toISOString().slice(0, 10);
}

// deno-lint-ignore no-explicit-any
function parse(report: any) {
  const dims = (report.dimensionHeaders ?? []).map((h: any) => h.name);
  const mets = (report.metricHeaders ?? []).map((h: any) => h.name);
  return (report.rows ?? []).map((r: any) => {
    const o: Record<string, string | number> = {};
    dims.forEach((n: string, i: number) => (o[n] = r.dimensionValues[i].value));
    mets.forEach((n: string, i: number) => {
      const v = Number(r.metricValues[i].value);
      o[n] = Number.isInteger(v) ? v : Math.round(v * 1000) / 1000;
    });
    return o;
  });
}

async function log(ok: boolean, message: string) {
  try { await sql`insert into ga4.sync_log (ok, message) values (${ok}, ${message.slice(0, 2000)})`; } catch (_) { /* ignore */ }
}

Deno.serve(async (req) => {
  try {
    const [{ secret }] = await sql`select decrypted_secret as secret from vault.decrypted_secrets where name = 'ga4_cron_secret'`;
    if (!secret || req.headers.get("x-cron-secret") !== secret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }

    const saRaw = Deno.env.get("GA4_SERVICE_ACCOUNT_JSON");
    if (!saRaw) throw new Error("Secret GA4_SERVICE_ACCOUNT_JSON não configurado");
    const sa = JSON.parse(saRaw);

    const cfg = await sql`select value from ga4.config where key = 'property_id'`;
    const propertyId = (cfg[0]?.value ?? Deno.env.get("GA4_PROPERTY_ID") ?? "").trim();
    if (!/^\d+$/.test(propertyId)) throw new Error("property_id ausente ou inválido em ga4.config");

    let body: { date?: string } = {};
    try { body = await req.json(); } catch (_) { /* sem body */ }
    const D = body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : yesterdaySaoPaulo();

    const dia = { startDate: D, endDate: D, name: "dia" };
    const s7 = { startDate: addDays(D, -6), endDate: D, name: "ult_7d" };
    const p7 = { startDate: addDays(D, -13), endDate: addDays(D, -7), name: "7d_anteriores" };

    const requests = [
      { // totais
        dateRanges: [dia, s7, p7],
        metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews", "engagementRate", "averageSessionDuration", "keyEvents"].map((name) => ({ name })),
      },
      { // canais
        dateRanges: [dia, s7],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "keyEvents" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 30,
      },
      { // páginas
        dateRanges: [dia, s7],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 30,
      },
      { // todos os eventos (inclui contact_agent e explore_properties mesmo antes de virarem evento principal)
        dateRanges: [dia, s7],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }, { name: "keyEvents" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 50,
      },
      { // origem / mídia
        dateRanges: [dia, s7],
        dimensions: [{ name: "sessionSourceMedium" }],
        metrics: [{ name: "sessions" }, { name: "keyEvents" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 30,
      },
    ];

    const token = await getAccessToken(sa);
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ requests }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error("GA4 Data API falhou: " + JSON.stringify(j));

    const [totais, canais, paginas, eventos, origens] = j.reports.map(parse);
    const data = {
      data_referencia: D,
      periodos: { dia, ult_7d: s7, "7d_anteriores": p7 },
      totais, canais, paginas, eventos, origem_midia: origens,
    };

    await sql`
      insert into ga4.daily_snapshot (report_date, property_id, data, fetched_at)
      values (${D}, ${propertyId}, ${sql.json(data)}, now())
      on conflict (report_date) do update set property_id = excluded.property_id, data = excluded.data, fetched_at = now()`;
    await log(true, `ok ${D}`);
    return new Response(JSON.stringify({ ok: true, date: D }), { headers: { "content-type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await log(false, msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
