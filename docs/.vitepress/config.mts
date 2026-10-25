import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Route-88",
  description: "High-performance Ohio traffic ingestion, routing, and intelligence platform.",
  
  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules)
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx]
        if (token.info.trim() === 'mermaid') {
          const encoded = encodeURIComponent(token.content.trim())
          return `<ClientOnly><Mermaid code="${encoded}" /></ClientOnly>`
        }
        return defaultFence(tokens, idx, options, env, slf)
      }
    }
  },

  themeConfig: {
    siteTitle: 'Route-88',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/what-is-route88' },
      { text: 'Features', link: '/features/ohgo/overview' },
      { text: 'API Reference', link: '/api/authentication' },
      { text: 'Infrastructure', link: '/infra/database-schema' },
      { text: 'Roadmap', link: '/infra/roadmap' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Route-88?', link: '/guide/what-is-route88' },
            { text: 'System Architecture', link: '/guide/architecture' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration & Env', link: '/guide/configuration' }
          ]
        }
      ],

      '/features/': [
        {
          text: 'OHGO Ingestion Engine',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/features/ohgo/overview' },
            { text: 'Real-Time Incidents', link: '/features/ohgo/incidents' },
            { text: 'Dangerous Slowdowns', link: '/features/ohgo/slowdowns' },
            { text: 'Construction & Roadworks', link: '/features/ohgo/construction' },
            { text: 'WZDx v4.2 Standard Feed', link: '/features/ohgo/wzdx' }
          ]
        },
        {
          text: 'Routing & Geospatial',
          collapsed: false,
          items: [
            { text: 'Routing Overview', link: '/features/routing/overview' },
            { text: 'Turn-by-Turn Routing', link: '/features/routing/route-calculation' },
            { text: 'Address Autocomplete', link: '/features/routing/autocomplete' },
            { text: 'Geocoding Resolution', link: '/features/routing/geocoding' }
          ]
        },
        {
          text: 'Discord Integration',
          collapsed: false,
          items: [
            { text: 'Webhooks & Embeds', link: '/features/discord/webhooks' },
            { text: 'Polling & Deduplication', link: '/features/discord/scheduler' },
            { text: 'Daily Morning Digest', link: '/features/discord/daily-digest' },
            { text: 'Slash Commands', link: '/features/discord/slash-commands' }
          ]
        },
        {
          text: 'Mobile Telemetry',
          collapsed: false,
          items: [
            { text: 'Device & Status Gateway', link: '/features/mobile/overview' },
            { text: 'Unified Telemetry Feed', link: '/features/mobile/telemetry' },
            { text: 'Geospatial Radius & Bounds', link: '/features/mobile/geospatial-filtering' }
          ]
        }
      ],

      '/api/': [
        {
          text: 'API Documentation',
          items: [
            { text: 'Authentication & Security', link: '/api/authentication' },
            { text: 'Discord Ingestion Endpoints', link: '/api/discord-routes' },
            { text: 'Mobile Gateway Endpoints', link: '/api/mobile-routes' },
            { text: 'Routing & Navigation Endpoints', link: '/api/route-routes' }
          ]
        }
      ],

      '/infra/': [
        {
          text: 'Infrastructure & Storage',
          items: [
            { text: 'Database Schema & Drizzle', link: '/infra/database-schema' },
            { text: 'Docker Services & Topology', link: '/infra/docker-services' },
            { text: 'Scheduler & Cron System', link: '/infra/scheduler-jobs' },
            { text: 'Project Roadmap', link: '/infra/roadmap' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/josh-eng-pvt/Route-88' }
    ],

    footer: {
      message: 'Route-88 Traffic & Navigation Platform',
      copyright: 'Built with Bun, Hono, Drizzle & OSRM'
    },

    search: {
      provider: 'local'
    }
  }
})
