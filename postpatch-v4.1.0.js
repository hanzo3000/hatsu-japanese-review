(()=>{
  const tradMap={
    '單詞':'单词','詞組':'词组','詞組 / 表達':'词组 / 表达','詞組 / 俗語 / 日常表達':'词组 / 日常表达','已刪除':'已删除','來源':'来源','來源說明':'来源说明','詞頻':'词频','詞頻 / 優先級':'词频 / 优先级','高頻優先':'高频优先','Project 優先':'Project 优先','五十音 / 名稱':'五十音 / 名称','載入中…':'加载中…','顯示更多':'显示更多','編輯內容':'编辑内容','添加新內容':'添加新内容','類型':'类型','常見變形':'常见变形','補充筆記':'补充笔记','備份 Code':'备份 Code','複製':'复制','恢復':'恢复','關閉':'关闭','這一版怎麼整理':'这一版怎么整理','知道了':'知道了','日常學習優先級（估算）':'日常学习优先级（估算）','Project 回顧':'Project 回顾','Excel 整理済':'Excel 已整理','意思 / 使用差異':'意思 / 使用差异','常用表達 / 搭配':'常用表达 / 搭配','例句 / 原學習語境':'例句 / 原学习语境','從 Project 對話整理':'从 Project 对话整理','已從原詞表整理成學習卡':'已从原词表整理成学习卡','你當時問過：':'你当时问过：','整理註記：':'整理注记：','收藏夾':'收藏夹','沒有符合條件的條目。':'没有符合条件的条目。','個條目':'个条目','已顯示':'已显示','已保存':'已保存','已刪除。可在「已刪除」恢復':'已删除。可在「已删除」恢复','已恢復':'已恢复','請先填單詞 / 詞組':'请先填写单词 / 词组','Export Code 已生成':'Export Code 已生成','已複製':'已复制','備份已恢復':'备份已恢复','Code 無法讀取，請確認是否完整':'Code 无法读取，请确认是否完整','請貼入 Export Code':'请贴入 Export Code'};
  const simp=s=>{s=String(s??'');for(const [a,b] of Object.entries(tradMap))s=s.split(a).join(b);return s};

  // 旧页面运行时函数扩展：增加独立“俗语”视图。
  currentItems=function(){
    let arr;
    if(ui.view==='words') arr=wordData().map(x=>Object.assign({_kind:'word'},x));
    else if(ui.view==='phrases') arr=phraseData().filter(x=>x.section!=='idiom').map(x=>Object.assign({_kind:'phrase'},x));
    else if(ui.view==='idioms') arr=phraseData().filter(x=>x.section==='idiom').map(x=>Object.assign({_kind:'idiom'},x));
    else arr=allData();
    arr=arr.filter(item=>{
      if(ui.view==='favorites'){if(!isFav(item.id)||isDeleted(item.id))return false}
      else if(ui.view==='deleted'){if(!isDeleted(item.id))return false}
      else if(isDeleted(item.id))return false;
      return sourceMatch(item)&&freqMatch(item)&&searchMatch(item);
    });
    arr.sort((a,b)=>{
      if(ui.sort==='project'){
        const sa=a.source==='project'?0:(a.source==='custom'?1:2),sb=b.source==='project'?0:(b.source==='custom'?1:2);
        if(sa!==sb)return sa-sb;return (b.freq||0)-(a.freq||0)
      }
      if(ui.sort==='term')return String(a.term||'').localeCompare(String(b.term||''),'ja');
      const fd=(b.freq||0)-(a.freq||0);return fd||String(a.term||'').localeCompare(String(b.term||''),'ja');
    });return arr;
  };

  updateHero=function(){
    const map={
      words:['PROJECT REVIEW','单词','已清洗、去重并补全：平假名、常用搭配、3–5 个日常例句；动词尽量附真正常用的变形。'],
      phrases:['DAILY JAPANESE','词组 / 日常表达','日常口语、句型、语气和固定搭配。谚语、惯用句等已单独整理到“俗语”。'],
      idioms:['ことわざ・慣用句','俗语','谚语、惯用句、格言与文化表达：字面意思、实际含义、语气和使用场景分开整理。'],
      favorites:['QUICK REVIEW','收藏夹','把还没记牢的内容集中起来快速复习。'],
      deleted:['ARCHIVE','已删除','这里不会出现在正常复习列表，可随时恢复。']
    };
    const v=map[ui.view]||map.words;
    document.getElementById('heroKicker').textContent=v[0];document.getElementById('heroTitle').textContent=v[1];document.getElementById('heroDesc').textContent=v[2];
  };
  updateStats=function(){
    document.getElementById('statWords').textContent=wordData().filter(x=>!isDeleted(x.id)).length.toLocaleString();
    document.getElementById('statPhrases').textContent=phraseData().filter(x=>x.section!=='idiom'&&!isDeleted(x.id)).length.toLocaleString();
    const si=document.getElementById('statIdioms');if(si)si.textContent=phraseData().filter(x=>x.section==='idiom'&&!isDeleted(x.id)).length.toLocaleString();
    document.getElementById('statFav').textContent=state.favorites.filter(id=>!isDeleted(id)).length.toLocaleString();
    document.getElementById('statProject').textContent=allData().filter(x=>x.source==='project'&&!isDeleted(x.id)).length.toLocaleString();
  };

  const oldCardHTML=cardHTML;
  cardHTML=function(item){
    let h=oldCardHTML(item);
    h=h.replace(/詞組/g,item._kind==='idiom'?'俗语':'词组').replace(/單詞/g,'单词').replace(/發音/g,'发音').replace(/實例/g,'实例').replace(/日常例句/g,'日常例句').replace(/常見變形/g,'常见变形').replace(/學習/g,'学习').replace(/優先級/g,'优先级').replace(/從 Project 對話整理/g,'从 Project 对话整理').replace(/已從原詞表整理成學習卡/g,'已从原词表整理成学习卡').replace(/你當時問過：/g,'你当时问过：').replace(/整理註記：/g,'整理注记：');
    const sim=(item.similar||[]).filter(Boolean);
    if(sim.length){
      const box='<div class="section-title">⇄ 近义词・使い分け</div><div class="review-note">'+sim.map(x=>'• '+esc(x)).join('<br>')+'</div>';
      h=h.replace('<div class="card-footer">',box+'<div class="card-footer">');
    }
    return h;
  };

  // 手动新增时也查重；俗语仍保存在 customPhrases 中，不破坏旧备份格式。
  saveItem=function(){
    const type=document.getElementById('fType').value,term=document.getElementById('fTerm').value.trim();
    if(!term){showToast('请先填写单词 / 词组');return}
    const n=s=>String(s||'').normalize('NFKC').replace(/[\s　]/g,'').toLowerCase();
    if(!ui.editingId){const hit=allData().find(x=>n(x.term)===n(term));if(hit){showToast('已存在同名条目，请先搜索并编辑');return}}
    const patch={term,reading:document.getElementById('fReading').value.trim(),meaning:document.getElementById('fMeaning').value.trim(),freq:Number(document.getElementById('fFreq').value)||3,common:lineArray('fCommon'),examples:lineArray('fExamples'),forms:type==='word'?lineArray('fForms'):[],notes:document.getElementById('fNotes').value.trim()};
    if(type==='idiom')patch.section='idiom';
    if(ui.editingId){
      const original=findById(ui.editingId);
      if(original&&original.source==='custom'){
        const arr=original._kind==='word'?state.customWords:state.customPhrases,idx=arr.findIndex(x=>x.id===ui.editingId);if(idx>=0)arr[idx]=Object.assign({},arr[idx],patch)
      }else state.edits[ui.editingId]=Object.assign({},state.edits[ui.editingId]||{},patch);
    }else{
      const item=Object.assign({id:'custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),source:'custom',tags:['自加'],asked:'',note:''},patch);
      if(type==='word')state.customWords.push(item);else state.customPhrases.push(item);
      ui.source='custom';ui.view=type==='word'?'words':(type==='idiom'?'idioms':'phrases');
    }
    saveState();closeModal('editModal');render();showToast('已保存');
  };
  toggleFormsField=function(){document.getElementById('formsField').style.display=document.getElementById('fType').value==='word'?'flex':'none'};
  const oldEdit=editItem;
  editItem=function(id){oldEdit(id);const item=findById(id);if(item&&item.section==='idiom'){document.getElementById('fType').value='idiom';toggleFormsField()}};

  // 把仍由旧代码动态生成的界面文字做轻量简体转换。
  const oldRender=render;
  render=function(){oldRender();document.querySelectorAll('.topbar,.sidebar,.main,.modal-backdrop').forEach(root=>{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const t=simp(n.nodeValue);if(t!==n.nodeValue)n.nodeValue=t}});document.querySelectorAll('[title]').forEach(e=>{e.title=simp(e.title)});};
  document.querySelectorAll('[data-view="idioms"]').forEach(b=>b.addEventListener('click',()=>{ui.view='idioms';ui.limit=60;render()}));
  document.querySelectorAll('input[placeholder]').forEach(e=>{e.placeholder=simp(e.placeholder)});
  render();
})();