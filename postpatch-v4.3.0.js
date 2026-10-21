(()=>{
  const VERSION='v4.3.0';
  const DAY=86400000;
  state.learning=state.learning&&typeof state.learning==='object'?state.learning:{};
  state.removalSignals=state.removalSignals&&typeof state.removalSignals==='object'?state.removalSignals:{};
  ui.reviewWindow=ui.reviewWindow||'all';
  ui.randomScope=ui.randomScope||'all';
  ui.randomTarget=ui.randomTarget||10;
  let randomSession=null;

  const css=document.createElement('style');
  css.textContent=`
    .review-window-row{display:flex;gap:6px;flex-wrap:wrap}
    .review-window-row .chip-btn{min-width:52px}
    .cards.random-mode{grid-template-columns:1fr}
    .random-shell{max-width:820px;margin:0 auto;width:100%}
    .random-tools{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
    .random-tools select{border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px 10px}
    .random-card{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:24px;box-shadow:var(--shadow)}
    .random-progress{font-size:12px;color:var(--muted);margin-bottom:18px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .random-term{font-size:34px;font-weight:850;line-height:1.35;text-align:center;margin:20px 0 8px;word-break:break-word}
    .random-hint{text-align:center;color:var(--muted);font-size:13px;line-height:1.6;margin-bottom:22px}
    .random-answer{border-top:1px dashed var(--line);margin-top:18px;padding-top:18px}
    .random-answer .reading{font-size:14px;margin-bottom:8px;text-align:center}
    .random-answer .meaning{font-size:16px;text-align:center;margin:10px 0 18px}
    .random-answer .examples{max-width:680px;margin:0 auto 14px}
    .random-actions{display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin-top:18px}
    .random-actions .btn{min-width:118px}
    .random-actions .known{background:var(--accent);color:#fff;border-color:var(--accent)}
    .random-actions .missed{border-color:#d9aaa3;color:#8c4039}
    .random-actions .skip{color:var(--muted)}
    .random-summary{text-align:center;padding:30px 12px}
    .random-summary h3{font-size:25px;margin:0 0 8px}
    .random-summary p{color:var(--muted);line-height:1.7}
    .review-badge{display:inline-flex;align-items:center;gap:4px;border-radius:999px;background:#edf3ef;border:1px solid #cfded6;padding:5px 8px;font-size:11px;color:#31594d;font-weight:750;margin-left:6px}
    @media(max-width:620px){.random-card{padding:18px}.random-term{font-size:28px}.random-tools select{flex:1;min-width:130px}}
  `;
  document.head.appendChild(css);

  function itemDate(item){
    if(!item)return null;
    if(item.createdAt){const d=new Date(item.createdAt);if(!isNaN(d))return d}
    const id=String(item.id||'');
    let m=id.match(/proj-(\d{4})(\d{2})(\d{2})-/);
    if(m)return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
    m=id.match(/^custom-(\d{13})-/);
    if(m)return new Date(Number(m[1]));
    const text=[item.asked,item.notes,item.note].filter(Boolean).join(' ');
    m=text.match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if(m)return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
    return null;
  }
  function ageDays(item){const d=itemDate(item);return d?Math.floor((Date.now()-d.getTime())/DAY):Infinity}
  function learnRec(id){
    if(!state.learning[id])state.learning[id]={known:0,missed:0,streak:0,lastReviewed:null,nextDue:null};
    return state.learning[id];
  }
  function removalCount(id){return Number((state.removalSignals[id]||{}).count)||0}
  function markRemoved(id,source){
    const old=state.removalSignals[id]||{};
    state.removalSignals[id]={count:(Number(old.count)||0)+1,lastRemoved:new Date().toISOString(),source:source||old.source||'list'};
  }
  function isRecent(item,days){const a=ageDays(item);return Number.isFinite(a)&&a>=0&&a<=days}
  function isDue(item){
    const r=state.learning[item.id];
    if(r&&r.nextDue)return new Date(r.nextDue).getTime()<=Date.now();
    return isRecent(item,60);
  }

  function addReviewFilters(panel){
    if(!panel||panel.querySelector('[data-review-window]'))return;
    const label=document.createElement('div');label.className='side-label';label.textContent='复习周期';
    const row=document.createElement('div');row.className='review-window-row';
    [['all','不限'],['7','7天'],['30','30天'],['60','60天'],['due','到期']].forEach(([v,t])=>{
      const b=document.createElement('button');b.className='chip-btn';b.dataset.reviewWindow=v;b.textContent=t;
      b.addEventListener('click',()=>{ui.reviewWindow=v;ui.limit=60;if(ui.view==='random')ui.view='all';render()});
      row.appendChild(b);
    });
    panel.appendChild(label);panel.appendChild(row);
    const note=document.createElement('p');note.className='notice';note.textContent='7/30/60天按内容加入日期筛选；“到期”结合你的自测记录。';panel.appendChild(note);
  }
  addReviewFilters(document.querySelector('.sidebar .side-panel'));
  addReviewFilters(document.querySelector('.mobile-filters'));

  function addRandomButton(seg){
    if(!seg||seg.querySelector('[data-view="random"]'))return;
    const b=document.createElement('button');b.className='seg-btn';b.dataset.view='random';b.textContent='🎲 Random';
    b.addEventListener('click',()=>{ui.view='random';ui.reviewWindow='all';startRandomSession();render()});
    seg.appendChild(b);
  }
  addRandomButton(document.getElementById('viewSegment'));
  addRandomButton(document.getElementById('mobileViewSegment'));

  const baseCurrentItems=currentItems;
  currentItems=function(){
    if(ui.view==='random')return [];
    let arr=baseCurrentItems();
    if(ui.reviewWindow==='7')arr=arr.filter(x=>isRecent(x,7));
    else if(ui.reviewWindow==='30')arr=arr.filter(x=>isRecent(x,30));
    else if(ui.reviewWindow==='60')arr=arr.filter(x=>isRecent(x,60));
    else if(ui.reviewWindow==='due')arr=arr.filter(isDue).sort((a,b)=>{
      const ra=state.learning[a.id]||{}, rb=state.learning[b.id]||{};
      const da=ra.nextDue?new Date(ra.nextDue).getTime():0, db=rb.nextDue?new Date(rb.nextDue).getTime():0;
      return da-db;
    });
    return arr;
  };

  const baseSync=syncControls;
  syncControls=function(){
    baseSync();
    document.querySelectorAll('[data-review-window]').forEach(b=>b.classList.toggle('active',b.dataset.reviewWindow===String(ui.reviewWindow)));
    document.querySelectorAll('[data-view="random"]').forEach(b=>b.classList.toggle('active',ui.view==='random'));
  };

  const baseHero=updateHero;
  updateHero=function(){
    if(ui.view==='random'){
      document.getElementById('heroKicker').textContent='ACTIVE RECALL';
      document.getElementById('heroTitle').textContent='🎲 Random 自测';
      document.getElementById('heroDesc').textContent='先回忆意思、读音和用法，再显示答案。答错会更快回来；反复移除的词会大幅降权。';
      return;
    }
    baseHero();
    if(ui.reviewWindow!=='all'){
      const t=ui.reviewWindow==='due'?'到期复习':`最近 ${ui.reviewWindow} 天`;
      const title=document.getElementById('heroTitle');
      if(title&&!title.querySelector('.review-badge'))title.insertAdjacentHTML('beforeend',`<span class="review-badge">${t}</span>`);
    }
  };

  const baseDelete=deleteItem;
  deleteItem=function(id){markRemoved(id,'list');baseDelete(id)};

  const baseStateForExport=stateForExport;
  stateForExport=function(){
    const x=baseStateForExport();
    x.version=2;x.learning=state.learning;x.removalSignals=state.removalSignals;return x;
  };
  importCode=function(){
    const raw=document.getElementById('codeBox').value.trim();
    if(!raw){showToast('请贴入 Export Code');return}
    try{
      const obj=b64DecodeUnicode(raw);if(obj.app!=='hatsuon-japanese-notebook')throw new Error('wrong app');
      state=Object.assign(defaultState(),{
        favorites:Array.isArray(obj.favorites)?obj.favorites:[],deleted:Array.isArray(obj.deleted)?obj.deleted:[],
        customWords:Array.isArray(obj.customWords)?obj.customWords:[],customPhrases:Array.isArray(obj.customPhrases)?obj.customPhrases:[],
        edits:obj.edits&&typeof obj.edits==='object'?obj.edits:{},
        learning:obj.learning&&typeof obj.learning==='object'?obj.learning:{},
        removalSignals:obj.removalSignals&&typeof obj.removalSignals==='object'?obj.removalSignals:{}
      });
      saveState();closeModal('backupModal');render();showToast('备份已恢复');
    }catch(e){showToast('Code 无法读取，请确认是否完整')}
  };
  const importBtnOld=document.getElementById('importBtn');
  if(importBtnOld){const importBtnNew=importBtnOld.cloneNode(true);importBtnOld.replaceWith(importBtnNew);importBtnNew.addEventListener('click',importCode)}

  function typedAll(){
    return wordData().map(x=>Object.assign({_kind:'word'},x)).concat(
      phraseData().map(x=>Object.assign({_kind:x.section==='idiom'?'idiom':'phrase'},x))
    );
  }
  function eligiblePool(){
    let arr=typedAll().filter(x=>!isDeleted(x.id));
    if(ui.randomScope==='word')arr=arr.filter(x=>x._kind==='word');
    else if(ui.randomScope==='phrase')arr=arr.filter(x=>x._kind==='phrase');
    else if(ui.randomScope==='idiom')arr=arr.filter(x=>x._kind==='idiom');
    else if(ui.randomScope==='recent60')arr=arr.filter(x=>isRecent(x,60));
    else if(ui.randomScope==='missed')arr=arr.filter(x=>(state.learning[x.id]||{}).missed>0);
    return arr;
  }
  function weight(item){
    const r=state.learning[item.id]||{};
    let w=1;
    const a=ageDays(item);
    if(a<=7)w*=4;else if(a<=30)w*=2.4;else if(a<=60)w*=1.6;
    if((r.missed||0)>0)w*=1+Math.min(4,r.missed||0)*0.85;
    if(r.lastResult==='missed')w*=2.2;
    if(r.nextDue&&new Date(r.nextDue).getTime()<=Date.now())w*=1.8;
    if(isFav(item.id))w*=1.45;
    w/=1+Math.min(8,r.streak||0)*0.38;
    const rem=removalCount(item.id);
    if(rem===1)w*=0.12;else if(rem===2)w*=0.03;else if(rem>=3)w*=0.006;
    return Math.max(0.0001,w);
  }
  function weightedPick(arr){
    if(!arr.length)return null;
    const ws=arr.map(weight),total=ws.reduce((a,b)=>a+b,0);let n=Math.random()*total;
    for(let i=0;i<arr.length;i++){n-=ws[i];if(n<=0)return arr[i]}
    return arr[arr.length-1];
  }
  function startRandomSession(){
    randomSession={answered:0,known:0,missed:0,removed:0,seen:new Set(),current:null,revealed:false,finished:false};
    pickNext();
  }
  function pickNext(){
    if(!randomSession)startRandomSession();
    let pool=eligiblePool().filter(x=>!randomSession.seen.has(x.id));
    if(!pool.length){randomSession.seen.clear();pool=eligiblePool()}
    randomSession.current=weightedPick(pool);randomSession.revealed=false;
  }
  function sessionLimitReached(){return Number.isFinite(ui.randomTarget)&&ui.randomTarget>0&&randomSession.answered>=ui.randomTarget}
  window.randomReveal=function(){if(!randomSession)return;randomSession.revealed=true;renderRandom()};
  window.randomRate=function(result){
    if(!randomSession||!randomSession.current)return;
    const item=randomSession.current,r=learnRec(item.id),now=new Date();
    r.lastReviewed=now.toISOString();r.lastResult=result;
    if(result==='known'){
      r.known=(r.known||0)+1;r.streak=(r.streak||0)+1;randomSession.known++;
      const days=r.streak<=1?7:r.streak===2?30:r.streak===3?60:90;
      r.nextDue=new Date(now.getTime()+days*DAY).toISOString();
    }else{
      r.missed=(r.missed||0)+1;r.streak=0;randomSession.missed++;
      r.nextDue=new Date(now.getTime()+DAY).toISOString();
    }
    state.learning[item.id]=r;randomSession.answered++;randomSession.seen.add(item.id);saveState();
    if(sessionLimitReached()){randomSession.finished=true;renderRandom()}else{pickNext();renderRandom()}
  };
  window.randomRemove=function(){
    if(!randomSession||!randomSession.current)return;
    const id=randomSession.current.id;markRemoved(id,'quiz');
    const r=learnRec(id);r.lastReviewed=new Date().toISOString();r.lastResult='removed';r.nextDue=new Date(Date.now()+180*DAY).toISOString();
    state.learning[id]=r;randomSession.removed++;randomSession.answered++;randomSession.seen.add(id);saveState();
    showToast('已降低这个词今后的自测出现率');
    if(sessionLimitReached()){randomSession.finished=true;renderRandom()}else{pickNext();renderRandom()}
  };
  window.randomRestart=function(){startRandomSession();renderRandom()};
  window.setRandomScope=function(v){ui.randomScope=v;startRandomSession();renderRandom()};
  window.setRandomTarget=function(v){ui.randomTarget=v==='inf'?Infinity:Number(v)||10;startRandomSession();renderRandom()};

  function randomAnswerHTML(item){
    const examples=(item.examples||[]).filter(Boolean).slice(0,3);
    const similar=(item.similar||[]).filter(Boolean).slice(0,3);
    return `<div class="random-answer">
      ${item.reading?`<div class="reading">${esc(item.reading)}</div>`:''}
      <div class="meaning">${esc(item.meaning||'')}</div>
      ${examples.length?`<div class="section-title">例句</div><ol class="examples">${examples.map(x=>`<li>${exampleHTML(x)}</li>`).join('')}</ol>`:''}
      ${similar.length?`<div class="section-title">近义词・易混</div><div class="common-list">${similar.map(x=>`<span class="micro">${esc(x)}</span>`).join('')}</div>`:''}
      <div class="random-actions">
        <button class="btn known" onclick="randomRate('known')">✓ 记得</button>
        <button class="btn missed" onclick="randomRate('missed')">× 忘了</button>
        <button class="btn skip" onclick="randomRemove()">暂不考这个</button>
      </div>
    </div>`;
  }
  function scopeLabel(v){return {all:'全部',word:'单词',phrase:'短语',idiom:'俗语',recent60:'最近60天',missed:'只抽答错'}[v]||'全部'}
  function renderRandom(){
    syncControls();updateHero();updateStats();
    const root=document.getElementById('cards');root.classList.add('random-mode');
    document.getElementById('loadMore').classList.remove('show');
    document.querySelector('.search-wrap').style.visibility='hidden';
    if(!randomSession)startRandomSession();
    const limitText=Number.isFinite(ui.randomTarget)?String(ui.randomTarget):'∞';
    if(randomSession.finished){
      root.innerHTML=`<div class="random-shell"><div class="random-card random-summary"><h3>这一轮完成</h3><p>共 ${randomSession.answered} 题 · ✓ ${randomSession.known} · × ${randomSession.missed} · 暂不考 ${randomSession.removed}</p><button class="btn primary" onclick="randomRestart()">再来一轮</button></div></div>`;
      document.getElementById('resultCount').textContent='Random 自测完成';return;
    }
    const item=randomSession.current;
    if(!item){
      root.innerHTML='<div class="empty">这个范围暂时没有可自测的内容。</div>';document.getElementById('resultCount').textContent='0 个可自测条目';return;
    }
    root.innerHTML=`<div class="random-shell">
      <div class="random-tools">
        <select onchange="setRandomScope(this.value)" aria-label="自测范围">
          ${[['all','全部'],['word','单词'],['phrase','短语'],['idiom','俗语'],['recent60','最近60天'],['missed','只抽答错']].map(([v,t])=>`<option value="${v}" ${ui.randomScope===v?'selected':''}>${t}</option>`).join('')}
        </select>
        <select onchange="setRandomTarget(this.value)" aria-label="题数">
          ${[['10','10题'],['20','20题'],['inf','无限']].map(([v,t])=>`<option value="${v}" ${(v==='inf'&&!Number.isFinite(ui.randomTarget))||Number(v)===ui.randomTarget?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="random-card">
        <div class="random-progress"><span>${scopeLabel(ui.randomScope)} · ${randomSession.answered+1} / ${limitText}</span><span>✓ ${randomSession.known}　× ${randomSession.missed}</span></div>
        <div class="random-term">${esc(item.term)}</div>
        <div class="random-hint">先自己说：是什么意思？怎么读？能不能造一句？</div>
        ${randomSession.revealed?randomAnswerHTML(item):`<div class="random-actions"><button class="btn primary" onclick="randomReveal()">显示答案</button><button class="btn skip" onclick="randomRemove()">暂不考这个</button></div>`}
      </div>
    </div>`;
    document.getElementById('resultCount').textContent=`${eligiblePool().length.toLocaleString()} 个可自测条目`;
  }

  const baseRender=render;
  render=function(){
    if(ui.view==='random')return renderRandom();
    document.getElementById('cards').classList.remove('random-mode');
    const sw=document.querySelector('.search-wrap');if(sw)sw.style.visibility='visible';
    baseRender();
  };

  document.title='日本語复习本 '+VERSION;
  const brand=document.querySelector('.brand h1');if(brand)brand.textContent='日本語复习本';
  const small=document.querySelector('.brand small');if(small)small.textContent='Project Q&A + 既有词表 · '+VERSION+' · 本地保存';
  const banner=document.querySelector('.curation-banner');
  if(banner)banner.innerHTML='<b>'+VERSION+' 学习模式：</b>新增 7 / 30 / 60 天复习筛选、到期复习和 Random 自测。答错内容会提高复习权重；在列表或自测中反复移除的词会持续降权，尽量不再打扰你。';
  const info=document.getElementById('infoModal');
  if(info){const h=info.querySelector('.modal h3');if(h)h.textContent=VERSION+' 怎么学习'}
  const status=document.getElementById('saveStatus');if(status)status.textContent='✓ 收藏 / 删除 / 自测进度会自动保存在此浏览器';
  saveState();render();
})();