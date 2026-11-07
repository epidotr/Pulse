window.Sim={
  mode:'sim',st:{},
  label(){return 'Simulated data'},
  note(){return 'Showing simulated data'+(window.Api&&Api.why?' ('+Api.why+')':'')+'. Run the server with a GITHUB_TOKEN in .env for real data.'},
  hash(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h},
  add(s,name,t){
    const n=100+Math.floor(Math.random()*9000),U=['ada','linus','grace','tim','margaret','dennis','barbara','ken'];
    const K=[['PushEvent','pushed to main',['fix: handle empty input','chore: bump dependencies']],['WatchEvent','starred the repo'],['IssuesEvent','opened issue #'+n,['Crash when config is missing']],['PullRequestEvent','merged PR #'+n,['Refactor scheduler internals']]];
    const k=K[Math.floor(Math.random()*K.length)],a=U[Math.floor(Math.random()*U.length)];
    s.events.push({id:'sim-'+name+'-'+(++s.seq),type:k[0],actor:a,avatar:'',at:new Date(t).toISOString(),payload:{text:k[1],items:k[2]||[]}});
  },
  repo(name){
    let s=this.st[name];const now=Date.now();
    if(!s){
      const h=this.hash(name);
      s=this.st[name]={stars:800+h%90000,forks:90+h%9000,issues:5+h%900,rate:1+h%5,events:[],seq:0};
      for(let i=0;i<120;i++)if(Math.random()<Math.min(.9,s.rate/6))this.add(s,name,now-Math.random()*36e5);
    }
    if(Math.random()<.5)s.stars++;
    if(Math.random()<s.rate/40)this.add(s,name,now);
    s.events.sort((a,b)=>b.at.localeCompare(a.at));s.events.length=Math.min(s.events.length,100);
    return{name,stars:s.stars,forks:s.forks,issues:s.issues,url:'https://github.com/'+name,events:s.events.slice()};
  }
};
