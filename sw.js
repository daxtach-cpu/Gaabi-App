self.addEventListener('active', e => { 
    e.waitUntil(clients.claim());
});

// gere le service worker actif 
self.addEventListener('message', e => { 
    if (e.data === 'keepAlive') {
        e.waitUntil(Promise.resolve()); 
    }
})