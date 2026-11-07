window.Repos={
  chips(S,top,col,done){
    const c=document.getElementById('chips');c.innerHTML='';
    S.repos.forEach(n=>{
      const s=document.createElement('span'),on=top.has(n);
      s.className='chip'+(on?'':' off');s.title=n+(on?'':' (not charted)');
      s.innerHTML='<i style="background:'+col(n)+'"></i>'+esc(n.split('/')[1]);c.append(s);
    });
    const b=document.createElement('button');
    b.className='chip add';b.textContent='+';b.setAttribute('aria-label','Add repository');
    b.onclick=()=>this.modal(S,done);c.append(b);
  },
  modal(S,done){
    const A=window.Api||Sim;
    const m=Ui.modal('<h3>Included repositories</h3><div id="rl"></div><div class="addrow"><input id="rn" placeholder="owner/repo" autocomplete="off"><button id="ra">Add</button></div><div class="err" id="re"></div><label class="xrow">Repos shown in the graphs<input id="rx" type="number" min="1" max="8"></label><div class="mf"><button data-close>Done</button></div>');
    const q=s=>m.root.querySelector(s),err=t=>{q('#re').textContent=t};
    const list=()=>{q('#rl').innerHTML=S.repos.map((n,i)=>'<div class="rr"><span>'+esc(n)+'</span><button data-i="'+i+'" aria-label="Remove '+esc(n)+'">×</button></div>').join('')};
    q('#rl').onclick=e=>{
      const b=e.target.closest('button');if(!b)return;
      if(S.repos.length<2)return err('Keep at least one repository');
      const n=S.repos.splice(+b.dataset.i,1)[0];delete S.data[n];err('');list();done();
    };
    const add=async()=>{
      const n=q('#rn').value.trim().replace(/^https?:\/\/github\.com\//,'').replace(/\/$/,'');err('');
      if(!/^[\w.-]+\/[\w.-]+$/.test(n))return err('Use the owner/repo format');
      if(S.repos.some(r=>r.toLowerCase()===n.toLowerCase()))return err('Already included');
      q('#ra').textContent='Checking…';
      try{S.data[n]=await A.repo(n);S.repos.push(n);q('#rn').value='';list();done()}
      catch(e){err(e.notFound?'Repository not found':'Could not reach GitHub. Try again.')}
      q('#ra').textContent='Add';
    };
    q('#ra').onclick=add;q('#rn').onkeydown=e=>{if(e.key==='Enter')add()};
    q('#rx').value=S.top;
    q('#rx').onchange=()=>{S.top=Math.min(8,Math.max(1,+q('#rx').value||1));q('#rx').value=S.top;done()};
    list();
  }
};
