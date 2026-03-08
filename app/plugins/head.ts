export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  return useHead({
    link: [
      { rel: 'icon', type: 'image/png', href: `${config.app.baseURL}/favicon-96x96.png`, sizes: '96x96' },
      { rel: 'icon', type: 'image/svg+xml', href: `${config.app.baseURL}/favicon.svg` },
      { rel: 'shortcut icon', href: `${config.app.baseURL}/favicon.ico` },
      { rel: 'apple-touch-icon', href: `${config.app.baseURL}/apple-touch-icon.png`, sizes: '180x180' },
      { rel: 'manifest', href: `${config.app.baseURL}/site.webmanifest` },
    ],
  })
})
