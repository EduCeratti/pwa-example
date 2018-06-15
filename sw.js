self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        'https://s1.trrsf.com/fe/pwa-offline/offline.html',
        'https://s1.trrsf.com/fe/pwa-offline/_css/theme-default.min.css'
      ]);
    })
  );
});

var PRIVATE = {};
PRIVATE.requestTimeout = 20000;
PRIVATE.isOffline = true;

PRIVATE.fetchTimeout = function() {
  "use strict";

  return new Promise(function(resolve, reject) {
      setTimeout(function(){
          return reject('Request Timeout - '+ PRIVATE.requestTimeout +'ms');
      }, PRIVATE.requestTimeout);
  });
};

self.addEventListener('fetch', function(event) {

  var requestIndex = event.request;
  
  //promises para simular o timeout do fetch
  var promises = [
    PRIVATE.fetchTimeout(),
    PRIVATE.promiseRequestIndex = fetch(requestIndex).then(function(response){
        if(!response.ok){
            var status = response.status.toString();

            //se der algum erro >= 500 entrega a pagina offline
            if(status && status.charAt(0) === '5'){
                return Promise.reject(response.status);
            }
        }

        return response;
    })
  ];  

  event.respondWith(Promise.race(promises).then(function(result){
    PRIVATE.isOffline = false;
    return result;
  }, function(errorMessage){
    PRIVATE.isOffline = true;
    return caches.match('https://s1.trrsf.com/fe/pwa-offline/offline.html');
  }));
});