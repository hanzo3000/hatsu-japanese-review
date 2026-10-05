(()=>{
  // v4.2.0 UI/navigation layer. Data has already been reconciled before the base app starts.
  ui.similarOnly=false;

  const typedAll=()=>wordData().map(x=>Object.assign({_kind:'word'},x)).concat(
    phraseData().map(x=>Object.assign({_kind:x.section==='idiom'?'idiom':'phrase'},x))
  );
  const hasSimilarity=item=>{
    const tags=(item.tags||[]).join('|');
    return (Array.isArray(item.similar)&&item.similar.some(Boolean))||/(近义词|近義詞|易混|使い分け)/.test(tags);
  };

  function addViewButton(seg,view,label,beforeView){
    if(!seg||seg.querySelector(`[data-view="${view}"]`))return;
    const b=document.createElement('button');
    b.className='seg-btn'; b.dataset.view=view; b.textContent=label;
    const before=beforeView?seg.querySelector(`[data-view="${beforeView}"]`):null;
    seg.insertBefore(b,before||seg.firstChild||null);
    b.addEventListener('click',()=>{ui.view=view;ui.limit=60;render()});
  }
  addViewButton(document.getElementById('viewSegment'),'all','全部','words');
  addViewButton(document.getElementById('mobileViewSegment'),'all','全部','words');

  // Rename the ordinary phrase section to “短语”; “俗语” stays separate.
  document.querySelectorAll('[data-view="phrases"]').forEach(b=>b.textContent='短语');
  document.querySelectorAll('.stat span').forEach(s=>{if(/词组|詞組/.test(s.textContent))s.textContent='短语'});
  const phraseOpt=document.querySelector('#fType option[value="phrase"]'); if(phraseOpt)phraseOpt.textContent='短语 / 表达';

  function addSimilarFilter(panel){
    if(!panel||panel.querySelector('[data-similar]'))return;
    const label=document.createElement('div');label.className='side-label';label.textContent='学习关系';
    const row=document.createElement('div');row.className='filter-row';
    const b=document.createElement('button');b.className='chip-btn';b.dataset.similar='1';b.textContent='⇄ 近义词・易混';
    b.addEventListener('click',()=>{ui.similarOnly=!ui.similarOnly;ui.limit=60;render()});
    row.appendChild(b);panel.appendChild(label);panel.appendChild(row);
  }
  addSimilarFilter(document.querySelector('.sidebar .side-panel'));
  addSimilarFilter(document.querySelector('.mobile-filters'));

  currentItems=function(){
    let arr;
    if(ui.view==='all') arr=typedAll();
    else if(ui.view==='words') arr=wordData().map(x=>Object.assign({_kind:'word'},x));
    else if(ui.view==='phrases') arr=phraseData().filter(x=>x.section!=='idiom').map(x=>Object.assign({_kind:'phrase'},x));
    else if(ui.view==='idioms') arr=phraseData().filter(x=>x.section==='idiom').map(x=>Object.assign({_kind:'idiom'},x));
    else arr=typedAll();

    arr=arr.filter(item=>{
      if(ui.view==='favorites'){
        if(!isFav(item.id)||isDeleted(item.id))return false;
      }else if(ui.view==='deleted'){
        if(!isDeleted(item.id))return false;
      }else if(isDeleted(item.id))return false;
      if(ui.similarOnly&&!hasSimilarity(item))return false;
      return sourceMatch(item)&&freqMatch(item)&&searchMatch(item);
    });
    arr.sort((a,b)=>{
      if(ui.sort==='project'){
        const sa=a.source==='project'?0:(a.source==='custom'?1:2), sb=b.source==='project'?0:(b.source==='custom'?1:2);
        if(sa!==sb)return sa-sb;
        return (b.freq||0)-(a.freq||0);
      }
      if(ui.sort==='term')return String(a.term||'').localeCompare(String(b.term||''),'ja');
      const fd=(b.freq||0)-(a.freq||0);
      return fd||String(a.term||'').localeCompare(String(b.term||''),'ja');
    });
    return arr;
  };

  updateHero=function(){
    const map={
      all:['ALL REVIEW','全部','单词、短语和俗语统一显示与搜索；不需要先判断一个表达属于哪一类。'],
      words:['PROJECT REVIEW','单词','已清洗、去重并补全：平假名、常用搭配、日常例句；动词尽量保留真正常用的变形与语感。'],
      phrases:['DAILY JAPANESE','短语 / 日常表达','日常口语、句型、语气和固定搭配。谚语、惯用句等单独整理到“俗语”。'],
      idioms:['ことわざ・慣用句','俗语','谚语、惯用句、惯用表达、格言与文化表达；按实际含义、语气和使用场景整理。'],
      favorites:['QUICK REVIEW','收藏夹','把还没记牢的内容集中起来快速复习。'],
      deleted:['ARCHIVE','已删除','这里不会出现在正常复习列表，可随时恢复。']
    };
    const [k,t,d]=map[ui.view]||map.all;
    document.getElementById('heroKicker').textContent=k;
    document.getElementById('heroTitle').textContent=t;
    document.getElementById('heroDesc').textContent=d;
  };

  const prevSync=syncControls;
  syncControls=function(){
    prevSync();
    document.querySelectorAll('[data-similar]').forEach(b=>b.classList.toggle('active',!!ui.similarOnly));
  };

  // Keep card category wording consistent with the top navigation.
  const prevCardHTML=cardHTML;
  cardHTML=function(item){
    let h=prevCardHTML(item);
    if(item._kind==='phrase')h=h.replace(/词组/g,'短语').replace(/詞組/g,'短语');
    return h;
  };

  document.title='日本語复习本 v4.2.0';
  const brand=document.querySelector('.brand h1');if(brand)brand.textContent='日本語复习本';
  const small=document.querySelector('.brand small');if(small)small.textContent='Project Q&A + 既有词表 · v4.2.0 · 本地保存';
  const banner=document.querySelector('.curation-banner');
  if(banner)banner.innerHTML='<b>v4.2.0 整理版：</b>Excel Word 的 1173 条原始数据已逐行比对。不是机械复制成 1173 张卡：重复项、活用形、短语型内容、资料不足或疑似误记会合并或暂缓；本次同时补回此前漏掉的有效单词。';

  const info=document.getElementById('infoModal');
  if(info){
    const body=info.querySelector('.modal');
    if(body){
      const h=body.querySelector('h3');if(h)h.textContent='v4.2.0 怎么整理';
      body.querySelectorAll('.modal-sub').forEach(x=>x.remove());
      const actions=body.querySelector('.modal-actions');
      const blocks=[
        '<b>数据范围：</b>Excel 仍只使用 <b>Word</b> 与 <b>Phrase</b> 两个 tab；并合并 Project 中截至 <b>2026-10-05</b> 的日语学习提问。',
        '<b>Word 全量核对：</b>原始 Word 共 1173 条，已逐行与网页词库比对。重复、活用形、句子/短语型内容、明显误记或信息不足项不会机械生成卡片。',
        '<b>本版规模：</b>806 个单词、250 个短语、44 个俗语，共 1100 张内建学习卡。',
        '<b>易混词：</b>新增“⇄ 近义词・易混”筛选；例如 かなり / けっこう / だいぶ、絡む / 絡まる 等会保留区别说明。',
        '<b>俗语：</b>ことわざ、慣用句、慣用表現、格言等从普通短语中分开；例如「毒を食らわば皿まで」「雲泥の差」。',
        '<b>最近修正：</b>Excel 中的「絡む／絡まれる」与例句「糸が絡まって…」已重新整理为独立的「絡む」和「絡まる」，不再把被动形与自动词混在一起。'
      ];
      blocks.reverse().forEach(html=>{const p=document.createElement('p');p.className='modal-sub';p.innerHTML=html;body.insertBefore(p,actions)});
    }
  }

  // Default entry: all built-in content, all sources.
  ui.view='all'; ui.source='all'; ui.limit=60;
  render();
})();