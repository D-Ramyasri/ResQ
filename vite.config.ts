import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

import siteConfiguration from './.figma/make/site.json'

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === 'development'

  return {
    base: process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/',
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
      figmaSiteConfiguration(siteConfiguration),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: '/src/**/*.stories.{ts,tsx,js,jsx}' }),
      featherlessServerProxy(env),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: true,
      watch: { ignored: ['**/.figma/**'] },
    },
    preview: {
      host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
    },
  }
})


type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies /.figma/make/site.json to the generated document shell. */
function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
  }
  function escapeHtmlText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function replaceHtmlCommentSlot(html: string, slotName: string, content: string): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "ResQ - Emergency Response Platform"
  const description = config.description ?? ''
  const favicon = config.icons?.icon ?? ''
  const socialImage = config.openGraph?.image ?? ''
  const language = sanitizeHtmlValue(config.language) || 'en'
  const googleAnalyticsId = sanitizeHtmlValue(config.analytics?.googleAnalyticsId)
  const headStart = config.customScripts?.headStart ?? ''
  const headEnd = config.customScripts?.headEnd ?? ''
  const bodyStart = config.customScripts?.bodyStart ?? ''
  const bodyEnd = config.customScripts?.bodyEnd ?? ''
  const robotsTxt = config.robots?.index === false ? 'User-agent: *\nDisallow: /\n' : ''

  return {
    name: 'figma-site-configuration',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split('?')[0] !== '/robots.txt') return next()

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, 'figma:lang', language)
        result = replaceHtmlCommentSlot(result, 'figma:title', escapeHtmlText(title))
        result = replaceHtmlCommentSlot(result, 'figma:head-start', headStart)
        result = replaceHtmlCommentSlot(result, 'figma:head-end', headEnd)
        result = replaceHtmlCommentSlot(result, 'figma:body-start', bodyStart)
        result = replaceHtmlCommentSlot(result, 'figma:body-end', bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({ tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' })
        }
        if (config.robots?.index === false) {
          tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
        }
        if (favicon) {
          tags.push({ tag: 'link', attrs: { rel: 'icon', href: favicon }, injectTo: 'head' })
        }
        if (title) {
          tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' })
        }
        if (description) {
          tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' })
        }
        if (socialImage) {
          tags.push(
            { tag: 'meta', attrs: { property: 'og:image', content: socialImage }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image', content: socialImage }, injectTo: 'head' },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: 'script',
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: 'head',
            },
            {
              tag: 'script',
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: 'head',
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: 'style',
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: 'head',
            },
            {
              tag: 'a',
              attrs: { class: 'figma-bypass-link', href: '#root' },
              children: 'Skip to content',
              injectTo: 'body-prepend',
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Vite buffers an error payload only while
 * no clients are connected and clears the buffer on the first
 * reconnect (see `bufferedMessage` in `createWebSocketServer`), so
 * if the preview iframe reloads after Vite already delivered an
 * error to a live socket, the new socket misses the payload and
 * the overlay stays hidden even though the build is still broken.
 * We intercept `ws.send` to remember the latest error and replay
 * it on every new connection; the cache clears on a successful
 * `update` or `full-reload` so a stale overlay can't survive a
 * fixed build.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: 'figma-error-overlay-replay',
    apply: 'serve',
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (...args: any[]) => void
      server.ws.send = ((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === 'error') {
            lastError = payload as object
          } else if (type === 'update' || type === 'full-reload') {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send

      server.ws.on('connection', (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. This happens when an agent moves a component into a new file
 * and replaces the old module with a re-export:
 *
 *   export { default } from './app/App'
 *
 * Vite otherwise accepts the update using the previous module's HMR boundary,
 * but the re-export-only transform no longer registers a replacement for the
 * mounted component family. React reports a successful refresh while leaving
 * the old tree mounted until the page is reloaded.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  const hadRefreshBoundary = new Map<string, boolean>()
  let sendFullReload: (() => void) | null = null

  return {
    name: 'figma-react-refresh-boundary-fallback',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: 'full-reload', path: '*' })
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes('/node_modules/')) return null

      const moduleId = id.split('?')[0] ?? id
      const hasRefreshBoundary = code.includes('registerExportsForReactRefresh')
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html that
 * the Figma preview script drives directly. The page exposes a
 * registry of every file matching `storiesGlob` on
 * window.__FIGMA__.stories so the design surface can dynamically
 * import + mount each entry into its own grid view.
 *
 * Dev-only: `apply: 'serve'` gates the plugin to `vite dev`. Prod
 * builds (`vite build`) skip it entirely so the route doesn't leak
 * into shipped bundles.
 */
function figmaMakeKitPlugin(options: { storiesGlob: string | string[] }): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob) ? options.storiesGlob : [options.storiesGlob]
  const ROUTE = '/.figma/make/kit.html'
  const VIRTUAL_ID = 'virtual:figma-stories'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: 'figma-make-kit',
    apply: 'serve',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.split('?')[0] !== ROUTE) return next()

        try {
          res.setHeader('Content-Type', 'text/html')
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}

function getDeterministicFallbackConfig(category: string, description: string, etaMinutes?: number) {
  const desc = (description || '').toLowerCase();
  const cat = (category || 'other').toLowerCase();

  const isSevereCrime = cat === 'crime' && (desc.includes('bleed') || desc.includes('attack') || desc.includes('injur') || desc.includes('wound') || desc.includes('shot') || desc.includes('stab') || desc.includes('unconscious'));
  const isSevereAccident = cat === 'accident' && (desc.includes('trap') || desc.includes('sever') || desc.includes('multi') || desc.includes('fire') || desc.includes('casualt') || desc.includes('injur'));
  const isSevereFire = cat === 'fire' && (desc.includes('trap') || desc.includes('spread') || desc.includes('explos') || desc.includes('smoke') || desc.includes('burn'));

  if (isSevereCrime) {
    return {
      severity: 'CRITICAL',
      priority: 'P1',
      urgency: 'immediate',
      people_at_risk: 2,
      hazards: ['Active hostile threat', 'Severe bleeding/trauma', 'Crowd safety risk'],
      response_domains: ['police', 'medical'],
      recommended_resource_types: ['police_unit', 'ambulance'],
      summary: 'Violent crime with severe injury requiring combined police perimeter control and immediate paramedic trauma care.',
      responder_guidance: {
        police: [
          'Approach with tactical caution; suspect reported in vicinity',
          'Secure perimeter to allow safe paramedic ingress',
          'Preserve physical evidence and establish command post'
        ],
        medical: [
          'Prepare ALS hemorrhage control and trauma dressings',
          'Coordinate staged entry with police units',
          'Designate direct transport route to level-1 trauma center'
        ]
      },
      pre_arrival_guidance: {
        citizen: [
          'Stay in a secure location away from the attacker',
          'Apply direct pressure to bleeding wounds using clean cloth if safe',
          `First responders are en route${etaMinutes ? ` (ETA: ${etaMinutes}m)` : ''}; keep clear for emergency access`
        ]
      },
      confidence: 96,
    };
  }
  if (isSevereAccident) {
    return {
      severity: 'CRITICAL',
      priority: 'P1',
      urgency: 'immediate',
      people_at_risk: 3,
      hazards: ['Vehicle entrapment', 'Fuel leak', 'Traffic hazard', 'Multiple casualties'],
      response_domains: ['accident', 'medical', 'fire', 'police'],
      recommended_resource_types: ['police_unit', 'ambulance', 'fire_truck', 'rescue_unit'],
      summary: 'Major multi-vehicle collision with trapped occupants requiring rescue extrication, ALS transport, and traffic containment.',
      responder_guidance: {
        accident: [
          'Stage hydraulic extrication tools and vehicle stabilizers',
          'Deploy absorbent pads for fuel spills and hazard containment'
        ],
        medical: [
          'Triage casualties upon extraction and initiate rapid ALS transport',
          'Prepare cervical collars and full spine immobilization'
        ],
        police: [
          'Close inbound traffic lanes and establish safe perimeter for rescue'
        ]
      },
      pre_arrival_guidance: {
        citizen: [
          'Do not move injured individuals unless imminent fire or explosion hazard',
          'Turn off vehicle ignitions if accessible without entering roadway',
          'Keep oncoming traffic away from the collision zone'
        ]
      },
      confidence: 97,
    };
  }
  if (isSevereFire) {
    return {
      severity: 'CRITICAL',
      priority: 'P1',
      urgency: 'immediate',
      people_at_risk: 2,
      hazards: ['Active fire spread', 'Smoke inhalation', 'Structural compromise'],
      response_domains: ['fire', 'medical', 'police'],
      recommended_resource_types: ['fire_truck', 'ambulance', 'police_unit'],
      summary: 'Active structure fire requiring suppression teams, perimeter security, and standby emergency medical support.',
      responder_guidance: {
        fire: [
          'Initiate primary search and interior suppression attack',
          'Connect to nearest hydrants and monitor structural integrity'
        ],
        medical: [
          'Prepare high-flow oxygen and smoke inhalation triage kits'
        ],
        police: [
          'Evacuate adjacent buildings and clear street for ladder trucks'
        ]
      },
      pre_arrival_guidance: {
        citizen: [
          'Evacuate building immediately and close doors behind you to slow fire',
          'Do not use elevators; crawl low under smoke',
          'Assemble at designated outdoor safety area'
        ]
      },
      confidence: 95,
    };
  }

  const domainMap: Record<string, string[]> = {
    crime: ['police'],
    fire: ['fire'],
    accident: ['accident', 'police'],
    medical: ['medical'],
    disaster: ['disaster'],
    other: ['police', 'medical'],
  };

  return {
    severity: 'HIGH',
    priority: 'P2',
    urgency: 'urgent',
    people_at_risk: 1,
    hazards: ['Unsecured emergency area'],
    response_domains: domainMap[cat] ?? ['police'],
    recommended_resource_types: ['police_unit', 'ambulance'],
    summary: `${cat.toUpperCase()} emergency reported. Dispatching first responders for assessment.`,
    responder_guidance: {
      [cat]: [
        'Proceed with standard response protocol',
        'Verify scene safety and establish local command'
      ]
    },
    pre_arrival_guidance: {
      citizen: [
        'Remain calm and stay in a safe, visible position',
        'Follow instructions from responding emergency units upon arrival'
      ]
    },
    confidence: 88,
  };
}

/**
 * Server-side proxy middleware for Featherless AI Context Analysis.
 * Runs strictly within the Node / Vite server process and never exposes API keys to client JavaScript.
 */
function featherlessServerProxy(env: Record<string, string>): Plugin {
  return {
    name: 'featherless-server-proxy',
    configureServer(server) {
      server.middlewares.use('/api/analyze-incident', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let bodyRaw = '';
        req.on('data', chunk => { bodyRaw += chunk; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const body = JSON.parse(bodyRaw || '{}');
            const { category, description, latitude, longitude, eta_minutes } = body;

            const apiKey = env.FEATHERLESS_API_KEY || process.env.FEATHERLESS_API_KEY || env.VITE_FEATHERLESS_API_KEY || process.env.VITE_FEATHERLESS_API_KEY || '';
            let model = env.FEATHERLESS_MODEL || process.env.FEATHERLESS_MODEL || 'deepseek-ai/DeepSeek-V3.2';

            const targetEndpoint = 'https://api.featherless.ai/v1/chat/completions';
            const providerName = 'Featherless.ai (Official Hackathon Endpoint)';

            console.log('\n======================================================');
            console.log(`🤖 [AI BACKEND PROXY] Emergency Context Analysis (${providerName})`);
            console.log(`📍 Category: ${category}`);
            console.log(`📝 Description: ${description}`);
            console.log(`🎯 Target API: ${targetEndpoint}`);
            console.log(`🧠 Model: ${model}`);
            console.log(`🔑 Key Configured: ${apiKey ? `YES (length: ${apiKey.length})` : 'NO (Missing)'}`);

            if (!apiKey) {
              console.warn('⚠️ [AI BACKEND PROXY] No API key configured. Returning deterministic fallback.');
              console.log('======================================================\n');
              const fallback = getDeterministicFallbackConfig(category, description, eta_minutes);
              res.statusCode = 200;
              res.end(JSON.stringify({
                ...fallback,
                source: 'deterministic_fallback',
                modelUsed: 'rule_engine',
                httpStatus: 0,
                apiReachable: false,
                reason: 'API key not configured in environment',
              }));
              return;
            }

            const promptUserContent = `Incident Category: ${category}
Citizen Description: ${description || 'No detailed text provided.'}
Location Coordinates: ${latitude ?? 40.7128}, ${longitude ?? -74.0060}
${eta_minutes ? `Estimated Response ETA: ${eta_minutes} minutes` : ''}`;

            const SYSTEM_PROMPT = `You are the emergency context analysis engine for ResQ.
The citizen-selected incident category is authoritative. NEVER change the category.

Analyze the provided incident context and determine:
- severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW"
- priority: "P1" | "P2" | "P3" | "P4"
- urgency: "immediate" | "urgent" | "soon" | "routine"
- people_at_risk: integer number
- hazards: array of concise hazard strings
- response_domains: array of domains needing dispatch, subset of ["police", "medical", "fire", "accident", "disaster"]
- recommended_resource_types: array of specific unit strings (e.g. "police_unit", "ambulance", "fire_truck", "rescue_unit")
- summary: concise operational summary (1-2 sentences)
- responder_guidance: object with keys for each response domain containing 2-3 concise preparation bullets
- pre_arrival_guidance: object with { "citizen": ["2-3 safe pre-arrival safety actions while waiting for help"] }

Return ONLY valid JSON.`;

            const featherlessRes = await fetch(targetEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: promptUserContent },
                ],
                temperature: 0.1,
                max_tokens: 600,
              }),
            });

            console.log(`📡 [FEATHERLESS BACKEND PROXY] Featherless HTTP Response Status: ${featherlessRes.status} ${featherlessRes.statusText}`);

            if (!featherlessRes.ok) {
              const errBody = await featherlessRes.text();
              console.error(`❌ [FEATHERLESS BACKEND PROXY] Error payload:`, errBody);
              console.log('======================================================\n');
              const fallback = getDeterministicFallbackConfig(category, description, eta_minutes);
              res.statusCode = 200;
              res.end(JSON.stringify({
                ...fallback,
                source: 'deterministic_fallback',
                modelUsed: model,
                httpStatus: featherlessRes.status,
                apiReachable: true,
                reason: `Featherless HTTP error: ${featherlessRes.status}`,
              }));
              return;
            }

            const data = await featherlessRes.json();
            const rawContent = data.choices?.[0]?.message?.content || '';
            console.log(`✅ [FEATHERLESS BACKEND PROXY] Live LLM Output:\n${rawContent}`);
            console.log('======================================================\n');

            const cleaned = rawContent
              .replace(/^```json\s*/i, '')
              .replace(/^```\s*/i, '')
              .replace(/```\s*$/i, '')
              .trim();

            try {
              const parsed = JSON.parse(cleaned);
              res.statusCode = 200;
              res.end(JSON.stringify({
                ...parsed,
                source: 'featherless_live',
                modelUsed: model,
                httpStatus: featherlessRes.status,
                apiReachable: true,
              }));
            } catch (pErr) {
              console.error('[FEATHERLESS BACKEND PROXY] JSON parse error:', pErr);
              const fallback = getDeterministicFallbackConfig(category, description, eta_minutes);
              res.statusCode = 200;
              res.end(JSON.stringify({
                ...fallback,
                source: 'deterministic_fallback',
                modelUsed: model,
                httpStatus: featherlessRes.status,
                apiReachable: true,
                reason: 'Failed to parse JSON response from Featherless model',
              }));
            }
          } catch (err) {
            console.error('[FEATHERLESS BACKEND PROXY] Server error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: (err as Error).message }));
          }
        });
      });
    },
  };
}

