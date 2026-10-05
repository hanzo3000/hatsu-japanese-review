(()=>{
  const VERSION='v4.2.1';
  document.title='日本語复习本 '+VERSION;
  const brand=document.querySelector('.brand h1');
  if(brand)brand.textContent='日本語复习本';
  const small=document.querySelector('.brand small');
  if(small)small.textContent='Project Q&A + 既有词表 · '+VERSION+' · 本地保存';
  const banner=document.querySelector('.curation-banner');
  if(banner)banner.innerHTML='<b>'+VERSION+' 更新：</b>在 v4.2.0 整理版基础上，继续合并 2026-10-05 的最新学习提问，并按查重后补入「ツッコむ」「ちょっと調べてみる」「〜に付き合ってもらう」「気づいたら／気がついたら」「強いて言えば」「〜ような／〜ように」「脂ギッシュ／油ギッシュ」等内容。';
  const info=document.getElementById('infoModal');
  if(info){
    const h=info.querySelector('.modal h3');
    if(h)h.textContent=VERSION+' 怎么整理';
  }
})();