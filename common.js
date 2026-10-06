(function(){
  const C=PB_CONFIG;
  function hex(n){let s='';const c='0123456789ABCDEF';for(let i=0;i<n;i++)s+=c[Math.floor(Math.random()*c.length)];return s}
  window.PB={
    C,
    id:(p,n)=>p+hex(n||10),
    session(){try{return JSON.parse(localStorage.getItem('powerbank_session')||'null')}catch(e){return null}},
    save(s){localStorage.setItem('powerbank_session',JSON.stringify(s))},
    clear(){localStorage.removeItem('powerbank_session')},
    esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))},
    mqttStatus(){const d=document.querySelector('.mqtt-dot'),t=document.querySelector('.mqtt-text');if(!d)return;PB_MQTT.onStatus(s=>{d.className='mqtt-dot '+(s==='connected'?'connected':s==='reconnecting'?'reconnecting':'');if(t)t.textContent=s==='connected'?'MQTT connected':s==='reconnecting'?'MQTT reconnecting':'MQTT offline';}) ; PB_MQTT.connect()},
    wait(ms){return new Promise(r=>setTimeout(r,ms))}
  };
})();
