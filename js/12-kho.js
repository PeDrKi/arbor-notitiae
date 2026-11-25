// Kho: cất note
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
// ===== Kho: cất note đi (ẩn khỏi cây), giữ vô thời hạn; dùng chung mảng T với thùng rác nhưng đánh dấu ar:1 =====
function stash(id,mode){const n=N[id];if(RO||!n||!n.p)return;let kept=0;
 if(mode!='one')kept=rescue(id);
 const p=N[N[id].p],idx=p.c.indexOf(id),e={tid:'t'+Date.now(),at:Date.now(),id,idx,par:p.id,ar:1,nodes:{},lk:[]};
 if(mode=='one'){const kids=N[id].c.slice();e.nodes[id]=Object.assign({},N[id],{c:[]});e.lk=LK.filter(l=>l.a==id||l.b==id);LK=LK.filter(l=>l.a!=id&&l.b!=id);
  kids.forEach(c=>{N[c].p=p.id;delete N[c].hid});p.c.splice(idx,1,...kids);delete N[id]}
 else{const ids=desc(id);ids.forEach(i=>e.nodes[i]=N[i]);e.lk=LK.filter(l=>ids.includes(l.a)||ids.includes(l.b));LK=LK.filter(l=>!ids.includes(l.a)&&!ids.includes(l.b));ids.forEach(i=>delete N[i]);p.c=p.c.filter(c=>c!=id)}
 T.unshift(e);sel=p.id;render();undoBar(e);if(kept)flash(kept+' note dùng chung được giữ lại ở nhánh khác của chúng.',6000)}
async function stashAsk(id){const n=N[id];if(RO||!n||!n.p)return;let mode='all';
 if(n.c.length){const r=await lkModal({title:'Cất vào kho',msg:'“'+(n.t||'Chưa đặt tên')+'” có '+(desc(id).length-1)+' note con. Cất thế nào?',fields:[],ok:'Cất cả nhánh',extras:[{label:'Chỉ cất note này (các con chuyển lên note cha)',ret:'one'}]});
  if(!r)return;mode=r.extra=='one'?'one':'all'}
 stash(id,mode)}
const arTxt=e=>Object.values(e.nodes).map(n=>(n.t||'')+' '+(n.b||'')+' '+(n.d?txt(n.d):'')).join(' ').toLowerCase();
function arUI(){const q=($('#arq').value||'').trim().toLowerCase(),a=T.filter(e=>e.ar).filter(e=>!q||arTxt(e).includes(q));
 $('#arl').innerHTML=a.length?a.map(e=>{const r=e.nodes[e.id],c=Object.keys(e.nodes).length;return `<div class="ti"><div><b>${r.lk?'🔒 ':''}${esc(r.t||'Chưa đặt tên')}</b><small>${c} note · cất lúc ${fd(e.at)}</small></div><span class="row"><button class="pill sm" data-r="${esc(e.tid)}">Lấy ra</button><button class="pill sm" data-p="${esc(e.tid)}">Xoá hẳn</button></span></div>`}).join(''):'<p class="mu">'+(q?'Không có note nào khớp.':'Kho trống. Mở bảng note → “⋯ Thao tác” → “📦 Cất vào kho”.')+'</p>';trashLbl()}
const arOpen=()=>{$('#arq').value='';arUI();$('#ar').classList.add('on');setTimeout(()=>$('#arq').focus(),30)},arClose=()=>$('#ar').classList.remove('on');
$('#arb').onclick=arOpen;$('#arx').onclick=arClose;$('#ar').addEventListener('pointerdown',e=>{if(e.target==$('#ar'))arClose()});$('#arq').oninput=arUI;
document.addEventListener('keydown',e=>{if(e.key=='Escape'&&$('#ar').classList.contains('on')&&!$('#cfm').classList.contains('on')){arClose();e.stopImmediatePropagation()}},true);
$('#arl').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.r){const t=b.dataset.r;arClose();slide(()=>restore(t));arUI();flash('Đã lấy ra khỏi kho')}
 else if(b.dataset.p){const t=b.dataset.p,x=T.find(z=>z.tid==t);if(x)askDel('Xoá hẳn "'+(x.nodes[x.id].t||'note')+'" khỏi kho?',()=>{T=T.filter(z=>z.tid!=t);arUI();render()})}};
$('#arpk').onclick=()=>stashAsk(sel);
const panel1=panel;panel=function(){panel1.apply(this,arguments);const n=sel&&N[sel];$('#arpk').style.display=n&&n.p?'':'none'};
trashLbl();

