importScripts('https://unpkg.com/mqtt/dist/mqtt.min.js');
let client=null, ports=new Set(), subscriptions=new Set(), connected=false;
function send(p,msg){try{p.postMessage(msg)}catch(e){ports.delete(p)}}
function broadcast(msg){for(const p of ports)send(p,msg)}
function clientId(){return 'POWERBANK_SHARED_'+Date.now()+'_'+Math.random().toString(16).slice(2,10)}
function connect(){
  if(client || typeof mqtt==='undefined') return;
  client=mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:clientId(),protocolVersion:4,clean:true,connectTimeout:10000,keepalive:60,reconnectPeriod:3000,resubscribe:true});
  client.on('connect',()=>{connected=true; broadcast({type:'status',status:'connected'}); for(const t of subscriptions) client.subscribe(t,{qos:0})});
  client.on('reconnect',()=>{connected=false;broadcast({type:'status',status:'reconnecting'})});
  client.on('offline',()=>{connected=false;broadcast({type:'status',status:'offline'})});
  client.on('error',e=>{connected=false;broadcast({type:'status',status:'error',error:e&&e.message||String(e)})});
  client.on('message',(topic,payload)=>broadcast({type:'message',topic,payload:payload.toString()}));
}
self.onconnect=e=>{
  const port=e.ports[0]; ports.add(port);
  port.onmessage=ev=>{
    const m=ev.data||{};
    if(m.type==='connect'){connect();send(port,{type:'status',status:connected?'connected':'connecting'});}
    if(m.type==='subscribe' && m.topic){subscriptions.add(m.topic);if(client&&connected)client.subscribe(m.topic,{qos:0})}
    if(m.type==='publish' && m.topic && client){client.publish(m.topic,m.payload||'',{qos:0,retain:false})}
  };
  port.start(); connect(); send(port,{type:'status',status:connected?'connected':'connecting'});
};
