// Trang soạn thảo: mở/đóng trang, thanh công cụ, phân trang, thước, bố cục trang
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
function vwKey(id){return'kt_view_'+(id||TID)}
function saveView(){if(!API||RO||!TID)return;try{localStorage.setItem(vwKey(),JSON.stringify({V,sel}))}catch(x){}}
function withView(d){if(!API||RO||!d||typeof d!='object')return d;try{const w=JSON.parse(localStorage.getItem(vwKey()));if(w&&typeof w=='object'){if(w.V)d.V=w.V;if('sel' in w)d.sel=w.sel}}catch(x){}return d}
let st;function save(){if(RO)return;clearTimeout(st);st=setTimeout(()=>{if(API){saveView();if(failN)saveDraft();push()}else{try{localStorage.setItem(lsKey(),JSON.stringify({N:lkOutN(N),sel,V,uid,T:lkOutT(T),rad:1,lv:L,LK,DW}))}catch(x){if(!qw){qw=true;flash('Bộ nhớ trình duyệt đã đầy nên thay đổi gần đây chưa được lưu. Hãy bấm Sao lưu và bớt ảnh lớn.')}}}},300)}
(function init(){try{TID=localStorage.getItem('ktree_cur')||'main';TL=JSON.parse(localStorage.getItem('ktree_list'))||[]}catch(x){}if(!TL.length)TL=[{id:'main',name:'Cây của tôi'}];if(!TL.some(t=>t.id==TID))TID=TL[0].id;let d=null;try{d=JSON.parse(localStorage.getItem(lsKey()));d=d&&d.N?sanitizeState(d):null}catch(x){d=null}
  if(d&&d.N&&Object.keys(d.N).length){N=d.N;LK=d.LK||[];DW=d.DW||[];T=d.T||[];Object.values(N).forEach(n=>{n.cr=n.cr||Date.now();n.md=n.md||n.cr});sel=d.sel;V=d.V||V;uid=d.uid;L=d.lv||3;$('#lv').value=String(L);const nl=!d.rad||!d.lv;if(nl)layout();spread();render();xf();if(nl)fit(1)}else{seed();render();xf();fit(1)}})();
const ov=$('#ov'),pg=$('#pg'),pT=$('#ptl'),tip=$('#tip'),dgd=$('#dgd');let rg,dgEl=null;
function docLoad(id){pgSty.textContent='';CSEL=[];sel=id;layoutApply();if(pmode)inkTog(false);if(dmode)drawTog(false);sel=id;const n=N[id];pT.value=n.t;pg.innerHTML=clean(n.d||'');inkDraw(PGX);pg.contentEditable=RO?'false':'true';pT.readOnly=RO;refreshImgs();meta();tip.style.display='none';ov.classList.add('on');repage();try{document.execCommand('enableObjectResizing',false,false)}catch(x){}$('#sc').scrollTop=0;pg.focus();render()}
function closeDoc(){if(pmode)inkTog(false);ov.classList.remove('on');dgd.classList.remove('on');render()}
$('#op').onclick=()=>openDoc(sel);$('#opw').onclick=()=>openDoc(sel,true);$('#bk').onclick=closeDoc;
pT.oninput=()=>{N[sel].t=pT.value;N[sel].md=Date.now();meta();retitle()};
pg.oninput=()=>{repage();N[sel].d=pg.innerHTML;N[sel].md=Date.now();meta();save()};
const fd=t=>t?new Date(t).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
function meta(){const n=N[sel];$('#mt').textContent='Tạo lúc '+fd(n.cr)+' · Sửa gần nhất '+fd(n.md);const t=pg.innerText.trim();$('#wc').textContent=(t?t.split(/\s+/).length:0)+' từ · '+t.length+' ký tự'}
document.addEventListener('selectionchange',()=>{const s=getSelection();if(s.rangeCount&&pg.contains(s.anchorNode))rg=s.getRangeAt(0)});
function back(){pg.focus();if(rg){const s=getSelection();s.removeAllRanges();s.addRange(rg)}}
// Các tab của thanh công cụ: mỗi nhóm nút khai báo thuộc tab nào bằng data-t; nhớ tab đang dùng.
function tbTab(t){const tb=$('#tb');tb.dataset.tab=t;tb.querySelectorAll('.g').forEach(g=>g.classList.toggle('on',g.dataset.t.split(' ').includes(t)));
 document.querySelectorAll('#tbt button').forEach(b=>{const on=b.dataset.t==t;b.classList.toggle('on',on);b.setAttribute('role','tab');b.setAttribute('aria-selected',on)});try{localStorage.setItem('kt_tbtab',t)}catch(x){}}
$('#tbt').onmousedown=e=>{if(e.target.closest('button'))e.preventDefault()};
$('#tbt').onclick=e=>{const b=e.target.closest('button');if(b)tbTab(b.dataset.t)};
{let t0='h';try{t0=localStorage.getItem('kt_tbtab')||'h'}catch(x){}tbTab(/^[hpiblvx]$/.test(t0)?t0:'h')}
const inTd=()=>{let a=getSelection().anchorNode;a=a&&(a.nodeType==3?a.parentElement:a);return a&&a.closest&&pg.contains(a)?a.closest('td,th'):null};
$('#tb').onmousedown=e=>{if(e.target.closest('button'))e.preventDefault()};
$('#tb').onclick=e=>{const b=e.target.closest('button');if(!b)return;const c=b.dataset.c;if(!c)return;if(c=='ink'){inkTog();return}back();
 if(0){}
 else if(c=='co')document.execCommand('insertHTML',false,'<div class="co"><b>Ghi chú</b><br>Viết nội dung…</div><p><br></p>');else if(c=='tk')document.execCommand('insertHTML',false,'<ul class="tk"><li><input type="checkbox">&#8203;</li></ul>');else if(c=='pbk')document.execCommand('insertHTML',false,'<div class="pbk" contenteditable="false"></div><p><br></p>');else if(c=='nl')nlOpen();else if(c=='img')$('#fi').click();else if(c=='dg')dgOpen();
 else{const[a,v]=c.split(':');document.execCommand(a,false,v)}
 pg.oninput()};
$('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);put(c).then(o=>{back();document.execCommand('insertImage',false,o.src);if(o.p){const im=[...pg.querySelectorAll('img')].find(i=>i.src==o.src);if(im)im.setAttribute('data-sb',o.p)}pg.oninput()})};im.src=r.result};r.readAsDataURL(f);e.target.value=''};
function dgOpen(f){dgEl=f||null;$('#dt').value=f?f.dataset.src:'graph TD\n  A[Ý tưởng] --> B[Thử nghiệm]\n  B --> C{Hiệu quả?}\n  C -->|Có| D[Mở rộng]\n  C -->|Không| A';$('#de').textContent='';dgd.classList.add('on');$('#dt').focus()}
$('#dx').onclick=()=>dgd.classList.remove('on');
$('#dk').onclick=async()=>{const t=$('#dt').value.trim(),id='mm'+Date.now();
 if(typeof mermaid=='undefined'){$('#de').textContent='Chưa tải được thư viện sơ đồ. Kiểm tra mạng rồi thử lại.';return}
 try{mermaid.initialize({startOnLoad:false,theme:'neutral'});const{svg}=await mermaid.render(id,t);
  const h=`<figure class="dg" contenteditable="false" data-src="${esc(t)}">${svg}</figure>`;dgd.classList.remove('on');
  if(dgEl)dgEl.outerHTML=h;else{back();document.execCommand('insertHTML',false,h+'<p><br></p>')}
  pg.oninput()}catch(x){const z=document.getElementById('d'+id);if(z)z.remove();$('#de').textContent='Mã sơ đồ chưa đúng cú pháp.'}};
pg.addEventListener('dblclick',e=>{const f=e.target.closest('figure.dg');if(f)dgOpen(f)});
addEventListener('keydown',e=>{if(e.key=='Escape'&&ov.classList.contains('on')){pmode?inkTog(false):dgd.classList.contains('on')?dgd.classList.remove('on'):closeDoc()}
 if(pmode&&(e.ctrlKey||e.metaKey)&&!e.altKey){const k=e.key.toLowerCase();if(k=='z'||k=='y'){e.preventDefault();k=='y'||e.shiftKey?dRedo():dUndo()}}});      // đang vẽ tay trong trang: Ctrl+Z / Ctrl+Y áp dụng cho nét vẽ
cv.addEventListener('mousemove',e=>{const n=!drag&&!dmode&&e.target.closest('.n');if(!n){tip.style.display='none';return}
 const o=N[n.dataset.id],hd=lkHidden(n.dataset.id);let s=hd?'***':o.b;if(!s&&o.d){s=txt(o.d).slice(0,160)}
 tip.innerHTML=`<b>${esc(o.t||'Chưa đặt tên')}</b><p>${esc(s||'Chưa có tóm tắt.')}</p><small>Tạo: ${hd?'***':fd(o.cr)}<br>Sửa gần nhất: ${hd?'***':fd(o.md)}<br>${extraPar(n.dataset.id).length?'Cũng thuộc: '+esc(extraPar(n.dataset.id).map(i=>N[i].t||'Chưa đặt tên').join(', '))+'<br>':''}${o.c.length?o.c.length+' nhánh con · ':''}Bấm đúp để mở trang</small>`;
 tip.style.display='block';tip.style.left=Math.min(e.clientX+16,innerWidth-280)+'px';tip.style.top=Math.min(e.clientY+16,innerHeight-130)+'px'});
const ex=(a,v)=>{back();document.execCommand(a,false,v);pg.oninput()};
$('#sf').onchange=e=>ex('fontName',e.target.value);

$('#ss').onchange=e=>{back();document.execCommand('fontSize',false,7);pg.querySelectorAll('font[size="7"]').forEach(f=>{const sp=document.createElement('span');sp.style.fontSize=e.target.value+'pt';sp.innerHTML=f.innerHTML;f.replaceWith(sp)});pg.oninput()};
$('#fc').onchange=e=>ex('foreColor',e.target.value);
$('#hc').onchange=e=>ex('hiliteColor',e.target.value);
$('#zm').onchange=e=>{$('#zw').style.zoom=e.target.value/100;place()};
const pa=$('#pa'),pnum=$('#pnum');let rpg=0;
// Phân trang: #pa là một tờ dài, nền vẽ các tờ A4 cách nhau bởi khe. Mỗi khối ở cấp trên cùng (đoạn, tiêu đề, bảng, ảnh…) nếu sắp vắt qua mép dưới
// của tờ thì được đẩy xuống đầu tờ kế tiếp bằng một luật CSS động (không ghi vào nội dung note). Danh sách đẩy theo từng mục, bảng đẩy theo từng hàng.
// Khối cao hơn một tờ thì không tách được. Ngắt trang thủ công (.pbk) đẩy nội dung kế tiếp xuống đầu tờ mới.
let PH=1123,PW=1099,MT=96,MB=96;const pgSty=document.head.appendChild(document.createElement('style'));
function repage(){if(rpg||!ov.classList.contains('on'))return;rpg=1;const zw=$('#zw'),z=zw.style.zoom;zw.style.zoom=1;
 pgSty.textContent='';pg.querySelectorAll('.pbk').forEach(b=>b.style.height='0px');
 const rules=[],top0=()=>pa.getBoundingClientRect().top,Y=el=>el.getBoundingClientRect().top-top0(),Bt=el=>el.getBoundingClientRect().bottom-top0();
 const apply=()=>{pgSty.textContent=rules.join('')};
 const pageOf=y=>Math.max(0,Math.floor((y-MT)/PH)),lim=k=>k*PH+PW-MB,startOf=k=>k*PH+MT;
 const mark=el=>{let r='',e=el;while(e&&e!==pg){r=' > :nth-child('+([...e.parentElement.children].indexOf(e)+1)+')'+r;e=e.parentElement}return '#pg'+r};   // đường dẫn theo vị trí, không đánh dấu vào nội dung
 // đẩy phần tử xuống mép trên của tờ kế tiếp; kind: 'm' = margin-top, 'r' = đệm trên các ô của hàng bảng
 const push=(el,kind)=>{const y=Y(el),k=pageOf(y+1),target=startOf(k+1);if(target-y<=0)return;
  const sel=mark(el);if(kind=='r'){const base=parseFloat(getComputedStyle(el.cells[0]||el).paddingTop)||6;rules.push(sel+'>td,'+sel+'>th{padding-top:'+(base+target-y)+'px!important}')}
  else{const base=parseFloat(getComputedStyle(el).marginTop)||0;const i=rules.length;rules.push(sel+'{margin-top:'+(base+target-y)+'px!important}');apply();
   const d=target-Y(el);if(Math.abs(d)>.5){rules[i]=sel+'{margin-top:'+(base+target-y+d)+'px!important}'}}   // bù phần margin bị gộp với khối trước
  apply()};
 const crosses=el=>{const y=Y(el),h=Bt(el)-y,k=pageOf(y+1);return Bt(el)>lim(k)+.5&&y>startOf(k)+1&&h<=PW-MT-MB};
 const fitEl=el=>{const t=el.localName;
  if(t=='table'&&!el.querySelector('[rowspan]')){[...el.rows].forEach(tr=>{if(crosses(tr))push(tr,'r')});return}
  if((t=='ul'||t=='ol')&&Bt(el)-Y(el)>PW-MT-MB){[...el.children].forEach(li=>{if(crosses(li))push(li,'m')});return}
  if(crosses(el))push(el,'m')};
 for(const el of pg.children){const cs=getComputedStyle(el);
  if(cs.position=='absolute'||cs.position=='fixed'||cs.float!='none')continue;
  if(el.classList.contains('pbk')){const y=Y(el),k=pageOf(y);el.style.height=Math.max(0,startOf(k+1)-y)+'px';continue}
  fitEl(el)}
 const c=Math.max(1,Math.ceil((pg.offsetTop+pg.offsetHeight+MB)/PH));pa.style.minHeight=c*PH+'px';
 const pl=PL();let h='';for(let i=1;i<=c;i++){if(pl.h)h+=`<span style="top:${(i-1)*PH+MT/2-8}px">${esc(pl.h)}</span>`;
  if(pl.f)h+=`<span style="top:${i*PH-GAP-MB/2-(pl.pn?16:8)}px">${esc(pl.f)}</span>`;
  if(pl.pn)h+=`<span style="top:${i*PH-GAP-MB/2+(pl.f?0:-8)}px">Trang ${i} / ${c}</span>`}pnum.innerHTML=h;
 zw.style.zoom=z;rpg=0;inkPos();place();csDraw()}
// Thước kẻ (vạch theo cm, mốc kéo được để đổi lề trái/phải) và lưới 1 cm. Lề và trạng thái bật/tắt lưu theo trình duyệt, áp cho mọi trang note.
const rl=$('#rl'),CM=37.795;
const lsGet=k=>{try{return localStorage.getItem(k)}catch(x){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(x){}};
// Bố cục trang theo từng note (N[id].pl): khổ giấy, hướng, 4 lề (px), chữ đầu/chân trang, hiện số trang. Chỉ lưu những gì khác mặc định.
const PAPER={a4:[794,1123],a5:[559,794],a3:[1123,1587],letter:[816,1056],legal:[816,1344]},PAPN={a4:'A4',a5:'A5',a3:'A3',letter:'Letter',legal:'Legal'},GAP=24,DEFM=[96,96,96,96];   // lề: trên, phải, dưới, trái
const plOf=n=>{const v=n&&n.pl||{};return{sz:v.sz||'a4',or:v.or=='l'?'l':'p',m:v.m||DEFM,h:v.h||'',f:v.f||'',pn:v.pn===0?0:1}};
const PL=()=>plOf(typeof N=='object'&&N&&N[sel]);
const pgDim=v=>{const[w,h]=PAPER[v.sz]||PAPER.a4;return v.or=='l'?[h,w]:[w,h]};
function plSet(patch){if(RO||!N[sel])return;const v=Object.assign(PL(),patch),o={};
 if(v.sz!='a4')o.sz=v.sz;if(v.or=='l')o.or='l';if(v.m.some((x,i)=>x!=DEFM[i]))o.m=v.m.slice();if(v.h)o.h=v.h;if(v.f)o.f=v.f;if(v.pn===0)o.pn=0;
 if(Object.keys(o).length)N[sel].pl=o;else delete N[sel].pl;N[sel].md=Date.now();layoutApply();save()}
function layoutApply(){const v=PL(),[W,H]=pgDim(v),wide=innerWidth>860,zw=$('#zw');PH=H;PW=H-GAP;MT=v.m[0];MB=v.m[2];
 zw.style.width=W+'px';pa.style.paddingTop=MT+'px';pa.style.paddingBottom=MB+'px';pa.style.paddingLeft=wide?v.m[3]+'px':'';pa.style.paddingRight=wide?v.m[1]+'px':'';
 pa.style.background=`repeating-linear-gradient(#fff 0 ${PW}px,var(--bg) ${PW}px ${PH}px)`;pa.style.minHeight=PH+'px';
 const cm=x=>Math.round(x/CM*100)/100,set=(id,val)=>{const e=$(id);if(e&&document.activeElement!==e)e.value=val};
 set('#plt',cm(v.m[0]));set('#plr',cm(v.m[1]));set('#plb',cm(v.m[2]));set('#pll',cm(v.m[3]));set('#plsz',v.sz);set('#plh',v.h);set('#plf',v.f);
 $('#plop').setAttribute('aria-pressed',v.or=='p');$('#plol').setAttribute('aria-pressed',v.or=='l');$('#plpn').setAttribute('aria-pressed',!!v.pn);
 rlDraw();if(ov.classList.contains('on'))repage()}
function rlDraw(){const W=rl.clientWidth;if(!W)return;const m=PL().m;let h='';for(let i=0;i*CM/2<=W;i++){const x=i*CM/2;if(i%2==0){h+=`<span class="rt c" style="left:${x}px"></span>`;if(i>0)h+=`<span class="rn" style="left:${x}px">${i/2}</span>`}else h+=`<span class="rt h" style="left:${x}px"></span>`}
 const l=Math.min(m[3],W/2-20),r=Math.min(m[1],W/2-20);h+=`<span class="mz" style="left:0;width:${l}px"></span><span class="mz" style="right:0;width:${r}px"></span>`;$('#rlm').innerHTML=h;
 $('#rlL').style.left=l+'px';$('#rlR').style.left=(W-r)+'px'}
let rlD=null;
[['#rlL',3],['#rlR',1]].forEach(([q,i])=>{const h=$(q);h.onpointerdown=e=>{if(RO)return;rlD={i,x:e.clientX,v:PL().m[i],z:rl.getBoundingClientRect().width/rl.offsetWidth||1};h.setPointerCapture(e.pointerId);e.preventDefault()};
 h.onpointermove=e=>{if(!rlD||rlD.i!=i)return;const d=(e.clientX-rlD.x)/rlD.z*(i==1?-1:1),W=rl.clientWidth,m=PL().m.slice();m[i]=Math.round(Math.max(20,Math.min(W/2-40,rlD.v+d)));plSet({m})};
 h.onpointerup=h.onpointercancel=()=>{rlD=null}});
const MPRE={n:[96,96,96,96],s:[48,48,48,48],m:[96,72,96,72],w:[96,192,96,192]};
$('#plpre').onchange=e=>{if(MPRE[e.target.value])plSet({m:MPRE[e.target.value].slice()});e.target.value=''};
[['#plt',0],['#plr',1],['#plb',2],['#pll',3]].forEach(([q,i])=>$(q).onchange=e=>{const v=parseFloat(e.target.value);if(!isFinite(v))return;const m=PL().m.slice();m[i]=Math.round(Math.max(20,Math.min(300,v*CM)));plSet({m})});
$('#plsz').onchange=e=>plSet({sz:e.target.value});$('#plop').onclick=()=>plSet({or:'p'});$('#plol').onclick=()=>plSet({or:'l'});
$('#plh').oninput=e=>plSet({h:e.target.value});$('#plf').oninput=e=>plSet({f:e.target.value});$('#plpn').onclick=()=>plSet({pn:PL().pn?0:1});
document.querySelectorAll('#plop,#plol,#plpn').forEach(b=>b.onmousedown=e=>e.preventDefault());
function viewSet(){document.body.classList.toggle('norl',lsGet('kt_ruler')=='0');document.body.classList.toggle('grid',lsGet('kt_grid')=='1');
 $('#vr').setAttribute('aria-pressed',lsGet('kt_ruler')!='0');$('#vg').setAttribute('aria-pressed',lsGet('kt_grid')=='1')}
$('#vr').onclick=()=>{lsSet('kt_ruler',lsGet('kt_ruler')=='0'?'1':'0');viewSet();rlDraw()};
$('#vg').onclick=()=>{lsSet('kt_grid',lsGet('kt_grid')=='1'?'0':'1');viewSet()};
document.querySelectorAll('#vr,#vg').forEach(b=>b.onmousedown=e=>e.preventDefault());
new ResizeObserver(()=>rlDraw()).observe(rl);addEventListener('resize',layoutApply);viewSet();layoutApply();
new ResizeObserver(()=>repage()).observe(pg);
