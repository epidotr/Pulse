const http=require('http'),fs=require('fs'),path=require('path');
try{for(const l of fs.readFileSync(path.join(__dirname,'.env'),'utf8').split(/\r?\n/)){const m=l.match(/^\s*(\w+)\s*=\s*(.*?)\s*$/);if(m&&!(m[1] in process.env))process.env[m[1]]=m[2].replace(/^["']|["']$/g,'')}}catch{}
const PORT=process.env.PORT||3000,TOKEN=process.env.GITHUB_TOKEN,PUB=path.join(__dirname,'public');
const TTL=20000,cache=new Map(),REPO=/^[\w.-]+\/[\w.-]+$/;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
async function gh(p){
  const c=cache.get(p);if(c&&Date.now()-c.t<TTL)return c.d;
  const r=await fetch('https://api.github.com'+p,{headers:{'User-Agent':'repo-pulse',Accept:'application/vnd.github+json',...(TOKEN&&{Authorization:'Bearer '+TOKEN})}});
  if(!r.ok)throw Object.assign(new Error('GitHub '+r.status),{status:r.status});
  const d=await r.json();cache.set(p,{t:Date.now(),d});return d;
}
function slim(e){
  const p=e.payload||{};
  switch(e.type){
    case 'PushEvent':return{text:'pushed to '+(p.ref||'').replace('refs/heads/',''),items:(p.commits||[]).slice(0,5).map(c=>c.message.split('\n')[0]).concat(p.commits?[]:(p.head?['Head commit '+p.head.slice(0,7)]:[]))};
    case 'PullRequestEvent':return{text:p.action+' PR #'+p.number,items:[p.pull_request&&p.pull_request.title],url:p.pull_request&&p.pull_request.html_url};
    case 'IssuesEvent':return{text:p.action+' issue #'+(p.issue&&p.issue.number),items:[p.issue&&p.issue.title],url:p.issue&&p.issue.html_url};
    case 'IssueCommentEvent':return{text:'commented on #'+(p.issue&&p.issue.number),items:[((p.comment&&p.comment.body)||'').slice(0,160)],url:p.comment&&p.comment.html_url};
    case 'WatchEvent':return{text:'starred the repo'};
    case 'ForkEvent':return{text:'forked the repo',url:p.forkee&&p.forkee.html_url};
    default:return{text:e.type.replace('Event','').toLowerCase()};
  }
}
const send=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj))};
http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/api/repo'){
    const n=u.searchParams.get('name')||'';
    if(!REPO.test(n))return send(res,400,{error:'Bad repo name'});
    try{
      const [r,ev]=await Promise.all([gh('/repos/'+n),gh('/repos/'+n+'/events?per_page=100')]);
      return send(res,200,{name:r.full_name,stars:r.stargazers_count,forks:r.forks_count,issues:r.open_issues_count,url:r.html_url,
        events:ev.map(e=>({id:e.id,type:e.type,actor:e.actor.login,avatar:e.actor.avatar_url,at:e.created_at,payload:slim(e)}))});
    }catch(e){return send(res,e.status||502,{error:e.message})}
  }
  const f=path.join(PUB,u.pathname==='/'?'index.html':decodeURIComponent(u.pathname));
  if(!f.startsWith(PUB+path.sep))return send(res,403,{error:'Forbidden'});
  fs.readFile(f,(err,b)=>{
    if(err){res.writeHead(404);return res.end('Not found')}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'text/plain'});res.end(b);
  });
}).listen(PORT,()=>console.log('Repo pulse on http://localhost:'+PORT+(TOKEN?' (token loaded)':' (no token, 60 req/h)')));
