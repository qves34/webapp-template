// Žádné cachování - appka potřebuje vždycky čerstvá data (účty/watchlist
// jdou přes Supabase přímo). Prázdný fetch handler je jen kvůli podmínce
// instalovatelnosti (Chrome/Android appku bez SW nenabídne přidat na plochu),
// požadavky si normálně obslouží síť.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {})
