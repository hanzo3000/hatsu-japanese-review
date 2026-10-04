(()=>{
  const seed=document.getElementById('seedData');
  if(!seed) return;
  let db;
  try{db=JSON.parse(seed.textContent)}catch(e){console.error('v4.1 seed parse',e);return}
  db.words=Array.isArray(db.words)?db.words:[];
  db.phrases=Array.isArray(db.phrases)?db.phrases:[];
  const norm=s=>String(s||'').normalize('NFKC').replace(/[\s　]/g,'').replace(/^〜/,'~').toLowerCase();
  function upsert(arr,item){
    let i=arr.findIndex(x=>norm(x.term)===norm(item.term));
    if(i<0 && item.aliases) i=arr.findIndex(x=>item.aliases.some(a=>norm(x.term)===norm(a)));
    if(i>=0){
      const old=arr[i];
      arr[i]=Object.assign({},old,item,{id:old.id||item.id,source:'project'});
      return arr[i];
    }
    arr.push(item);return item;
  }
  const W=(x)=>upsert(db.words,Object.assign({source:'project',forms:[],common:[],examples:[],tags:['Project']},x));
  const P=(x)=>upsert(db.phrases,Object.assign({source:'project',forms:[],common:[],examples:[],tags:['Project']},x));

  W({id:'proj-20261004-kanari',term:'かなり',reading:'かなり',meaning:'相当、颇、很。强调程度已经明显偏高，语气比「けっこう」更明确，也较容易用于客观或正式一点的描述。',freq:5,tags:['Project','副词','高频','近义词'],common:['かなり高い','かなり難しい','かなり良くなった','かなり前から'],examples:['この店、かなり人気があるよ。｜这家店相当有人气。','今日はかなり疲れた。｜今天相当累。','前よりかなり良くなったね。｜比以前好很多了。','この問題はかなり深刻だ。｜这个问题相当严重。'],asked:'你问过「かなり」和「けっこう」这种近义词应该怎样整理学习。',notes:'使い分け：かなり＝程度明显高；けっこう＝日常口语里“挺、还蛮”；だいぶ＝特别强调“和之前相比变化很大”。',similar:['けっこう：更口语、更像说话人的主观感受','だいぶ：强调和之前相比变化很大']});
  W({id:'proj-20261004-kekkou',term:'けっこう',reading:'けっこう',meaning:'① 挺、相当、还蛮（程度副词，日常口语非常常见）；②「もうけっこうです」表示“不用了／够了”。',freq:5,tags:['Project','副词','口语','高频','多义','近义词'],common:['けっこう高い','けっこう難しい','けっこう人が多い','もうけっこうです'],examples:['この店、けっこう高いね。｜这家店还挺贵的。','思ったよりけっこう難しかった。｜比想象中还挺难的。','週末はけっこう人が多いよ。｜周末人还蛮多的。','おかわりはいかがですか。— もうけっこうです。｜还要再来一点吗？— 不用了，谢谢。'],asked:'你问过「かなり」和「けっこう」在日常使用中的区别。',notes:'「けっこう」作程度副词时非常口语；另外还有独立高频用法「けっこうです／もうけっこうです」＝不用了、够了。',similar:['かなり：程度更明确、更偏客观','だいぶ：强调和以前相比的变化']});
  W({id:'proj-20261004-daibu',term:'だいぶ',reading:'だいぶ',meaning:'相当、很大程度上。尤其常用来说明和以前相比已经发生了明显变化。',freq:5,tags:['Project','副词','高频','近义词'],common:['だいぶ良くなった','だいぶ慣れた','だいぶ前','だいぶ違う'],examples:['日本語にだいぶ慣れてきた。｜已经相当习惯日语了。','風邪はだいぶ良くなった。｜感冒已经好很多了。','前とはだいぶ違うね。｜跟以前差很多啊。','それ、だいぶ前の話だよ。｜那是很久以前的事了。'],asked:'作为「かなり／けっこう」的近义表达一起整理。',notes:'重点不是单纯“程度高”，而是“跟之前相比，已经变了很多”。',similar:['かなり：强调当前程度很高','けっこう：日常随口说“挺……”']});
  W({id:'proj-20261001-sukkiri',term:'すっきり',reading:'すっきり',meaning:'清爽、利落、舒畅；可形容心情、身体、房间、设计，也常表示烦恼或杂乱消失后变得清楚轻松。',freq:5,tags:['Project','副词/拟态词','口语','高频','近义词'],common:['気分がすっきりする','部屋がすっきりする','すっきりしたデザイン','頭がすっきりする'],examples:['部屋を片づけたら、すっきりした。｜收拾完房间后清爽多了。','話したら気持ちがすっきりした。｜说出来以后心里舒服多了。','このデザインはすっきりしていて見やすい。｜这个设计很简洁，看起来很舒服。','朝シャワーを浴びると頭がすっきりする。｜早上洗个澡，脑子会清醒很多。'],asked:'你问过「すっきり」日常怎么用。',notes:'「さっぱり」也可表示清爽，但「すっきり」更常用于整理后清爽、心情释然、头脑清醒、设计利落。',similar:['さっぱり：清爽／干脆；还可表示“完全不……”如 さっぱり分からない']});
  W({id:'proj-20261001-mappira',term:'まっぴら',reading:'まっぴら',meaning:'坚决不要、敬谢不敏。“这种事我可受不了／再也不想来”的强烈拒绝语气。',freq:2,tags:['Project','副词/惯用','口语','强语气'],common:['まっぴらだ','まっぴらごめんだ','〜なんてまっぴらだ'],examples:['そんな仕事はまっぴらだ。｜那种工作我坚决不干。','もう同じトラブルに巻き込まれるのはまっぴらごめんだ。｜我再也不想卷进同样的麻烦了。','毎日残業なんてまっぴらだよ。｜天天加班我可受不了。'],asked:'你问过「まっぴら」是什么意思、日常怎么用。',notes:'语气很强，不是礼貌表达。最常见是「まっぴらだ／まっぴらごめんだ」。'});
  W({id:'proj-20261001-senchakujun',term:'先着順',reading:'せんちゃくじゅん',meaning:'先到先得；按报名／到达的先后顺序。活动报名、预约、赠品公告中非常常用。',freq:4,tags:['Project','名词','高频'],common:['先着順で受け付ける','先着50名','先着順です'],examples:['申し込みは先着順です。｜报名按先到先得。','先着50名にプレゼントがあります。｜前50名有礼物。','予約は先着順なので、早めに申し込んだほうがいい。｜预约按先后顺序，最好早点申请。'],asked:'你问“先到先得”日语怎么说；正式报名／名额场景通常用「先着順」。',notes:'和口语「早い者勝ち」不同：「先着順」更正式，适合活动、预约、申请。',similar:['早い者勝ち：更口语，强调“谁先抢到谁赢”']});

  P({id:'proj-20261004-dokuwokurawaba',term:'毒を食らわば皿まで',reading:'どくをくらわばさらまで',meaning:'【谚语】既然都已经吃了毒，索性连盘子也吃掉。比喻事情既然已经做到这个地步，就干脆做到底；中文语感接近“一不做二不休／既然如此就做到底”。',freq:2,tags:['Project','ことわざ','谚语','俗语'],common:['毒を食らわば皿までだ','ここまで来たら、毒を食らわば皿まで'],examples:['ここまでやったんだから、毒を食らわば皿までだ。｜既然都做到这里了，干脆做到底。','もう引き返せない。毒を食らわば皿まで、最後までやろう。｜已经回不了头了，索性干到底吧。','彼は「毒を食らわば皿まで」と、計画を最後まで押し通した。｜他抱着一不做二不休的想法，把计划推到了最后。'],asked:'你特别指出这类表达和「あるっちゃある」不同，希望单独放进“俗语”板块。',notes:'语气带有“既然已经沾上／走到这一步”的豁出去感，并不是一般的“坚持到底”。',section:'idiom'});
  P({id:'proj-20261004-undeinosa',term:'雲泥の差',reading:'うんでいのさ',meaning:'【惯用表現】天壤之别、差距极大。字面是“云与泥的差距”。',freq:3,tags:['Project','慣用表現','俗语'],common:['雲泥の差がある','〜とは雲泥の差だ'],examples:['前のモデルとは性能が雲泥の差だ。｜和上一代相比，性能简直是天壤之别。','実際にやってみると、見るだけとは雲泥の差がある。｜真正做起来和只看着，差别非常大。','昔と今では生活の便利さに雲泥の差がある。｜过去和现在的生活便利程度有天壤之别。'],asked:'你指出「雲泥の差」应该和一般口语句型分开整理。',notes:'不是单纯的“大きな差”。「雲泥」本身就强调两者像云和泥一样差得非常远。',section:'idiom'});
  P({id:'proj-20261001-onore',term:'己の欲せざる所、人に施すことなかれ',reading:'おのれのほっせざるところ、ひとにほどこすことなかれ',meaning:'【格言／汉文训读】己所不欲，勿施于人。自己不希望别人对自己做的事，也不要对别人做。',freq:1,tags:['Project','格言','汉文','俗语'],common:['己の欲せざる所、人に施すことなかれ'],examples:['「己の欲せざる所、人に施すことなかれ」という考え方は今でも大切だ。｜“己所不欲，勿施于人”的想法现在依然重要。','自分が嫌なことは相手にもしない。まさに「己の欲せざる所、人に施すことなかれ」だ。｜自己不喜欢的事也不要对别人做，正是“己所不欲，勿施于人”。','子どもにも、この考え方を分かりやすく伝えたい。｜也想把这个道理用容易理解的方式告诉孩子。'],asked:'你问“己所不欲勿施于人”日语怎么说。',notes:'这是较古典／书面的表达，日常对话通常会改说「自分がされて嫌なことは、人にもしない」。',section:'idiom'});
  P({id:'proj-20261001-nichinichikorekoujitsu',term:'日日是好日',reading:'にちにちこれこうにち',meaning:'【禅语】日日皆是好日。不是说每天都会顺利，而是以当下本来的样子去面对、体会每一天。',freq:1,tags:['Project','禅語','慣用表現','俗语'],common:['日日是好日という言葉','日日是好日の心'],examples:['「日日是好日」という言葉が好きです。｜我喜欢“日日是好日”这句话。','うまくいかない日も含めて、日日是好日だと思いたい。｜包括不顺利的日子在内，我也想把每天都好好过。','今日という一日を大切にする、という意味で受け取っている。｜我把它理解为珍惜今天这一天。'],asked:'你问“日日是好日”日语怎么说。',notes:'禅语，读法常见为「にちにちこれこうにち」。比普通日常口语更具文化／哲学色彩。',section:'idiom'});
  P({id:'proj-20261001-toiukatachide',term:'〜という形で',reading:'〜というかたちで',meaning:'以……的形式／方式。日常和商务都常用，用来说明“采取某种形式来做某事”。',freq:4,tags:['Project','句型','日常','商务'],common:['〜という形で進める','〜という形で参加する','今回は〜という形で'],examples:['今回はオンラインという形で参加します。｜这次我会以线上的形式参加。','まずは試験運用という形で始めましょう。｜先以试运行的形式开始吧。','私がサポートするという形で進めてもいいですか。｜可以以我提供协助的方式来推进吗？'],asked:'你问“以xxxx的形式做……”日常怎么表达。',notes:'比「〜の形で」稍完整。商务场景尤其自然，但日常也完全可以用。'});
  P({id:'proj-20261001-toiufuu',term:'〜というふうに',reading:'〜というふうに',meaning:'像……这样／以……这种方式／也就是说……。用于说明方式、状态或把前面的内容概括成“这样”。',freq:5,tags:['Project','句型','口语','高频'],common:['こういうふうに','そういうふうに','〜というふうに考える','〜というふうにする'],examples:['こういうふうに書けば分かりやすいよ。｜像这样写就比较容易懂。','私はそういうふうには考えていない。｜我并不是那样想的。','一人ずつ確認するというふうに進めましょう。｜我们就按逐个确认这种方式推进吧。','「まず試して、あとで直す」というふうに考えています。｜我的想法是“先试，再修改”。'],asked:'你问「という風」是什么意思，以及“以这样的方式”怎么表达。',notes:'通常写作「というふうに／という風に」。口语中「こういうふうに」「そういうふうに」尤其高频。'});

  // 标记现有谚语/惯用句，供独立“俗语”板块使用。
  for(const x of db.phrases){
    const tags=(x.tags||[]).join('|');
    if(x.section==='idiom'||/(ことわざ|諺|谚语|慣用句|慣用表現|禅語|格言)/.test(tags)) x.section='idiom';
  }
  seed.textContent=JSON.stringify(db);

  // 静态界面改成简体中文，并加入“俗语”入口。
  document.documentElement.lang='zh-Hans';
  document.title='日本語复习本 v4.1.0';
  const h1=document.querySelector('.brand h1'); if(h1) h1.textContent='日本語复习本';
  const small=document.querySelector('.brand small'); if(small) small.textContent='Project Q&A + 既有词表 · 本地保存';
  function addIdiomButton(seg){
    if(!seg||seg.querySelector('[data-view="idioms"]')) return;
    const b=document.createElement('button');b.className='seg-btn';b.dataset.view='idioms';b.textContent='俗语';
    const fav=seg.querySelector('[data-view="favorites"]');seg.insertBefore(b,fav||null);
  }
  addIdiomButton(document.getElementById('viewSegment'));
  addIdiomButton(document.getElementById('mobileViewSegment'));
  const type=document.getElementById('fType');
  if(type&&!type.querySelector('option[value="idiom"]')){const o=document.createElement('option');o.value='idiom';o.textContent='俗语 / ことわざ・惯用句';type.appendChild(o)}
  const stats=document.querySelector('.stats');
  if(stats&&!document.getElementById('statIdioms')){const d=document.createElement('div');d.className='stat';d.innerHTML='<b id="statIdioms">0</b><span>俗语</span>';stats.insertBefore(d,stats.children[2]||null)}

  const exact=new Map([
    ['來源說明','来源说明'],['＋ 添加','＋ 添加'],['單詞','单词'],['詞組','词组'],['已刪除','已删除'],['來源','来源'],['全部','全部'],['自加','自加'],['詞頻 / 優先級','词频 / 优先级'],['詞頻','词频'],
    ['平假名注音、常用搭配、日常例句、動詞常見變形。','平假名注音、常用搭配、日常例句、动词常见变形。'],['搜尋漢字、假名、中文意思或例句…','搜索汉字、假名、中文意思或例句…'],['高頻優先','高频优先'],['Project 優先','Project 优先'],['五十音 / 名稱','五十音 / 名称'],
    ['載入中…','加载中…'],['✓ 收藏/刪除會自動保存在此瀏覽器','✓ 收藏/删除会自动保存在此浏览器'],['顯示更多','显示更多'],['添加新內容','添加新内容'],['可以新增單詞或詞組。保存後會寫入瀏覽器，Export Code 也會包含它。','可以新增单词、词组或俗语。保存后会写入浏览器，Export Code 也会包含它。'],['類型','类型'],['詞頻 / 優先級','词频 / 优先级'],['單詞 / 詞組','单词 / 词组'],['常用搭配（每行一個）','常用搭配（每行一个）'],['日常例句（每行一個，可寫「日文｜中文」）','日常例句（每行一个，可写「日文｜中文」）'],['常見變形（每行一個）','常见变形（每行一个）'],['補充筆記','补充笔记'],['取消','取消'],['保存','保存'],['備份 Code','备份 Code'],['生成 Export Code','生成 Export Code'],['複製','复制'],['Import 恢復','Import 恢复'],['關閉','关闭'],['這一版怎麼整理','这一版怎么整理'],['知道了','知道了']
  ]);
  document.querySelectorAll('button,span,label,h2,h3,p,option,input,textarea').forEach(el=>{
    if(el.childElementCount===0){const t=el.textContent; if(exact.has(t)) el.textContent=exact.get(t)}
    if(el.placeholder==='搜尋漢字、假名、中文意思或例句…') el.placeholder='搜索汉字、假名、中文意思或例句…';
  });
})();