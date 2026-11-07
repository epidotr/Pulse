(()=>{
const $=id=>document.getElementById(id),A=()=>window.Api||Sim;
const esc=window.esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch{return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const PAL=['#378ADD','#1D9E75','#D85A30','#7F77DD','#EF9F27','#D4537E','#639922','#888780'];
const S={repos:ld('repos',['vuejs/core','facebook/react','sveltejs/svelte','solidjs/solid']),top:ld('top',4),data:{}};
const seen=new Set(),B=30,BMS=12e4;
const col=n=>PAL[Math.max(0,S.repos.indexOf(n))%PAL.length];
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const fmt=n=>Math.round(n).toLocaleString();
const hm=d=>new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

const line=new Chart($('line'),{type:'line',data:{labels:[],datasets:[]},options:{maintainAspectRatio:false,animation:{duration:500},interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom',labels:{boxWidth:10,boxHeight:10,usePointStyle:true}}},scales:{x:{display:false},y:{beginAtZero:true,ticks:{precision:0}}}}});
const bar=new Chart($('bar'),{type:'bar',data:{labels:[],datasets:[]},options:{indexAxis:'y',maintainAspectRatio:false,animation:{duration:400},plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{callback:v=>v>=1e3?v/1e3+'k':v}},y:{grid:{display:false}}}}});

function theme(){Chart.defaults.color=css('--mu');Chart.defaults.borderColor=css('--bd');[line,bar].forEach(c=>c.update('none'))}
const root=document.documentElement,saved=ld('theme',null);
if(saved)root.dataset.theme=saved;
$('theme').onclick=()=>{
  const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme=dark?'light':'dark';sv('theme',root.dataset.theme);theme();
};
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',theme);

const done=()=>{sv('repos',S.repos);sv('top',S.top);render()};

function render(){
  const now=Date.now(),names=S.repos.filter(n=>S.data[n]);
  const rows=names.map(n=>{
    const c=Array(B).fill(0);
    S.data[n].events.forEach(e=>{const i=B-1-Math.floor((now-Date.parse(e.at))/BMS);if(i>=0&&i<B)c[i]++});
    return{n,c,t:c.reduce((a,b)=>a+b,0)};
  });
  const top=[...rows].sort((a,b)=>b.t-a.t||S.data[b.n].stars-S.data[a.n].stars).slice(0,S.top);

  line.data.labels=Array.from({length:B},(_,i)=>hm(now-(B-1-i)*BMS));
  line.data.datasets=top.map(r=>({label:r.n.split('/')[1],data:r.c,borderColor:col(r.n),backgroundColor:col(r.n),borderWidth:2,pointRadius:0,tension:.35}));
  line.update();
  bar.data.labels=top.map(r=>r.n.split('/')[1]);
  bar.data.datasets=[{data:top.map(r=>S.data[r.n].stars),backgroundColor:top.map(r=>col(r.n)),borderRadius:4}];
  bar.update();

  const sum=k=>names.reduce((a,n)=>a+S.data[n][k],0);
  $('k1').textContent=fmt(sum('stars'));$('k2').textContent=fmt(sum('forks'));$('k3').textContent=fmt(sum('issues'));
  $('k4').textContent=(names.reduce((a,n)=>a+S.data[n].events.filter(e=>now-Date.parse(e.at)<6e5).length,0)/10).toFixed(1);

  const evs=names.flatMap(n=>S.data[n].events.map(e=>Object.assign({repo:n},e))).sort((a,b)=>b.at.localeCompare(a.at)).slice(0,6);
  const f=$('feed');f.innerHTML='';
  evs.forEach(e=>{
    const li=document.createElement('li');li.tabIndex=0;if(!seen.has(e.id))li.className='new';
    li.innerHTML='<i style="background:'+col(e.repo)+'"></i><div><b>'+esc(e.actor)+'</b> '+esc(e.payload.text)+' · '+esc(e.repo)+'</div><span>'+hm(e.at)+'</span>';
    const open=()=>window.Ui&&Ui.eventModal(e);
    li.onclick=open;li.onkeydown=k=>{if(k.key==='Enter')open()};
    f.append(li);
  });
  evs.forEach(e=>seen.add(e.id));

  window.Repos&&Repos.chips(S,new Set(top.map(r=>r.n)),col,done);
  $('status').textContent=A().label();$('note').textContent=A().note();
}

async function refresh(){
  await Promise.all(S.repos.map(async n=>{try{S.data[n]=await A().repo(n)}catch(e){}}));
  render();
}
theme();
(async function loop(){
  try{await refresh()}catch(e){console.error(e)}
  setTimeout(loop,A().mode==='live'?2e4:3e3);
})();
})();
