// Định dạng: tô nổi bật, giãn dòng, bảng, thẻ Trang chủ kiểu Word, tìm & thay
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
// ===== Tô nổi bật, giãn dòng =====
const hex2rgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(h);if(!m)return'';const n=parseInt(m[1],16);return `rgb(${n>>16}, ${n>>8&255}, ${n&255})`};
function hiliteSet(c){back();const cur=(document.queryCommandValue('hiliteColor')||document.queryCommandValue('backColor')||'').replace(/\s/g,'');
 if(c=='off'||cur==hex2rgb(c).replace(/\s/g,''))document.execCommand('hiliteColor',false,'transparent');else document.execCommand('hiliteColor',false,c);pg.oninput()}
$('#tb').addEventListener('click',e=>{const h=e.target.closest('[data-hl]');if(!h)return;const v=h.dataset.hl;if(v=='cur')hiliteSet($('#hc').value);else if(v=='off')hiliteSet('off');else{$('#hc').value=v;hiliteSet(v)}});
$('#hc').onchange=e=>hiliteSet(e.target.value);
const BLK='p,h1,h2,h3,li,blockquote,.co,td,th,div:not(.pbk):not(.co)';
function blocksOfSel(){const r=rg;if(!r||!pg.contains(r.commonAncestorContainer))return[];
 let all=[...pg.querySelectorAll(BLK)].filter(el=>el!==pg&&r.intersectsNode(el));
 if(!all.length){let n=r.startContainer;n=n.nodeType==3?n.parentElement:n;const b=n&&n.closest(BLK);if(b)all=[b]}
 return all.filter(el=>!all.some(o=>o!==el&&el.contains(o)))}   // chỉ giữ khối trong cùng
$('#lnsp').onchange=e=>{back();blocksOfSel().forEach(b=>{if(e.target.value)b.style.lineHeight=e.target.value;else b.style.removeProperty('line-height')});pg.oninput()};
$('#pgsp').onchange=e=>{back();blocksOfSel().forEach(b=>{if(e.target.value!==''){b.style.marginBottom=e.target.value+'pt';b.style.marginTop='0'}else{b.style.removeProperty('margin-bottom');b.style.removeProperty('margin-top')}});pg.oninput()};
document.addEventListener('selectionchange',()=>{const b=blocksOfSel()[0];if(!b)return;$('#lnsp').value=b.style.lineHeight||'';const m=parseFloat(b.style.marginBottom);$('#pgsp').value=b.style.marginBottom&&!isNaN(m)?String(Math.round(m)):''});

// ===== Bảng: lưới ô, chọn nhiều ô, gộp/tách, viền, nền, căn, đổi cỡ =====
// tmap: ma trận ô của bảng, tính cả ô gộp (rowspan/colspan).
function tmap(t){const rows=[...t.rows],g=rows.map(()=>[]),info=new Map();
 rows.forEach((tr,r)=>{let c=0;[...tr.cells].forEach(td=>{while(g[r][c])c++;const rs=Math.max(1,Math.min(td.rowSpan,rows.length-r)),cs=Math.max(1,td.colSpan);
  for(let i=0;i<rs;i++)for(let j=0;j<cs;j++){(g[r+i]=g[r+i]||[])[c+j]=td}info.set(td,{r,c,rs,cs});c+=cs})});
 return{g,info,rows,nc:Math.max(0,...g.map(r=>r.length))}}
const TD_KEEP=/^(border|padding|vertical-align|text-align)/;
function newTd(ref){const td=document.createElement('td');td.innerHTML='&nbsp;';if(ref&&ref.getAttribute('style')){ref.getAttribute('style').split(';').forEach(d=>{const k=d.split(':')[0].trim();if(TD_KEEP.test(k))td.style.cssText+=d+';'})}return td}
const tCaret=td=>{if(!td)return;const r=document.createRange();r.selectNodeContents(td);r.collapse(true);const s=getSelection();s.removeAllRanges();s.addRange(r);rg=r};
// cột: <colgroup> là nguồn độ rộng; độ rộng cũng ghi vào style của ô để bản .docx/.html dùng được
function tcols(t,m){m=m||tmap(t);let cg=t.querySelector(':scope>colgroup');
 if(!cg||cg.children.length!=m.nc){const k=pg.getBoundingClientRect().width/pg.offsetWidth||1,ws=[];
  for(let c=0;c<m.nc;c++){let w=0;for(let r=0;r<m.g.length;r++){const td=m.g[r][c];if(td&&m.info.get(td).cs==1){w=td.getBoundingClientRect().width/k;break}}ws.push(w)}
  const tot=t.getBoundingClientRect().width/k,known=ws.filter(Boolean),avg=known.length?known.reduce((a,b)=>a+b,0)/known.length:tot/m.nc;
  if(cg)cg.remove();cg=document.createElement('colgroup');ws.forEach(w=>{const c=document.createElement('col');c.style.width=Math.round(w||avg)+'px';cg.appendChild(c)});t.prepend(cg);t.style.tableLayout='fixed'}
 return[...cg.children]}
function tsync(t){const m=tmap(t),cols=tcols(t,m),w=cols.map(c=>parseFloat(c.style.width)||0);t.style.tableLayout='fixed';t.style.width=Math.round(w.reduce((a,b)=>a+b,0))+'px';
 m.info.forEach((i,td)=>{let sum=0;for(let c=i.c;c<i.c+i.cs;c++)sum+=w[c];td.style.width=Math.round(sum)+'px'})}
// vùng chọn nhiều ô
let CSEL=[],csA=null,csDrag=false;const csl=pa.appendChild(Object.assign(document.createElement('div'),{id:'csl'}));
const cellOf=el=>{const c=el&&el.closest&&el.closest('td,th');return c&&pg.contains(c)?c:null};
function csRect(a,b){const t=a.closest('table');if(!t||b.closest('table')!==t)return[a];const m=tmap(t),A=m.info.get(a),B=m.info.get(b);
 let r1=Math.min(A.r,B.r),r2=Math.max(A.r+A.rs,B.r+B.rs)-1,c1=Math.min(A.c,B.c),c2=Math.max(A.c+A.cs,B.c+B.cs)-1,ch=true;
 while(ch){ch=false;for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){const i=m.info.get(m.g[r][c]);if(!i)continue;if(i.r<r1){r1=i.r;ch=true}if(i.c<c1){c1=i.c;ch=true}if(i.r+i.rs-1>r2){r2=i.r+i.rs-1;ch=true}if(i.c+i.cs-1>c2){c2=i.c+i.cs-1;ch=true}}}
 const set=new Set();for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(m.g[r][c])set.add(m.g[r][c]);return[...set]}
function csDraw(){const pr=pa.getBoundingClientRect(),k=pr.width/pa.offsetWidth||1;csl.innerHTML=CSEL.filter(c=>pg.contains(c)).map(c=>{const r=c.getBoundingClientRect();return `<div style="left:${(r.left-pr.left)/k}px;top:${(r.top-pr.top)/k}px;width:${r.width/k}px;height:${r.height/k}px"></div>`}).join('')}
const csClear=()=>{if(CSEL.length){CSEL=[];csDraw()}};
// các ô đích của một lệnh: vùng chọn, hoặc ô chứa con trỏ
const tgt=()=>{CSEL=CSEL.filter(c=>pg.contains(c));if(CSEL.length)return CSEL;const c=inTd()||cellOf(document.activeElement);return c?[c]:[]};
// ---- đổi cỡ cột / hàng bằng cách kéo viền ----
const tbHit=e=>{const td=cellOf(e.target);if(!td||RO)return null;const r=td.getBoundingClientRect(),m=e.pointerType=='touch'?12:5;
 if(r.right-e.clientX<=m&&r.right-e.clientX>=-2)return{k:'c',td};
 if(r.bottom-e.clientY<=m&&r.bottom-e.clientY>=-2)return{k:'r',td};
 if(e.clientX-r.left<=m&&td.cellIndex>0)return{k:'c',td:td.previousElementSibling};return null};
let tbD=null;
pg.addEventListener('pointerdown',e=>{if(pmode||e.button>0)return;const h=tbHit(e);
 if(h){e.preventDefault();const t=h.td.closest('table'),m=tmap(t),k=pg.getBoundingClientRect().width/pg.offsetWidth||1;
  if(h.k=='c'){const cols=tcols(t,m),i=m.info.get(h.td),idx=i.c+i.cs-1;tsync(t);const pcs=getComputedStyle(pg);
   tbD={k:'c',t,idx,cols,ws:cols.map(c=>parseFloat(c.style.width)||0),x:e.clientX,zk:k,max:pg.clientWidth-parseFloat(pcs.paddingLeft)-parseFloat(pcs.paddingRight)}}
  else{const tr=h.td.parentElement;tbD={k:'r',tr,h:tr.getBoundingClientRect().height/k,y:e.clientY,zk:k}}
  try{pg.setPointerCapture(e.pointerId)}catch(x){}document.body.classList.add('mvg');return}
 const c=cellOf(e.target);if(c&&!e.shiftKey){csA=c;csDrag=false;csClear()}
 else if(c&&e.shiftKey&&csA){CSEL=csRect(csA,c);csDraw();e.preventDefault()}else{csA=null;csClear()}});
pg.addEventListener('pointermove',e=>{
 if(tbD){e.preventDefault();const D=tbD;
  if(D.k=='r'){D.tr.style.height=Math.max(20,Math.round(D.h+(e.clientY-D.y)/D.zk))+'px'}
  else{const dx=(e.clientX-D.x)/D.zk,i=D.idx,last=i==D.cols.length-1,MIN=24;let w=Math.max(MIN,D.ws[i]+dx);
   if(last){const others=D.ws.reduce((a,b)=>a+b,0)-D.ws[i];w=Math.min(w,Math.max(MIN,D.max-others));D.cols[i].style.width=w+'px'}
   else{const pair=D.ws[i]+D.ws[i+1];w=Math.min(w,pair-MIN);D.cols[i].style.width=w+'px';D.cols[i+1].style.width=pair-w+'px'}
   tsync(D.t)}
  repage();return}
 if(pmode)return;
 if(e.buttons&1&&csA){const c=cellOf(document.elementFromPoint(e.clientX,e.clientY));if(c&&c!==csA&&c.closest('table')===csA.closest('table')){csDrag=true;CSEL=csRect(csA,c);csDraw();getSelection().removeAllRanges()}else if(c===csA&&csDrag){CSEL=[];csDraw()}}
 else if(!e.buttons){const h=tbHit(e);pg.style.cursor=h?(h.k=='c'?'col-resize':'row-resize'):''}});
pg.addEventListener('mousedown',e=>{if(!pmode&&e.button==0&&tbHit(e))e.preventDefault()});
const tbEnd=e=>{if(!tbD)return;tbD=null;document.body.classList.remove('mvg');try{pg.releasePointerCapture(e.pointerId)}catch(x){}pg.oninput()};
pg.addEventListener('pointerup',tbEnd);pg.addEventListener('pointercancel',tbEnd);
// Tab / Shift+Tab đi qua các ô; Tab ở ô cuối thêm một hàng
pg.addEventListener('keydown',e=>{if(e.key!='Tab'||e.ctrlKey||e.metaKey||e.altKey)return;const td=inTd();if(!td)return;e.preventDefault();
 const cells=[...td.closest('table').querySelectorAll('td,th')],i=cells.indexOf(td);
 if(e.shiftKey){tCaret(cells[i-1]||td)}else if(cells[i+1])tCaret(cells[i+1]);else{tcmd('rowB');const n=[...td.closest('table').querySelectorAll('td,th')];tCaret(n[i+1])}});
// ---- lệnh bảng ----
function insRow(t,P){const m=tmap(t),cross=new Set(),tr=document.createElement('tr');
 for(let c=0;c<m.nc;c++){const above=m.g[P-1]&&m.g[P-1][c],below=m.g[P]&&m.g[P][c];if(above&&below&&above===below){if(!cross.has(above)){cross.add(above);above.rowSpan=m.info.get(above).rs+1}}else tr.appendChild(newTd(below||above))}
 if(m.rows[P])m.rows[P].before(tr);else m.rows[P-1].after(tr);return tr}
function insCol(t,Q){const m=tmap(t),cross=new Set(),cols=tcols(t,m);
 m.rows.forEach((tr,r)=>{const L=m.g[r][Q-1],R=m.g[r][Q];if(L&&R&&L===R){if(!cross.has(L)){cross.add(L);L.colSpan=m.info.get(L).cs+1}return}
  const own=[...tr.cells],nt=newTd(L||R),after=own.filter(c=>m.info.get(c).c<Q).pop();if(after)after.after(nt);else tr.prepend(nt)});
 const nc=document.createElement('col');nc.style.width=(cols[Q-1]||cols[Q]).style.width;if(cols[Q])cols[Q].before(nc);else cols[cols.length-1].after(nc);tsync(t)}
function delRow(t,r){const m=tmap(t);if(m.rows.length<2){t.remove();return}const done=new Set();
 for(let c=0;c<m.nc;c++){const td=m.g[r][c];if(!td||done.has(td))continue;done.add(td);const i=m.info.get(td);
  if(i.r<r)td.rowSpan=i.rs-1;else if(i.rs>1){const nx=m.rows[r+1],before=[...nx.cells].find(x=>m.info.get(x).c>i.c);td.rowSpan=i.rs-1;before?before.before(td):nx.appendChild(td)}}
 m.rows[r].remove()}
function delCol(t,c){const m=tmap(t);if(m.nc<2){t.remove();return}const done=new Set();
 for(let r=0;r<m.rows.length;r++){const td=m.g[r][c];if(!td||done.has(td))continue;done.add(td);const i=m.info.get(td);if(i.cs>1)td.colSpan=i.cs-1;else td.remove()}
 const cg=t.querySelector(':scope>colgroup');if(cg&&cg.children[c])cg.children[c].remove();if(cg)tsync(t)}
function tcmd(c,a){CSEL=CSEL.filter(x=>pg.contains(x));
 if(c=='new'){const R=Math.max(1,Math.min(30,+$('#tbR').value||3)),C=Math.max(1,Math.min(12,+$('#tbC').value||3));back();
  document.execCommand('insertHTML',false,'<table><tbody>'+('<tr>'+'<td>&nbsp;</td>'.repeat(C)+'</tr>').repeat(R)+'</tbody></table><p><br></p>');pg.oninput();return}
 const cells=tgt();if(!cells.length){flash('Bấm vào một ô của bảng trước.');return}
 const t=cells[0].closest('table'),m=tmap(t),inf=cells.map(x=>m.info.get(x)).filter(Boolean);if(!inf.length)return;
 const r1=Math.min(...inf.map(i=>i.r)),r2=Math.max(...inf.map(i=>i.r+i.rs-1)),c1=Math.min(...inf.map(i=>i.c)),c2=Math.max(...inf.map(i=>i.c+i.cs-1));
 const first=m.g[r1][c1];
 if(c=='rowA')tCaret(insRow(t,r1).cells[0]);else if(c=='rowB')tCaret(insRow(t,r2+1).cells[0]);
 else if(c=='colL')insCol(t,c1);else if(c=='colR')insCol(t,c2+1);
 else if(c=='delrow'){for(let r=r2;r>=r1;r--)delRow(t,r);CSEL=[]}
 else if(c=='delcol'){for(let k=c2;k>=c1;k--)delCol(t,k);CSEL=[]}
 else if(c=='deltbl'){t.remove();CSEL=[];if(!pg.querySelector('p,div:not(.pbk),table'))pg.innerHTML='<p><br></p>'}
 else if(c=='merge'){if(cells.length<2){flash('Kéo chuột qua nhiều ô để chọn vùng cần gộp.');return}
  const rect=csRect(first,m.g[r2][c2]);rect.forEach(x=>{if(x!==first){const h=x.innerHTML.replace(/&nbsp;|<br\s*\/?>|\s|​/g,'');if(h)first.innerHTML=first.innerHTML.replace(/(&nbsp;|<br>)+$/,'')+'<br>'+x.innerHTML;x.remove()}});
  first.colSpan=c2-c1+1;first.rowSpan=r2-r1+1;first.style.removeProperty('width');CSEL=[first];if(t.querySelector(':scope>colgroup'))tsync(t)}
 else if(c=='split'){let any=0;cells.forEach(td=>{const i=m.info.get(td);if(i.rs<2&&i.cs<2)return;any=1;
   for(let r=i.r;r<i.r+i.rs;r++){const own=[...m.rows[r].cells].filter(x=>x!==td&&m.info.get(x).r==r),start=r==i.r?1:0;
    for(let cc=start;cc<i.cs;cc++){const nt=newTd(td),c0=i.c+cc;if(r==i.r){const prev=[...td.parentElement.cells].filter(x=>x.dataset.tmp).pop()||(cc==1?td:null);(prev||td).after(nt);nt.dataset.tmp=1}
     else{const b=own.find(x=>m.info.get(x).c>c0);b?b.before(nt):m.rows[r].appendChild(nt)}}}
   td.colSpan=1;td.rowSpan=1});
  t.querySelectorAll('[data-tmp]').forEach(x=>x.removeAttribute('data-tmp'));if(!any){flash('Ô này chưa được gộp.');return}if(t.querySelector(':scope>colgroup'))tsync(t)}
 else if(c=='shade')cells.forEach(x=>x.style.backgroundColor=$('#tcs').value);else if(c=='unshade')cells.forEach(x=>x.style.removeProperty('background-color'));
 else if(c=='border'){if(!a)return;const sc=cells.length>1?cells:[...t.querySelectorAll('td,th')],sm=tmap(t),si=sc.map(x=>sm.info.get(x)),R1=Math.min(...si.map(i=>i.r)),R2=Math.max(...si.map(i=>i.r+i.rs-1)),C1=Math.min(...si.map(i=>i.c)),C2=Math.max(...si.map(i=>i.c+i.cs-1));
  sc.forEach(td=>{const i=sm.info.get(td);if(a=='all')td.style.border='1px solid #c5d0d3';else if(a=='thick')td.style.border='2px solid #1c2a2e';else if(a=='none')td.style.border='0';
   else if(a=='outer'){td.style.border='1px solid #c5d0d3';const L='1px solid #1c2a2e';if(i.r==R1)td.style.borderTop=L;if(i.r+i.rs-1==R2)td.style.borderBottom=L;if(i.c==C1)td.style.borderLeft=L;if(i.c+i.cs-1==C2)td.style.borderRight=L}})}
 else if(c=='valign'){if(a)cells.forEach(x=>x.style.verticalAlign=a)}
 else if(c=='hl')cells.forEach(x=>x.style.textAlign=a);
 else if(c=='head'){const row=new Set();for(let k=0;k<m.nc;k++)row.add(m.g[0][k]);const on=[...row].every(x=>x.style.fontWeight=='700');row.forEach(x=>{if(on){x.style.removeProperty('font-weight');x.style.removeProperty('background-color')}else{x.style.fontWeight='700';x.style.backgroundColor='#e6ecee'}})}
 else if(c=='eqc'){const cols=tcols(t,m),tot=cols.reduce((s,x)=>s+(parseFloat(x.style.width)||0),0);cols.forEach(x=>x.style.width=tot/cols.length+'px');tsync(t)}
 else if(c=='eqr'){const h=Math.max(...m.rows.map(r=>r.getBoundingClientRect().height))/(pg.getBoundingClientRect().width/pg.offsetWidth||1);m.rows.forEach(r=>r.style.height=Math.round(h)+'px')}
 else if(c=='fit'){const cg=t.querySelector(':scope>colgroup');if(cg)cg.remove();t.style.removeProperty('table-layout');t.style.width='100%';t.querySelectorAll('td,th').forEach(x=>x.style.removeProperty('width'))}
 else if(c=='talign'){if(!a)return;t.style.marginLeft=a=='left'?'0':'auto';t.style.marginRight=a=='right'?'0':'auto'}
 pg.oninput();csDraw()}
$('#tb').addEventListener('click',e=>{const b=e.target.closest('button[data-tc]');if(b)tcmd(b.dataset.tc,b.dataset.a)});
$('#tb').addEventListener('change',e=>{const b=e.target.closest('select[data-tc]');if(b){tcmd(b.dataset.tc,b.value);b.value=''}});
// ===== Thẻ Trang chủ kiểu Word: bộ nhớ tạm, cọ định dạng, chỉ số, cỡ chữ, đổi kiểu chữ, kiểu đoạn, tô/viền đoạn, sắp xếp, dấu ¶, kiểu số, tìm & thay =====
// bộ nhớ tạm
$('#tb').addEventListener('click',e=>{const b=e.target.closest('[data-cb]');if(!b)return;const k=b.dataset.cb;back();
 if(k=='cut'||k=='copy'){if(!(rg&&!rg.collapsed)){flash('Hãy bôi đen đoạn cần '+(k=='cut'?'cắt':'chép')+'.');return}document.execCommand(k);if(k=='cut')pg.oninput()}
 else if(k=='paste'){if(!navigator.clipboard||!navigator.clipboard.readText){flash('Trình duyệt chưa cho dán từ nút. Hãy dùng Ctrl+V.');return}
  navigator.clipboard.readText().then(t=>{if(t){back();document.execCommand('insertText',false,t);pg.oninput()}}).catch(()=>flash('Chưa được phép đọc bộ nhớ tạm. Hãy dùng Ctrl+V.'))}
 else if(k=='all'){const r=document.createRange();r.selectNodeContents(pg);const s=getSelection();s.removeAllRanges();s.addRange(r);rg=r}});
// cọ định dạng: bấm nút, rồi bôi đen vùng khác để áp cùng định dạng (Esc để huỷ)
let FP=null;const fpBtn=$('#wdfp');
const fmtAt=()=>{let n=rg&&rg.startContainer;n=n&&(n.nodeType==3?n.parentElement:n);if(!n||!pg.contains(n))return null;const c=getComputedStyle(n);return{fontFamily:c.fontFamily,fontSize:c.fontSize,fontWeight:c.fontWeight,fontStyle:c.fontStyle,color:c.color,textDecorationLine:c.textDecorationLine,backgroundColor:c.backgroundColor}};
fpBtn.onclick=()=>{if(FP){FP=null;fpBtn.setAttribute('aria-pressed',false);return}back();const f=fmtAt();if(!f){flash('Đặt con trỏ vào chữ cần lấy định dạng trước.');return}FP=f;fpBtn.setAttribute('aria-pressed',true);flash('Bôi đen vùng muốn áp định dạng.')};
pg.addEventListener('mouseup',()=>{if(!FP)return;setTimeout(()=>{const s=getSelection();if(!s.rangeCount||s.isCollapsed||!pg.contains(s.anchorNode))return;const r=s.getRangeAt(0),d=document.createElement('div');d.appendChild(r.cloneContents());
 const st=Object.entries(FP).map(([k,v])=>k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())+':'+v).join(';');document.execCommand('insertHTML',false,'<span style="'+st+'">'+d.innerHTML+'</span>');FP=null;fpBtn.setAttribute('aria-pressed',false);pg.oninput()},0)});
document.addEventListener('keydown',e=>{if(e.key=='Escape'&&FP){FP=null;fpBtn.setAttribute('aria-pressed',false)}},true);
// cỡ chữ: tăng / giảm
const PTS=[8,9,10,11,12,14,16,18,20,22,24,28,32,36,48,72];
function setPt(pt){back();document.execCommand('fontSize',false,7);pg.querySelectorAll('font[size="7"]').forEach(f=>{const sp=document.createElement('span');sp.style.fontSize=pt+'pt';sp.innerHTML=f.innerHTML;f.replaceWith(sp)});$('#ss').value=String(pt);pg.oninput()}
$('#tb').addEventListener('click',e=>{const b=e.target.closest('[data-fx]');if(!b)return;back();let n=rg&&rg.startContainer;n=n&&(n.nodeType==3?n.parentElement:n);if(!n||!pg.contains(n))return;
 const cur=Math.round(parseFloat(getComputedStyle(n).fontSize)*72/96),i=b.dataset.fx=='up'?PTS.find(x=>x>cur):[...PTS].reverse().find(x=>x<cur);if(i)setPt(i)});
// đổi kiểu chữ (hoa / thường …) giữ nguyên định dạng bên trong
const CASEF={lower:t=>t.toLocaleLowerCase('vi'),upper:t=>t.toLocaleUpperCase('vi'),title:t=>t.toLocaleLowerCase('vi').replace(/(^|[\s(\[“"'-])(\p{L})/gu,(m,a,c)=>a+c.toLocaleUpperCase('vi')),
 sent:t=>t.toLocaleLowerCase('vi').replace(/(^|[.!?]\s+)(\p{L})/gu,(m,a,c)=>a+c.toLocaleUpperCase('vi')),flip:t=>[...t].map(c=>c==c.toLocaleUpperCase('vi')?c.toLocaleLowerCase('vi'):c.toLocaleUpperCase('vi')).join('')};
$('#wdcs').onchange=e=>{const f=CASEF[e.target.value];e.target.value='';back();if(!f||!rg||rg.collapsed){flash('Hãy bôi đen đoạn chữ cần đổi.');return}
 const r=rg,w=document.createTreeWalker(r.commonAncestorContainer.nodeType==3?r.commonAncestorContainer.parentNode:r.commonAncestorContainer,NodeFilter.SHOW_TEXT),nodes=[];
 if(r.commonAncestorContainer.nodeType==3)nodes.push(r.commonAncestorContainer);else while(w.nextNode())if(r.intersectsNode(w.currentNode))nodes.push(w.currentNode);
 nodes.forEach(n=>{const a=n==r.startContainer?r.startOffset:0,z=n==r.endContainer?r.endOffset:n.data.length;n.data=n.data.slice(0,a)+f(n.data.slice(a,z))+n.data.slice(z)});pg.oninput()};
// kiểu đoạn: thêm Tiêu đề lớn / Phụ đề
const SY={title:'font-size:28pt;font-weight:700;line-height:1.2;margin:0 0 6pt',sub:'font-size:15pt;color:#5b6f75;margin:0 0 10pt'};
$('#sy').onchange=e=>{const v=e.target.value;if(SY[v]){back();document.execCommand('formatBlock',false,'p');blocksOfSel().forEach(b=>{b.removeAttribute('style');b.style.cssText=SY[v]});pg.oninput()}
 else{back();document.execCommand('formatBlock',false,v);blocksOfSel().forEach(b=>{if(/^(P|H[1-3]|BLOCKQUOTE)$/.test(b.tagName)&&/font-size|font-weight/.test(b.getAttribute('style')||'')){b.style.removeProperty('font-size');b.style.removeProperty('font-weight');b.style.removeProperty('color')}});pg.oninput()}};
// tô nền / viền đoạn, sắp xếp, dấu ¶, kiểu số
$('#tb').addEventListener('click',e=>{const b=e.target.closest('[data-pa]');if(!b)return;back();const k=b.dataset.pa,bl=blocksOfSel();
 if(k=='shade'||k=='unshade'){bl.forEach(x=>{if(k=='shade')x.style.backgroundColor=$('#wdsh').value;else x.style.removeProperty('background-color')})}
 else if(k=='sort'){const par=bl[0]&&bl[0].parentNode;if(bl.length<2||bl.some(x=>x.parentNode!==par)){flash('Bôi đen nhiều đoạn hoặc nhiều mục danh sách liền nhau để sắp xếp.');return}
  sortDir=-sortDir;const s=[...bl].sort((a,c)=>sortDir*a.textContent.localeCompare(c.textContent,'vi')),mk=document.createComment('');par.insertBefore(mk,bl[0]);s.forEach(x=>par.insertBefore(x,mk));mk.remove()}
 pg.oninput()});
let sortDir=-1;   // lần bấm đầu tiên là A→Z
$('#wdbd').onchange=e=>{const v=e.target.value;e.target.value='';if(!v)return;back();blocksOfSel().forEach(b=>{['border','border-top','border-bottom','border-left','border-right','padding'].forEach(p=>b.style.removeProperty(p));
 const L='1px solid #1c2a2e';if(v=='box'){b.style.border=L;b.style.padding='4px 8px'}else if(v=='top'){b.style.borderTop=L;b.style.paddingTop='4px'}else if(v=='bottom'){b.style.borderBottom=L;b.style.paddingBottom='4px'}else if(v=='left'){b.style.borderLeft='4px solid #1f8a7a';b.style.paddingLeft='10px'}});pg.oninput()};
$('#wdmk').onclick=()=>{const on=document.body.classList.toggle('marks');$('#wdmk').setAttribute('aria-pressed',on)};
$('#wdlt').onchange=e=>{const v=e.target.value;e.target.value='';if(!v)return;back();let n=rg&&rg.startContainer;n=n&&(n.nodeType==3?n.parentElement:n);const ol=n&&n.closest&&n.closest('ol');if(!ol||!pg.contains(ol)){flash('Đặt con trỏ trong một danh sách số trước.');return}ol.style.listStyleType=v;pg.oninput()};
// tìm & thay trong trang đang mở (Ctrl+H)
const frp=$('#wdfr'),frq=$('#wdq'),frr=$('#wdr'),frc=$('#wdc'),frn=$('#wdn');let fri=-1;
function frList(){const q=frq.value;if(!q)return[];const cs=frc.checked,qq=cs?q:q.toLowerCase(),out=[],w=document.createTreeWalker(pg,NodeFilter.SHOW_TEXT);
 while(w.nextNode()){const n=w.currentNode;if(n.parentElement.closest('svg,figure.dg,[contenteditable="false"]'))continue;const t=cs?n.data:n.data.toLowerCase();let i=0;while((i=t.indexOf(qq,i))>=0){out.push({n,a:i,z:i+q.length});i+=Math.max(1,q.length)}}return out}
function frGo(dir){const L=frList();frn.textContent=L.length?L.length+' kết quả':'Không có';if(!L.length)return;fri=(fri+dir+L.length)%L.length;const m=L[fri],r=document.createRange();r.setStart(m.n,m.a);r.setEnd(m.n,m.z);const s=getSelection();s.removeAllRanges();s.addRange(r);rg=r;
 const el=m.n.parentElement;if(el&&el.scrollIntoView)el.scrollIntoView({block:'center'})}
function frRep(all){if(RO)return;const L=frList();if(!L.length){frn.textContent='Không có';return}const v=frr.value;
 if(all){for(let k=L.length-1;k>=0;k--){const m=L[k];m.n.data=m.n.data.slice(0,m.a)+v+m.n.data.slice(m.z)}frn.textContent='Đã thay '+L.length;pg.oninput();return}
 const s=getSelection(),cur=L.find(m=>s.rangeCount&&s.anchorNode===m.n&&s.getRangeAt(0).startOffset==m.a&&s.getRangeAt(0).endOffset==m.z);
 if(cur){cur.n.data=cur.n.data.slice(0,cur.a)+v+cur.n.data.slice(cur.z);pg.oninput();fri--}frGo(1)}
function frOpen(){frp.hidden=false;const s=rg&&!rg.collapsed&&pg.contains(rg.commonAncestorContainer)?rg.toString():'';if(s&&s.length<80)frq.value=s;frq.focus();frq.select();fri=-1;frGo(0)}
$('#wdfb').onclick=frOpen;
