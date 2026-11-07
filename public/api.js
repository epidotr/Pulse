window.Api={
  mode:'live',failAt:0,why:'',
  forced:new URLSearchParams(location.search).has('sim'),
  async repo(name){
    if(this.forced){this.mode='sim';this.why='forced with ?sim=1'}
    else if(this.mode==='sim'&&Date.now()-this.failAt>12e4)this.mode='live';
    if(this.mode==='live'){
      try{
        const r=await fetch('/api/repo?name='+encodeURIComponent(name));
        if(r.status===404)throw Object.assign(new Error('Repository not found'),{notFound:true});
        if(!r.ok)throw new Error(((await r.json().catch(()=>({}))).error)||('HTTP '+r.status));
        return await r.json();
      }catch(e){
        if(e.notFound)throw e;
        this.mode='sim';this.failAt=Date.now();this.why=e.message;
      }
    }
    return Sim.repo(name);
  },
  label(){return this.mode==='live'?'Live · GitHub API':'Simulated data'},
  note(){return this.mode==='live'?'Public GitHub events, refreshed every 20 seconds. Select an event for details.':Sim.note()}
};
