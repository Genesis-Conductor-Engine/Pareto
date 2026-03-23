/**
 * pareto-audit — Cloudflare Worker
 *
 * Single-file deployment serving:
 * - HTML frontend (GET /)
 * - API proxy to Anthropic (POST /api/audit)
 * - Rate limiting via KV (3 audits/day/IP for free tier)
 *
 * Part of the Genesis Conductor optimization skills ecosystem.
 */

const PCE_SYSTEM_PROMPT = `You are the Pareto Cognitive Engine (PCE), an AI reasoning system that applies 80/20 analysis to any domain.

Your task is to identify the vital 20% of inputs driving 80% of outputs. You operate in five reasoning modes:
1. Reflective — Examine assumptions embedded in the input
2. Unconventional — Invert standard optimization logic
3. Non-linear — Identify compounding effects and second-order consequences
4. Strategic — Evaluate timing and sequencing of actions
5. Hedonistic — Consider sustainable effort allocation and energy management

OUTPUT FORMAT (strict JSON):
{
  "summary": "One sentence capturing the core insight",
  "vital_20": [
    {"activity": "string", "contribution_pct": number, "insight": "Why this matters disproportionately"}
  ],
  "trivial_80": [
    {"activity": "string", "contribution_pct": number, "prune_reason": "Specific reason to stop or defer"}
  ],
  "unconventional_reframes": [
    {"conventional_assumption": "string", "pareto_reframe": "Inverted 80/20 perspective"}
  ],
  "action_matrix": [
    {"rank": number, "action": "Specific step", "expected_impact": "high|medium|low", "effort": "high|medium|low"}
  ],
  "recursive_note": "When and why to re-run this audit"
}

RULES:
- vital_20 should contain 2-4 activities that sum to roughly 80% of output contribution
- trivial_80 contains the remaining activities
- action_matrix must have exactly 5 ranked actions
- First action must be achievable within 24 hours
- Be specific, not generic. Reference the actual inputs provided.
- contribution_pct values should sum to 100 across all activities`;

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pareto Audit — 80/20 Workflow Analysis</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --surface: #141414;
      --border: #2a2a2a;
      --text: #e5e5e5;
      --muted: #888;
      --accent: #3b82f6;
      --vital: #22c55e;
      --trivial: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .subtitle { color: var(--muted); margin-bottom: 2rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    input, textarea, select {
      width: 100%;
      padding: 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 1rem;
    }
    textarea { min-height: 120px; resize: vertical; }
    button {
      background: var(--accent);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
    }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .result { margin-top: 2rem; }
    .section {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border: 1px solid var(--border);
    }
    .section h3 { margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .vital { border-left: 3px solid var(--vital); }
    .trivial { border-left: 3px solid var(--trivial); }
    .item { padding: 1rem 0; border-bottom: 1px solid var(--border); }
    .item:last-child { border-bottom: none; }
    .pct {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .pct-vital { background: rgba(34, 197, 94, 0.2); color: var(--vital); }
    .pct-trivial { background: rgba(239, 68, 68, 0.2); color: var(--trivial); }
    .action-item { display: flex; gap: 1rem; align-items: flex-start; }
    .rank {
      background: var(--accent);
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }
    .tags { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .tag {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      background: var(--border);
      border-radius: 4px;
    }
    .loading { text-align: center; padding: 2rem; }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--trivial); padding: 1rem; border-radius: 8px; }
    .rate-info { font-size: 0.875rem; color: var(--muted); margin-top: 1rem; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Pareto Audit</h1>
    <p class="subtitle">Identify the 20% of inputs driving 80% of your outputs</p>

    <form id="auditForm">
      <div class="form-group">
        <label for="domain">Domain</label>
        <select id="domain" required>
          <option value="">Select domain...</option>
          <option value="startup">Startup</option>
          <option value="engineering">Engineering</option>
          <option value="product">Product</option>
          <option value="marketing">Marketing</option>
          <option value="career">Career</option>
          <option value="workflow">General Workflow</option>
        </select>
      </div>

      <div class="form-group">
        <label for="goal">Goal</label>
        <input type="text" id="goal" placeholder="e.g., Reach $10K MRR in 90 days" required>
      </div>

      <div class="form-group">
        <label for="activities">Activities (one per line)</label>
        <textarea id="activities" placeholder="Cold email outreach&#10;Customer discovery calls&#10;Building new features&#10;Writing content..." required></textarea>
      </div>

      <div class="form-group">
        <label for="outputs">Current Outputs (optional)</label>
        <input type="text" id="outputs" placeholder="e.g., 3 customers, $450 MRR, 12 demo calls">
      </div>

      <button type="submit" id="submitBtn">Run Pareto Audit</button>
      <p class="rate-info">3 free audits per day</p>
    </form>

    <div id="result" class="result"></div>
  </div>

  <script>
    const form = document.getElementById('auditForm');
    const resultDiv = document.getElementById('result');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const activities = document.getElementById('activities').value
        .split('\\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      if (activities.length < 3) {
        resultDiv.innerHTML = '<div class="error">Please enter at least 3 activities.</div>';
        return;
      }

      const payload = {
        domain: document.getElementById('domain').value,
        goal: document.getElementById('goal').value,
        activities,
        outputs: document.getElementById('outputs').value || undefined
      };

      submitBtn.disabled = true;
      resultDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Analyzing your workflow...</p></div>';

      try {
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Audit failed');
        }

        const data = await res.json();
        renderResult(data);
      } catch (err) {
        resultDiv.innerHTML = '<div class="error">' + err.message + '</div>';
      } finally {
        submitBtn.disabled = false;
      }
    });

    function renderResult(data) {
      let html = '';

      // Summary
      html += '<div class="section"><h3>Summary</h3><p>' + data.summary + '</p></div>';

      // Vital 20%
      html += '<div class="section vital"><h3><span style="color:var(--vital)">&#9679;</span> Vital 20%</h3>';
      for (const item of data.vital_20) {
        html += '<div class="item">';
        html += '<strong>' + item.activity + '</strong> ';
        html += '<span class="pct pct-vital">' + item.contribution_pct + '%</span>';
        html += '<p style="margin-top:0.5rem;color:var(--muted)">' + item.insight + '</p>';
        html += '</div>';
      }
      html += '</div>';

      // Trivial 80%
      html += '<div class="section trivial"><h3><span style="color:var(--trivial)">&#9679;</span> Trivial 80%</h3>';
      for (const item of data.trivial_80) {
        html += '<div class="item">';
        html += '<strong>' + item.activity + '</strong> ';
        html += '<span class="pct pct-trivial">' + item.contribution_pct + '%</span>';
        html += '<p style="margin-top:0.5rem;color:var(--muted)">' + item.prune_reason + '</p>';
        html += '</div>';
      }
      html += '</div>';

      // Unconventional Reframes
      html += '<div class="section"><h3>Unconventional Reframes</h3>';
      for (const item of data.unconventional_reframes) {
        html += '<div class="item">';
        html += '<p style="color:var(--muted);text-decoration:line-through">' + item.conventional_assumption + '</p>';
        html += '<p style="margin-top:0.5rem">' + item.pareto_reframe + '</p>';
        html += '</div>';
      }
      html += '</div>';

      // Action Matrix
      html += '<div class="section"><h3>Action Matrix</h3>';
      for (const item of data.action_matrix) {
        html += '<div class="item action-item">';
        html += '<span class="rank">' + item.rank + '</span>';
        html += '<div>';
        html += '<p>' + item.action + '</p>';
        html += '<div class="tags">';
        html += '<span class="tag">Impact: ' + item.expected_impact + '</span>';
        html += '<span class="tag">Effort: ' + item.effort + '</span>';
        html += '</div></div></div>';
      }
      html += '</div>';

      // Recursive Note
      html += '<div class="section"><h3>Next Audit</h3><p>' + data.recursive_note + '</p></div>';

      resultDiv.innerHTML = html;
    }
  </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve HTML frontend
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(HTML_TEMPLATE, {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', skill: 'pareto-audit', version: '1.0.0' }, { headers: corsHeaders });
    }

    // API endpoint
    if (url.pathname === '/api/audit' && request.method === 'POST') {
      try {
        // Rate limiting
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const rateLimitKey = `rate:${clientIP}:${new Date().toISOString().slice(0, 10)}`;

        if (env.RATE_LIMIT_KV) {
          const count = parseInt(await env.RATE_LIMIT_KV.get(rateLimitKey) || '0');
          if (count >= 3) {
            return Response.json(
              { error: 'Rate limit exceeded. Upgrade to Pro for unlimited audits.' },
              { status: 429, headers: corsHeaders }
            );
          }
          await env.RATE_LIMIT_KV.put(rateLimitKey, String(count + 1), { expirationTtl: 86400 });
        }

        const body = await request.json();

        // Validate input
        if (!body.domain || !body.goal || !body.activities || body.activities.length < 3) {
          return Response.json(
            { error: 'Invalid input. Required: domain, goal, activities (min 3)' },
            { status: 400, headers: corsHeaders }
          );
        }

        // Build prompt
        const userPrompt = `DOMAIN: ${body.domain}
GOAL: ${body.goal}
ACTIVITIES:
${body.activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}
${body.outputs ? `\nCURRENT OUTPUTS: ${body.outputs}` : ''}

Analyze this using 80/20 Pareto principles. Return ONLY valid JSON matching the specified schema.`;

        // Call Anthropic API
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: PCE_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        });

        if (!anthropicRes.ok) {
          const err = await anthropicRes.text();
          console.error('Anthropic API error:', err);
          return Response.json(
            { error: 'Analysis failed. Please try again.' },
            { status: 500, headers: corsHeaders }
          );
        }

        const anthropicData = await anthropicRes.json();
        const content = anthropicData.content[0].text;

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return Response.json(
            { error: 'Failed to parse analysis result.' },
            { status: 500, headers: corsHeaders }
          );
        }

        const result = JSON.parse(jsonMatch[0]);
        return Response.json(result, { headers: corsHeaders });

      } catch (err) {
        console.error('Audit error:', err);
        return Response.json(
          { error: 'Internal error. Please try again.' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};
