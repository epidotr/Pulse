window.Ui={
  modal(html){
    const ov=document.createElement('div'),prev=document.activeElement;
    ov.className='ov';ov.innerHTML='<div class="mod" role="dialog" aria-modal="true">'+html+'</div>';
    const key=e=>{if(e.key==='Escape')close()};
    const close=()=>{ov.remove();document.removeEventListener('keydown',key);prev&&prev.focus&&prev.focus()};
    document.addEventListener('keydown',key);
    ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('[data-close]'))close()});
    document.body.append(ov);
    const f=ov.querySelector('input,button');f&&f.focus();
    return{root:ov,close};
  },
  eventModal(e){
    const p=e.payload||{},ok=(u,h)=>typeof u==='string'&&u.startsWith(h);
    const url=ok(p.url,'https://github.com/')?p.url:'https://github.com/'+e.repo;
    const av=ok(e.avatar,'https://avatars.githubusercontent.com/')?'<img src="'+esc(e.avatar)+'" alt="">':'<div class="av">'+esc((e.actor||'?')[0].toUpperCase())+'</div>';
    const items=(p.items||[]).filter(Boolean).map(i=>'<li>'+esc(i)+'</li>').join('');
    this.modal('<div class="mh">'+av+'<div><b>'+esc(e.actor)+'</b><div class="mu">'+esc(p.text)+'</div></div></div><p class="mu">'+esc(e.repo)+' · '+esc(e.type||'Event')+'<br>'+esc(new Date(e.at).toLocaleString())+'</p>'+(items?'<ul class="bl">'+items+'</ul>':'')+'<div class="mf"><a href="'+esc(url)+'" target="_blank" rel="noopener">Open on GitHub</a><button data-close>Close</button></div>');
  }
};
