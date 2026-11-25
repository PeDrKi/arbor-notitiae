// Chữ viết tắt
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
// ===== Chữ viết tắt: lưu danh sách, tự thay khi gõ cách / dấu câu, gợi ý, và dễ quay về chữ gốc =====
// Chế độ: auto = tự thay khi gõ cách, chấm, phẩy, Enter… · suggest = chỉ hiện gợi ý, bấm Tab để thay · off = tắt.
// Muốn giữ nguyên chữ viết tắt: bấm Esc khi gợi ý đang hiện, hoặc bấm Backspace ngay sau khi nó vừa được thay (trở lại đúng chữ gõ ban đầu), hoặc Ctrl+Z.
const AB_KEY='kt_abbr',ABW=/[\p{L}\p{N}_]+$/u,ABD=/^[\s.,;:!?)\]”"'…]$/;
function abSan(v){const mode=['auto','suggest','off'].includes(v.mode)?v.mode:'auto',seen=new Set(),list=[];
 (Array.isArray(v.list)?v.list:[]).forEach(e=>{if(!e||typeof e.a!='string'||typeof e.t!='string')return;const a=e.a.trim(),t=e.t.slice(0,200);
  if(!/^[\p{L}\p{N}_]{1,20}$/u.test(a)||!t||seen.has(a.toLocaleLowerCase('vi')))return;seen.add(a.toLocaleLowerCase('vi'));list.push(e.off?{a,t,off:1}:{a,t})});return{mode,list:list.slice(0,500)}}
let AB={mode:'auto',list:[{a:'ngkh',t:'người khác'}]};
try{const v=JSON.parse(lsGet(AB_KEY)||'null');if(v&&typeof v=='object')AB=abSan(v)}catch(x){}
const abSave=()=>lsSet(AB_KEY,JSON.stringify(AB));
const abFind=w=>{if(!w||AB.mode=='off')return null;const l=w.toLocaleLowerCase('vi');return AB.list.find(e=>!e.off&&e.a.toLocaleLowerCase('vi')==l)||null};
// viết hoa theo cách gõ: Ngkh → Người khác, NGKH → NGƯỜI KHÁC
function abCase(w,t){const up=w.toLocaleUpperCase('vi'),lo=w.toLocaleLowerCase('vi');if(w.length>1&&w==up&&w!=lo)return t.toLocaleUpperCase('vi');if(w[0]!=lo[0])return t[0].toLocaleUpperCase('vi')+t.slice(1);return t}
function wordBefore(){const s=getSelection();if(!s.rangeCount||!s.isCollapsed)return null;const n=s.anchorNode;if(!n||n.nodeType!=3||!pg.contains(n))return null;
 const m=ABW.exec(n.data.slice(0,s.anchorOffset));return m?{node:n,start:m.index,end:s.anchorOffset,word:m[0]}:null}
function abReplace(node,a,z,txt){const r=document.createRange();r.setStart(node,a);r.setEnd(node,z);const s=getSelection();s.removeAllRanges();s.addRange(r);document.execCommand('insertText',false,txt)}
let lastExp=null,skipW=null;const chip=$('#wdchip');
const chipHide=()=>{chip.hidden=true};
function chipUpdate(){if(!ov.classList.contains('on')||RO||AB.mode=='off'||document.activeElement!==pg){chipHide();return}
 const w=wordBefore(),en=w&&abFind(w.word);if(!en||(skipW&&skipW.node===w.node&&skipW.start===w.start)){chipHide();return}
 const s=getSelection(),r=s.getRangeAt(0),rc=r.getClientRects()[0]||(w.node.parentElement.getBoundingClientRect());
 chip.innerHTML=`<b>${esc(en.a)}</b> → ${esc(abCase(w.word,en.t))} <small>${AB.mode=='auto'?'Cách: thay · Esc: giữ nguyên':'Tab: thay · Esc: bỏ qua'}</small>`;
 chip.hidden=false;chip.style.left=Math.max(8,Math.min(innerWidth-chip.offsetWidth-8,rc.left))+'px';chip.style.top=Math.min(innerHeight-chip.offsetHeight-8,rc.bottom+6)+'px'}
pg.addEventListener('beforeinput',e=>{const flow=(e.inputType=='insertText'&&e.data&&e.data.length==1&&ABD.test(e.data))||e.inputType=='insertParagraph';
 if(!flow){lastExp=null;return}
 if(AB.mode=='auto'&&!RO){const w=wordBefore(),en=w&&abFind(w.word);
  if(en&&!(skipW&&skipW.node===w.node&&skipW.start===w.start)){const txt=abCase(w.word,en.t);abReplace(w.node,w.start,w.end,txt);lastExp=e.inputType=='insertText'?{abbr:w.word,exp:txt,delim:e.data}:null;chipHide();return}}
 lastExp=null;skipW=null});
pg.addEventListener('keydown',e=>{
 if(e.key=='Backspace'&&lastExp&&!e.ctrlKey&&!e.metaKey&&!e.altKey){const s=getSelection();
  if(s.rangeCount&&s.isCollapsed&&s.anchorNode&&s.anchorNode.nodeType==3){const n=s.anchorNode,o=s.anchorOffset,L=lastExp.exp+lastExp.delim.replace(/\s/,m=>m),t=n.data.slice(0,o).replace(/ /g,' ');
   if(t.endsWith(lastExp.exp+lastExp.delim.replace(' ',' '))){e.preventDefault();e.stopImmediatePropagation();const len=lastExp.exp.length+lastExp.delim.length;abReplace(n,o-len,o,lastExp.abbr+lastExp.delim);skipW=null;lastExp=null;pg.oninput();return}}
  lastExp=null}
 if(!chip.hidden){if(e.key=='Tab'&&!e.shiftKey){const w=wordBefore(),en=w&&abFind(w.word);if(en){e.preventDefault();e.stopImmediatePropagation();abReplace(w.node,w.start,w.end,abCase(w.word,en.t));lastExp=null;chipHide();pg.oninput();return}}
  if(e.key=='Escape'){const w=wordBefore();if(w)skipW={node:w.node,start:w.start};e.preventDefault();e.stopImmediatePropagation();chipHide()}}},true);
pg.addEventListener('input',chipUpdate);document.addEventListener('selectionchange',()=>{if(document.activeElement===pg)chipUpdate()});pg.addEventListener('blur',chipHide);
chip.onmousedown=e=>e.preventDefault();
chip.onclick=()=>{const w=wordBefore(),en=w&&abFind(w.word);if(en){abReplace(w.node,w.start,w.end,abCase(w.word,en.t));lastExp=null;chipHide();pg.oninput()}};
// ---- cửa sổ quản lý ----
const abp=$('#wdab');
function abRender(){$('#wdam').value=AB.mode;$('#wdal').innerHTML=AB.list.length?AB.list.map((e,i)=>`<div class="abr" data-i="${i}"><input class="aba" value="${esc(e.a)}" aria-label="Chữ viết tắt" maxlength="20"><span>→</span><input class="abt" value="${esc(e.t)}" aria-label="Nghĩa đầy đủ" maxlength="200"><label title="Bật / tắt mục này"><input type="checkbox" class="abo"${e.off?'':' checked'}></label><button class="abx" aria-label="Xoá">✕</button></div>`).join(''):'<p class="abe">Chưa có chữ viết tắt nào. Thêm ở ô bên dưới, hoặc bôi đen một cụm chữ rồi bấm "Viết tắt" để tạo từ cụm đó.</p>'}
function abOpen(){const s=rg&&!rg.collapsed&&pg.contains(rg.commonAncestorContainer)?rg.toString().trim():'';abp.hidden=false;abRender();$('#wdat').value=s&&s.length<=200?s:'';$('#wdaa').value='';(s?$('#wdaa'):$('#wdaa')).focus()}
$('#wdabb').onclick=abOpen;
const abClose=()=>{abp.hidden=true;back()};
abp.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.classList.contains('abx')){AB.list.splice(+b.closest('.abr').dataset.i,1);abSave();abRender()}
 else if(b.id=='wdaadd'){const a=$('#wdaa').value.trim(),t=$('#wdat').value.trim(),v=abSan({mode:AB.mode,list:AB.list.concat([{a,t}])});
  if(v.list.length==AB.list.length){flash(/^[\p{L}\p{N}_]{1,20}$/u.test(a)?(t?'Chữ viết tắt này đã có.':'Hãy nhập nghĩa đầy đủ.'):'Chữ viết tắt chỉ gồm chữ cái / số, tối đa 20 ký tự.');return}
  AB=v;abSave();abRender();$('#wdaa').value='';$('#wdat').value='';$('#wdaa').focus()}
 else if(b.id=='wdaex'){sv('chu-viet-tat.json',new Blob([JSON.stringify(AB,null,1)],{type:'application/json'}))}
 else if(b.id=='wdaim'){$('#wdaf').click()}
 else if(b.id=='wdacl')abClose()});
abp.addEventListener('change',e=>{const t=e.target,row=t.closest('.abr');
 if(t.id=='wdam'){AB.mode=t.value;abSave();chipHide();return}
 if(!row)return;const i=+row.dataset.i,cur=AB.list[i];if(!cur)return;
 const next=Object.assign({},cur);if(t.classList.contains('aba'))next.a=t.value.trim();else if(t.classList.contains('abt'))next.t=t.value;else if(t.classList.contains('abo')){if(t.checked)delete next.off;else next.off=1}
 const list=AB.list.slice();list[i]=next;const v=abSan({mode:AB.mode,list});if(v.list.length!=list.length){flash('Giá trị không hợp lệ hoặc bị trùng.');abRender();return}AB=v;abSave();abRender()});
$('#wdaf').onchange=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const r=new FileReader();r.onload=()=>{try{const v=abSan(JSON.parse(r.result)),have=new Set(AB.list.map(x=>x.a.toLocaleLowerCase('vi')));
  const add=v.list.filter(x=>!have.has(x.a.toLocaleLowerCase('vi')));AB=abSan({mode:AB.mode,list:AB.list.concat(add)});abSave();abRender();flash('Đã nhập '+add.length+' mục mới.')}catch(x){flash('File không đúng định dạng.')}};r.readAsText(f)};
abp.addEventListener('keydown',e=>{if(e.key=='Escape'){e.stopPropagation();abClose()}else if(e.key=='Enter'&&(e.target.id=='wdaa'||e.target.id=='wdat')){e.preventDefault();$('#wdaadd').click()}});

frp.addEventListener('click',e=>{const b=e.target.closest('[data-fr]');if(!b)return;const k=b.dataset.fr;if(k=='next')frGo(1);else if(k=='prev')frGo(-1);else if(k=='one')frRep(0);else if(k=='all')frRep(1);else if(k=='x')frp.hidden=true});
frq.oninput=()=>{fri=-1;const L=frList();frn.textContent=frq.value?(L.length?L.length+' kết quả':'Không có'):''};frc.onchange=frq.oninput;
frp.addEventListener('keydown',e=>{if(e.key=='Enter'){e.preventDefault();frGo(e.shiftKey?-1:1);e.stopPropagation()}else if(e.key=='Escape'){frp.hidden=true;back();e.stopPropagation()}});
document.addEventListener('keydown',e=>{if(ov.classList.contains('on')&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=='h'){e.preventDefault();frOpen()}},true);



pg.addEventListener('change',e=>{if(e.target.type=='checkbox'){e.target.toggleAttribute('checked',e.target.checked);pg.oninput()}});
