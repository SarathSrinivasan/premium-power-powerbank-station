(function(){
  const C=window.PB_CONFIG;
  let port=null, client=null, listeners=[];
  const statusListeners=[];
  function emitStatus(s){statusListeners.forEach(fn=>fn(s));}
  function emitMessage(t,p){listeners.forEach(fn=>fn(t,p));}
  function fallback(){
    if(client) return;
    if(typeof mqtt==='undefined'){emitStatus('error');return;}
    emitStatus('connecting');
    client=mqtt.connect(C.BROKER,{clientId:'POWERBANK_WEB_'+Date.now()+'_'+Math.random().toString(16).slice(2,10),protocolVersion:4,clean:true,connectTimeout:10000,keepalive:60,reconnectPeriod:3000,resubscribe:true});
    client.on('connect',()=>emitStatus('connected')); client.on('reconnect',()=>emitStatus('reconnecting')); client.on('offline',()=>emitStatus('offline')); client.on('error',()=>emitStatus('error')); client.on('message',(t,p)=>emitMessage(t,p.toString()));
  }
  window.PB_MQTT={
    onStatus(fn){statusListeners.push(fn);return()=>{const i=statusListeners.indexOf(fn);if(i>=0)statusListeners.splice(i,1)}},
    onMessage(fn){listeners.push(fn);return()=>{const i=listeners.indexOf(fn);if(i>=0)listeners.splice(i,1)}},
    connect(){
      if(window.SharedWorker){
        try{
          const w=new SharedWorker('mqtt-worker.js'); port=w.port; port.start();
          port.onmessage=e=>{const m=e.data||{};if(m.type==='status')emitStatus(m.status);if(m.type==='message')emitMessage(m.topic,m.payload)};
          port.postMessage({type:'connect'}); return;
        }catch(e){}
      }
      fallback();
    },
    subscribe(topic){if(port)port.postMessage({type:'subscribe',topic});else if(client)client.subscribe(topic,{qos:0})},
    publish(topic,payload){if(port)port.postMessage({type:'publish',topic,payload:typeof payload==='string'?payload:JSON.stringify(payload)});else if(client)client.publish(topic,typeof payload==='string'?payload:JSON.stringify(payload),{qos:0,retain:false})},
    isConnected(){return !!client || !!port}
  };
})();
