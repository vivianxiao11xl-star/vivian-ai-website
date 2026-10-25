/* 沿用历期 GitHub Pages + Abacus 共享计数方式。没有任何管理密钥。 */
(() => {
  'use strict';
  const API='https://abacus.jasoncameron.dev';
  const NS='vivian-ws-20261025-abc-v1';
  const LIVE='https://vivianai.cn/workshop-07/';
  const PREVIEW=new URLSearchParams(location.search).get('preview')==='1';
  const KEY=NS+(PREVIEW?':preview':':live');
  const TEAMS=['A','B','C'];
  const DIMS=[['task','Agent 能完成一个任务',40],['value','解决了真实问题',20],['handoff','能使用、能交接',20],['launch','产品发布完整',20]];
  const $=id=>document.getElementById(id);
  let selected=null,busy=false,cooldown=0,counts=null,frozen=false;
  const link=file=>file+(PREVIEW?'?preview=1':'');
  function read(key){try{return JSON.parse(localStorage.getItem(KEY+key));}catch(_){return null;}}
  function save(key,value){localStorage.setItem(KEY+key,JSON.stringify(value));}
  function remove(key){localStorage.removeItem(KEY+key);}
  function banner(){return PREVIEW?'<aside class="demo-banner">演示模式 · 票数／评分为本浏览器样例，不计入正式投票。</aside>':'';}
  function header(){return `<header class="brandbar"><div class="brandwrap"><img class="brand-icon" src="favicon-vote.svg" alt=""><div class="brand">一号位 AI 工作坊<small>COHORT 07 · LIVE VOTE</small></div></div><span class="status-pill open">${PREVIEW?'演示页面':'现场投票'}</span></header>`;}
  function footer(){return '<footer class="footer"><span>2026.10.25 · 上海</span><span>A / B / C</span></footer>';}
  function error(text){if($('error'))$('error').textContent=text;}
  function receipt(){const r=read(':receipt');if(r?.status==='accepted'&&TEAMS.includes(r.team)){finish(r.team);return true;}if(r?.status==='pending'){pending();return true;}return false;}
  function pending(){document.querySelectorAll('.team-option').forEach(x=>x.disabled=true);$('submit').disabled=true;$('submit').textContent='提交状态待确认';error('网络没有返回确认，可能已经入票。请不要重复提交，直接告知讲师核对。');}
  function finish(team){$('voting').classList.add('hidden');$('success').classList.remove('hidden');$('receipt').textContent=`已投给 ${team} 组`;}
  function update(){if(!$('submit')||busy)return;$('submit').disabled=!selected||Date.now()<cooldown;$('submit').textContent=Date.now()<cooldown?'请求较多，请稍后再试':selected?`确认投给 ${selected} 组 →`:'选好一组，再投票';}
  function votePage(){
    $('app').innerHTML=banner()+`<main class="phone">${header()}<div id="voting"><section class="intro"><div class="eyebrow">AI 经营参谋挑战赛</div><h1>哪一组，<br>你最想让它<span class="blue">上岗？</span></h1><p>听完三组发布，选出你最想试用的一组。<br>这一票，只代表你对作品的期待。</p></section><div class="rules"><span class="rule">匿名 · 单选</span><span class="rule">提交后不可修改</span><span class="rule">人气不计冠军分</span></div><fieldset class="options" role="radiogroup" aria-labelledby="question"><legend id="question" class="question-label">如果下周就能试用，你选哪一组？</legend>${TEAMS.map((t,i)=>`<button class="team-option" type="button" role="radio" aria-checked="false" tabindex="${i===0?'0':'-1'}" data-team="${t}"><span class="letter">${t}</span><strong>${t} 组</strong><span class="radio" aria-hidden="true">✓</span></button>`).join('')}</fieldset><div class="vote-bottom"><button id="submit" class="primary" disabled>选好一组，再投票</button><p class="fineprint">本浏览器限投一次 · 不收集姓名<br>请听主持人宣布开始、截止；结果以现场为准。</p><div class="error-message" id="error" role="alert"></div></div></div><section class="success hidden" id="success" aria-live="polite"><div class="success-icon" aria-hidden="true">✓</div><h2>这一票，收到了。</h2><div class="receipt" id="receipt"></div><p>谢谢你认真看见每一组的作品。<br>提交后不可修改，请等待现场亮票。</p></section>${footer()}</main>`;
    const options=[...document.querySelectorAll('.team-option')];
    function choose(btn){if(busy||read(':receipt'))return;selected=btn.dataset.team;options.forEach(x=>{x.setAttribute('aria-checked',String(x===btn));x.tabIndex=x===btn?0:-1;});error('');update();}
    options.forEach((btn,i)=>{btn.addEventListener('click',()=>choose(btn));btn.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:2))%3;options[n].focus();choose(options[n]);});});
    $('submit').addEventListener('click',async()=>{
      if(busy||!selected||Date.now()<cooldown||receipt())return;
      if(!await ask(`确认投给 ${selected} 组？`,'提交后不可修改。本票只作匿名人气反馈，不计入综合冠军分。','确认提交'))return;
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
    $('app').innerHTML=banner()+`<main class="stage">${header()}<div class="qr-layout"><section class="intro"><div class="eyebrow">AI 经营参谋挑战赛 · A / B / C</div><h1>你的这一票，<br>投给<span class="blue">想用的作品。</span></h1><p>听完 A、B、C 三组发布，<br>手机扫码，匿名三选一。</p><div class="steps"><div class="step"><span>1</span>选 A 组、B 组或 C 组</div><div class="step"><span>2</span>确认提交，本浏览器只投一次</div><div class="step"><span>3</span>等待讲师现场亮票</div></div><p class="fineprint align-left">人气反馈不计冠军分 · 无需连接同一 Wi-Fi</p></section><aside class="qr-card"><img src="qrcode-vote.png" alt="扫码打开ABC三组正式投票页"><strong>扫码，投出你的选择</strong><p>${LIVE}vote.html</p><a href="${LIVE}vote.html">在此设备打开投票页 →</a></aside></div><footer class="stage-foot"><span>第七期一号位 AI 工作坊 · 2026.10.25</span><div class="tools"><a href="${link('result.html')}">查看结果大屏</a><button data-fullscreen class="small quiet">全屏展示</button></div></footer></main>`;
  }
  function resultPage(){
    $('app').innerHTML=banner()+`<main class="stage">${header()}<section class="stage-heading"><div><div class="eyebrow">AI 经营参谋挑战赛 · 现场亮票</div><h1>好作品，<span class="blue">被看见。</span></h1><p>人气看期待，冠军看实战。两套结果，分开展示。</p></div><div class="counter"><strong id="total">—</strong>份匿名反馈已收</div></section><div class="result-layout"><section class="panel"><div class="panel-top"><div><h2>学员人气</h2><small>如果下周就能试用，你选哪一组？</small></div><span class="tag">不计冠军分</span></div><div id="bars"><p class="empty">正在读取共享票数…</p></div></section><section class="panel"><div class="panel-top"><div><h2>评委成绩</h2><small>任务 40 · 真实问题 20 · 交接 20 · 发布 20</small></div><span class="tag">满分 100</span></div><div id="official"><div class="empty"><span class="empty-symbol">◇</span><strong>实战成绩，稍后揭晓</strong><p>评委独立评分，冠军由现场公布。<br>人气票数不折算为分数。</p></div></div></section></div><footer class="stage-foot"><div><span id="connection">连接中…</span><br><span id="snapshot-status">共享票数实时读取；每 15 秒刷新</span></div><div class="tools"><a href="${link('vote-qr.html')}">投屏二维码</a><button class="small" id="refresh">刷新票数</button><button class="small" id="freeze">冻结本机结果</button><button class="small quiet" data-fullscreen>全屏展示</button></div></footer><details class="panel judge-details"><summary>讲师评分与导出 · 仅保存在本浏览器</summary><p class="host-intro">沿用历期方式：票数全网共享；下面录入的评委成绩仅在本浏览器保存，不会修改其他人的页面。多位评委时先计算各项平均分再录入。听主持人口头宣布截止后，可冻结本机票数留档；这不关闭共享计数接口。</p><form id="scores"><div class="score-grid">${TEAMS.map(t=>`<section class="score-team team-${t.toLowerCase()}"><h3><span class="group-mini">${t}</span>${t} 组</h3>${DIMS.map(d=>`<label class="score-field" for="${t}-${d[0]}"><span>${d[1]}<small>满分 ${d[2]} 分</small></span><input id="${t}-${d[0]}" type="number" min="0" max="${d[2]}" step="any" placeholder="—" required></label>`).join('')}</section>`).join('')}</div><div class="controls"><button type="submit" class="primary">保存并在本屏公布评委成绩</button><button type="button" id="hide-scores">收起本屏成绩</button><button type="button" id="export">导出本机汇总 CSV</button></div></form><div id="error" class="error-message" role="alert"></div></details></main>`;
    const saved=read(':scores');if(saved){TEAMS.forEach(t=>DIMS.forEach(d=>{$(`${t}-${d[0]}`).value=saved[t]?.[d[0]]??'';}));if(read(':published'))renderScores(saved);}
    $('scores').addEventListener('submit',e=>{e.preventDefault();if(!$('scores').reportValidity())return;const s=Object.fromEntries(TEAMS.map(t=>[t,Object.fromEntries(DIMS.map(d=>[d[0],Number($(`${t}-${d[0]}`).value)]))]));try{save(':scores',s);save(':published',true);renderScores(s);error('已保存并在本屏公布。');}catch(_){error('本浏览器无法保存，请允许本地存储。');}});
    $('hide-scores').onclick=()=>{remove(':published');$('official').innerHTML='<div class="empty"><strong>评委成绩待现场公布</strong><p>人气票数不计冠军分。</p></div>';};
    $('refresh').onclick=refresh;
    $('freeze').onclick=async()=>{if(frozen){if(!await ask('恢复实时票数？','这会解除本浏览器的截止快照，重新读取共享计数。','恢复实时'))return;remove(':snapshot');frozen=false;$('freeze').textContent='冻结本机结果';$('refresh').disabled=false;refresh();}else if(counts&&await ask('冻结本机计票快照？','请先口头宣布截止。晚到票仍可能进入接口，但不计入这个冻结快照；冻结只影响本浏览器。','确认冻结')){const snap={counts,at:new Date().toISOString()};save(':snapshot',snap);frozen=true;renderCounts(counts);snapshotLabel(snap);}};
    $('export').onclick=exportCSV;
    const snap=read(':snapshot');if(snap?.counts){counts=snap.counts;frozen=true;renderCounts(counts);snapshotLabel(snap);}else refresh();
    setInterval(()=>{if(!document.hidden&&!frozen)refresh();},15000);
  }
  function snapshotLabel(snap){$('freeze').textContent='恢复实时票数';$('refresh').disabled=true;$('snapshot-status').textContent='本机已冻结 · '+new Date(snap.at).toLocaleString('zh-CN');$('connection').textContent='当前展示截止快照（不是服务器关闭）';}
  async function getCount(team){const c=new AbortController(),timer=setTimeout(()=>c.abort(),12000);try{const r=await fetch(`${API}/get/${NS}/group-${team.toLowerCase()}`,{cache:'no-store',signal:c.signal});if(r.status===404)return 0;if(!r.ok)throw Error(r.status===429?'请求较多，稍后刷新':'计数服务暂不可用');const d=await r.json();if(!Number.isSafeInteger(d.value)||d.value<0)throw Error('票数格式异常');return d.value;}finally{clearTimeout(timer);}}
  async function refresh(){if(busy||frozen)return;busy=true;try{const values=PREVIEW?[6,5,3]:await Promise.all(TEAMS.map(getCount));counts=Object.fromEntries(TEAMS.map((t,i)=>[t,values[i]]));renderCounts(counts);$('connection').textContent=PREVIEW?'演示样票 · 不是真实结果':'共享计数连接正常';$('snapshot-status').textContent='更新于 '+new Date().toLocaleTimeString('zh-CN')+' · 每 15 秒刷新';}catch(e){$('connection').textContent=(e.message||'网络异常')+' · 保留最后结果，稍后重试';}finally{busy=false;}}
  function renderCounts(c){const total=TEAMS.reduce((n,t)=>n+c[t],0);$('total').textContent=total;$('bars').innerHTML=TEAMS.map(t=>{const p=total?c[t]/total*100:0;return `<div class="poll-row team-${t.toLowerCase()}"><div class="poll-label"><div class="poll-team"><span class="group-mini">${t}</span><strong>${t} 组</strong></div><div class="poll-value">${c[t]}<small>票 · ${p.toFixed(1)}%</small></div></div><div class="bar-track" role="img" aria-label="${t}组 ${c[t]}票"><div class="bar" data-percent="${p}"></div></div></div>`;}).join('');document.querySelectorAll('[data-percent]').forEach(el=>el.style.width=el.dataset.percent+'%');}
  function renderScores(s){const r=TEAMS.map(t=>({team:t,total:DIMS.reduce((n,d)=>n+s[t][d[0]],0),task:s[t].task})).sort((a,b)=>Math.abs(b.total-a.total)>1e-8?b.total-a.total:b.task-a.task);const winners=r.filter(x=>Math.abs(x.total-r[0].total)<1e-8&&Math.abs(x.task-r[0].task)<1e-8);$('official').innerHTML=`<div class="champion"><small>${winners.length>1?'并列综合冠军':'综合冠军'} · 讲师本机公布</small>${winners.map(x=>x.team+' 组').join(' ＋ ')}</div>${r.map(x=>`<div class="rank-row"><strong>${x.team} 组</strong><div class="score">${x.total.toFixed(1)}<small> / 100</small></div></div>`).join('')}<p class="tiebreak">只按评委分计算。同分先看任务项，仍相同则并列。分数仅保存在当前浏览器；学员人气不计冠军。</p>`;}
  function exportCSV(){if(!counts){error('请先成功读取票数。');return;}const s=read(':scores');const rows=[['ABC现场投票',PREVIEW?'演示数据':'正式共享计数',frozen?'本机截止快照':'导出时实时计数'],['组别','人气票数（不计冠军）',...DIMS.map(d=>d[1]),'评委总分'],...TEAMS.map(t=>[t+'组',counts[t],...DIMS.map(d=>s?.[t]?.[d[0]]??'未评分'),s?.[t]?DIMS.reduce((n,d)=>n+s[t][d[0]],0):'未评分'])];const blob=new Blob(['\ufeff'+rows.map(r=>r.join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=PREVIEW?'ABC-演示.csv':'ABC-现场结果.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  ({vote:votePage,result:resultPage,qr:qrPage}[document.body.dataset.page]||votePage)();
  document.addEventListener('click',async e=>{if(!e.target.closest('[data-fullscreen]'))return;try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen?.();}catch(_){}});
})();
