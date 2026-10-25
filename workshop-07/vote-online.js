/* 沿用历期 GitHub Pages + Abacus 共享计数方式。没有任何管理密钥。 */
(() => {
  'use strict';
  const API='https://abacus.jasoncameron.dev';
  const NS='vivian-ws-20261025-abc-v1';
  const LIVE='https://vivianai.cn/workshop-07/';
  const PREVIEW=new URLSearchParams(location.search).get('preview')==='1';
  const KEY=NS+(PREVIEW?':preview':':live');
  const TEAMS=['A','B','C'];
  const $=id=>document.getElementById(id);
  let selected=null,busy=false,cooldown=0,counts=null,frozen=false;
  const link=file=>file+(PREVIEW?'?preview=1':'');
  function read(key){try{return JSON.parse(localStorage.getItem(KEY+key));}catch(_){return null;}}
  function save(key,value){localStorage.setItem(KEY+key,JSON.stringify(value));}
  function remove(key){localStorage.removeItem(KEY+key);}
  function banner(){return PREVIEW?'<aside class="demo-banner">演示模式 · 票数为本浏览器样例，不计入正式投票。</aside>':'';}
  function header(){return `<header class="brandbar"><div class="brandwrap"><img class="brand-icon" src="favicon-vote.svg" alt=""><div class="brand">一号位 AI 工作坊<small>COHORT 07 · LIVE VOTE</small></div></div><span class="status-pill open">${PREVIEW?'演示页面':'现场投票'}</span></header>`;}
  function footer(){return '<footer class="footer"><span>2026.10.25 · 上海</span><span>A / B / C</span></footer>';}
  function error(text){if($('error'))$('error').textContent=text;}
  function receipt(){const r=read(':receipt');if(r?.status==='accepted'&&TEAMS.includes(r.team)){finish(r.team);return true;}if(r?.status==='pending'){pending();return true;}return false;}
  function pending(){document.querySelectorAll('.team-option').forEach(x=>x.disabled=true);$('submit').disabled=true;$('submit').textContent='提交状态待确认';error('网络没有返回确认，可能已经入票。请不要重复提交，直接告知讲师核对。');}
  function finish(team){$('voting').classList.add('hidden');$('success').classList.remove('hidden');$('receipt').textContent=`已投给 ${team} 组`;}
  function update(){if(!$('submit')||busy)return;$('submit').disabled=!selected||Date.now()<cooldown;$('submit').textContent=Date.now()<cooldown?'请求较多，请稍后再试':selected?`确认投给 ${selected} 组 →`:'选好一组，再投票';}
  function votePage(){
    $('app').innerHTML=banner()+`<main class="phone">${header()}<div id="voting"><section class="intro"><div class="eyebrow">AI 经营参谋挑战赛</div><h1>哪一组，<br>你最想让它<span class="blue">上岗？</span></h1><p>听完三组发布，选出你最认可的一组。<br>全员共同投票，以票数决定挑战赛结果。</p></section><div class="rules"><span class="rule">匿名 · 单选</span><span class="rule">提交后不可修改</span><span class="rule">票数决定结果</span></div><fieldset class="options" role="radiogroup" aria-labelledby="question"><legend id="question" class="question-label">你最认可哪一组的作品？</legend>${TEAMS.map((t,i)=>`<button class="team-option" type="button" role="radio" aria-checked="false" tabindex="${i===0?'0':'-1'}" data-team="${t}"><span class="letter">${t}</span><strong>${t} 组</strong><span class="radio" aria-hidden="true">✓</span></button>`).join('')}</fieldset><div class="vote-bottom"><button id="submit" class="primary" disabled>选好一组，再投票</button><p class="fineprint">本浏览器限投一次 · 不收集姓名<br>请听主持人宣布开始、截止；结果以现场为准。</p><div class="error-message" id="error" role="alert"></div></div></div><section class="success hidden" id="success" aria-live="polite"><div class="success-icon" aria-hidden="true">✓</div><h2>这一票，收到了。</h2><div class="receipt" id="receipt"></div><p>谢谢你认真看见每一组的作品。<br>提交后不可修改，请等待现场亮票。</p></section>${footer()}</main>`;
    const options=[...document.querySelectorAll('.team-option')];
    function choose(btn){if(busy||read(':receipt'))return;selected=btn.dataset.team;options.forEach(x=>{x.setAttribute('aria-checked',String(x===btn));x.tabIndex=x===btn?0:-1;});error('');update();}
    options.forEach((btn,i)=>{btn.addEventListener('click',()=>choose(btn));btn.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:2))%3;options[n].focus();choose(options[n]);});});
    $('submit').addEventListener('click',async()=>{
      if(busy||!selected||Date.now()<cooldown||receipt())return;
      if(!await ask(`确认投给 ${selected} 组？`,'提交后不可修改。全员共同投票，以票数决定挑战赛结果。','确认提交'))return;
      const choice=selected;busy=true;$('submit').disabled=true;$('submit').textContent='正在提交…';error('');
      try{
        save(':receipt',{status:'pending',team:choice,at:Date.now()});
        if(!PREVIEW){
          const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
          let r;try{r=await fetch(`${API}/hit/${NS}/group-${choice.toLowerCase()}`,{cache:'no-store',signal:controller.signal});}finally{clearTimeout(timer);}
          if(!r.ok){
            if(r.status>=400&&r.status<500){remove(':receipt');if(r.status===429){const reset=Number(r.headers.get('RateLimit-Reset'));cooldown=reset>0?Math.max(Date.now()+3000,reset*1000+1000):Date.now()+15000;setTimeout(update,Math.max(0,cooldown-Date.now())+100);}throw Error(r.status===429?'请求较多，请稍后再点提交；本次未记票。':'服务未接受本次投票，请稍后重试。');}
            throw Error('未收到服务确认。');
          }
          const d=await r.json();if(!Number.isSafeInteger(d.value)||d.value<1)throw Error('票数响应异常。');
        }
        save(':receipt',{status:'accepted',team:choice,at:Date.now()});finish(choice);
      }catch(e){if(read(':receipt')?.status==='pending')pending();else{error(e.message||'提交失败，请检查网络。');busy=false;update();}}
      finally{busy=false;if(!read(':receipt'))update();}
    });
    receipt();
  }
  async function ask(title,text,label){
    const before=document.activeElement,overlay=document.createElement('div');overlay.className='dialog-overlay';
    const box=document.createElement('section');box.className='dialog';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',title);
    const heading=document.createElement('h2');heading.textContent=title;const p=document.createElement('p');p.textContent=text;const controls=document.createElement('div');controls.className='controls';const cancel=document.createElement('button');cancel.textContent='再想一下';const ok=document.createElement('button');ok.className='primary';ok.textContent=label;controls.append(cancel,ok);box.append(heading,p,controls);overlay.append(box);document.body.append(overlay);$('app').inert=true;
    return new Promise(resolve=>{function close(value){$('app').inert=false;overlay.remove();before?.focus();resolve(value);}cancel.onclick=()=>close(false);ok.onclick=()=>close(true);overlay.onclick=e=>{if(e.target===overlay)close(false);};overlay.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close(false);}if(e.key==='Tab'){e.preventDefault();(document.activeElement===cancel?ok:cancel).focus();}};cancel.focus();});
  }
  function qrPage(){
    $('app').innerHTML=banner()+`<main class="stage">${header()}<div class="qr-layout"><section class="intro"><div class="eyebrow">AI 经营参谋挑战赛 · A / B / C</div><h1>你的这一票，<br>决定<span class="blue">挑战赛结果。</span></h1><p>听完 A、B、C 三组发布，<br>手机扫码，匿名三选一。</p><div class="steps"><div class="step"><span>1</span>选 A 组、B 组或 C 组</div><div class="step"><span>2</span>确认提交，本浏览器只投一次</div><div class="step"><span>3</span>等待现场公布投票结果</div></div><p class="fineprint align-left">全员共同投票 · 无需连接同一 Wi-Fi</p></section><aside class="qr-card"><img src="qrcode-vote.png" alt="扫码打开ABC三组正式投票页"><strong>扫码，投出你的选择</strong><p>${LIVE}vote.html</p><a href="${LIVE}vote.html">在此设备打开投票页 →</a></aside></div><footer class="stage-foot"><span>第七期一号位 AI 工作坊 · 2026.10.25</span><div class="tools"><a href="${link('result.html')}">查看结果大屏</a><button data-fullscreen class="small quiet">全屏展示</button></div></footer></main>`;
  }
  function resultPage(){
    $('app').innerHTML=banner()+`<main class="stage">${header()}<section class="stage-heading"><div><div class="eyebrow">AI 经营参谋挑战赛 · 全员共同投票</div><h1>你的一票，<span class="blue">决定结果。</span></h1><p>全员共同投票，票数决定挑战赛结果。实时领先不代表最终结果。</p></div><div class="counter"><strong id="total">—</strong>票已收到</div></section><div class="result-layout"><section class="panel"><div class="panel-top"><div><h2>各组票数</h2><small>你最认可哪一组的作品？</small></div><span class="tag">匿名 · 单选</span></div><div id="bars"><p class="empty">正在读取共享票数…</p></div></section><section class="panel"><div class="panel-top"><div><h2 id="result-heading">当前领先</h2><small>仅按 A／B／C 三组票数比较</small></div><span class="tag" id="result-tag">实时计票</span></div><div id="official" aria-live="polite"><div class="empty"><span class="empty-symbol">◇</span><strong>等待共享票数</strong><p>读取成功后显示领先情况；<br>同票不自动判定胜者。</p></div></div></section></div><footer class="stage-foot"><div><span id="connection">连接中…</span><br><span id="snapshot-status">共享票数实时读取；每 15 秒刷新</span></div><div class="tools"><a href="${link('vote-qr.html')}">投屏二维码</a><button class="small" id="refresh">刷新票数</button><button class="small" id="freeze">冻结本机结果</button><button class="small" id="export">导出票数 CSV</button><button class="small quiet" data-fullscreen>全屏展示</button></div></footer><details class="panel vote-details"><summary>现场截止与留档说明</summary><p class="host-intro">票数全网共享。请主持人口头宣布截止后，在本机冻结截止快照并导出 CSV；冻结只影响当前浏览器，不关闭共享计数接口，晚到票仍可能进入接口。实时状态只显示当前领先；冻结后展示本机截止快照的票数最高组。同票明确标注，待现场确认，不自动补判胜规则。更换浏览器不会同步本机截止快照。</p></details><div id="error" class="error-message" role="alert"></div></main>`;
    $('refresh').onclick=refresh;
    $('freeze').onclick=async()=>{
      try{
        if(frozen){
          if(!await ask('恢复实时票数？','这会解除本浏览器的截止快照，重新读取共享计数。','恢复实时'))return;
          remove(':snapshot');frozen=false;$('freeze').textContent='冻结本机结果';$('refresh').disabled=false;renderCounts(counts);refresh();
        }else if(counts&&await ask('冻结本机计票快照？','请先口头宣布截止。晚到票仍可能进入接口，但不计入这个冻结快照；冻结只影响本浏览器。','确认冻结')){
          const snap={counts:{...counts},at:new Date().toISOString()};save(':snapshot',snap);frozen=true;renderCounts(counts);snapshotLabel(snap);
        }
      }catch(_){error('本浏览器无法保存截止快照，请允许本地存储后重试。');}
    };
    $('export').onclick=exportCSV;
    const snap=read(':snapshot');if(validCounts(snap?.counts)){counts=snap.counts;frozen=true;renderCounts(counts);snapshotLabel(snap);}else refresh();
    setInterval(()=>{if(!document.hidden&&!frozen)refresh();},15000);
  }
  function validCounts(c){return c&&TEAMS.every(t=>Number.isSafeInteger(c[t])&&c[t]>=0);}
  function snapshotLabel(snap){$('freeze').textContent='恢复实时票数';$('refresh').disabled=true;$('snapshot-status').textContent='本机已冻结 · '+new Date(snap.at).toLocaleString('zh-CN');$('connection').textContent='当前展示截止快照（不是服务器关闭）';}
  async function getCount(team){const c=new AbortController(),timer=setTimeout(()=>c.abort(),12000);try{const r=await fetch(`${API}/get/${NS}/group-${team.toLowerCase()}`,{cache:'no-store',signal:c.signal});if(r.status===404)return 0;if(!r.ok)throw Error(r.status===429?'请求较多，稍后刷新':'计数服务暂不可用');const d=await r.json();if(!Number.isSafeInteger(d.value)||d.value<0)throw Error('票数格式异常');return d.value;}finally{clearTimeout(timer);}}
  async function refresh(){if(busy||frozen)return;busy=true;try{const values=PREVIEW?[6,5,3]:await Promise.all(TEAMS.map(getCount));if(frozen)return;counts=Object.fromEntries(TEAMS.map((t,i)=>[t,values[i]]));renderCounts(counts);$('connection').textContent=PREVIEW?'演示样票 · 不是真实结果':'共享计数连接正常';$('snapshot-status').textContent='更新于 '+new Date().toLocaleTimeString('zh-CN')+' · 每 15 秒刷新';}catch(e){$('connection').textContent=(e.message||'网络异常')+' · 保留最后结果，稍后重试';}finally{busy=false;}}
  function renderCounts(c){const total=TEAMS.reduce((n,t)=>n+c[t],0);$('total').textContent=total;$('bars').innerHTML=TEAMS.map(t=>{const p=total?c[t]/total*100:0;return `<div class="poll-row team-${t.toLowerCase()}"><div class="poll-label"><div class="poll-team"><span class="group-mini">${t}</span><strong>${t} 组</strong></div><div class="poll-value">${c[t]}<small>票 · ${p.toFixed(1)}%</small></div></div><div class="bar-track" role="img" aria-label="${t}组 ${c[t]}票"><div class="bar" data-percent="${p}"></div></div></div>`;}).join('');document.querySelectorAll('[data-percent]').forEach(el=>el.style.width=el.dataset.percent+'%');renderVoteResult(c);}
  function voteState(c){
    const total=TEAMS.reduce((n,t)=>n+c[t],0),max=Math.max(...TEAMS.map(t=>c[t]));
    const leaders=max>0?TEAMS.filter(t=>c[t]===max):[];
    return {total,max,leaders,tied:leaders.length>1};
  }
  function renderVoteResult(c){
    const {total,max,leaders,tied}=voteState(c);
    $('result-heading').textContent=frozen?'本机截止快照':'当前领先';
    $('result-tag').textContent=frozen?'仅本机冻结':'实时计票';
    if(!total){$('official').innerHTML='<div class="empty"><span class="empty-symbol">◇</span><strong>尚无投票</strong><p>0 票，不产生领先组或胜者。</p></div>';return;}
    const label=tied?(frozen?'同票，待现场确认':'并列领先 · 尚未截止'):(frozen?'票数最高 · 本机截止快照':'当前领先 · 尚未截止');
    const ranked=[...TEAMS].sort((a,b)=>c[b]-c[a]);
    $('official').innerHTML=`<div class="champion"><small>${label}</small>${leaders.map(t=>t+' 组').join(' ＋ ')}</div><p class="leader-votes">${max} <small>票 · ${(max/total*100).toFixed(1)}%</small></p>${ranked.map(t=>`<div class="rank-row"><strong>${t} 组</strong><div class="score">${c[t]}<small> 票</small></div></div>`).join('')}<p class="tiebreak">${tied?'同票不自动判胜，待现场确认。':frozen?'本机冻结时票数最高；以现场宣布的截止快照为准。':'投票仍在进行，当前领先不是最终结果。'}${frozen?' 冻结只影响本浏览器，不是服务器闭票。':''}</p>`;
  }
  function exportCSV(){
    if(!validCounts(counts)){error('请先成功读取票数。');return;}
    const {total,leaders,tied}=voteState(counts),snap=read(':snapshot');
    const status=t=>!total?'尚无投票':leaders.includes(t)?(tied?'同票，待现场确认':frozen?'票数最高（本机截止快照）':'当前领先（尚未截止）'):'—';
    const rows=[['ABC现场投票',PREVIEW?'演示数据':'正式共享计数','票数决定结果'],['数据状态',frozen?'本机截止快照（非服务器闭票）':'实时计数（尚未截止）'],['导出时间',new Date().toISOString()],['快照时间',frozen?snap?.at??'未知':'未冻结'],['总票数',total],['组别','票数','占比','状态'],...TEAMS.map(t=>[t+'组',counts[t],(total?counts[t]/total*100:0).toFixed(1)+'%',status(t)])];
    const quote=v=>'"'+String(v).replace(/"/g,'""')+'"';
    const blob=new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=PREVIEW?'ABC-演示.csv':'ABC-现场结果.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  ({vote:votePage,result:resultPage,qr:qrPage}[document.body.dataset.page]||votePage)();
  document.addEventListener('click',async e=>{if(!e.target.closest('[data-fullscreen]'))return;try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen?.();}catch(_){}});
})();
