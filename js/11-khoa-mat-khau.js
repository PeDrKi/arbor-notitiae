// Khoá note bằng mật khẩu
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
// ===== Khoá note bằng mật khẩu: mã hoá AES-GCM ngay trên máy; máy chủ chỉ thấy dữ liệu đã mã hoá =====
// Mỗi note khoá có một khoá dữ liệu K ngẫu nhiên. K được bọc hai lần: bằng mật khẩu (PBKDF2) và bằng "mã khôi phục" (cũng qua PBKDF2).
// Nội dung trang, tóm tắt và nét vẽ tay của note được mã hoá thành N[id].lk.c. Tiêu đề vẫn để rõ để nhận ra note trên cây.
const LKE=new TextEncoder(),LKD=new TextDecoder();
const lkB64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const lkUn=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
function lkSan(v){if(!v||typeof v!='object'||v.v!==1)return null;const o={v:1};
 for(const k of['s','w','rs','r','c']){if(typeof v[k]!='string'||!LKB.test(v[k])||v[k].length>LK_CAP||(k!='c'&&v[k].length>400))return null;o[k]=v[k]}
 o.i=Math.min(1e6,Math.max(1e4,+v.i||LK_IT));if(typeof v.h=='string'&&v.h)o.h=v.h.slice(0,120);return o}
const lkOk=()=>!!(window.crypto&&crypto.subtle);
async function lkPw(pass,salt,it){const b=await crypto.subtle.importKey('raw',LKE.encode(pass),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},b,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function lkSeal(key,bytes){const iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes)),o=new Uint8Array(12+ct.length);o.set(iv);o.set(ct,12);return lkB64(o)}
async function lkOpen(key,b64){const u=lkUn(b64);return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:u.subarray(0,12)},key,u.subarray(12)))}
const lkRaw=u=>crypto.subtle.importKey('raw',u,'AES-GCM',false,['encrypt','decrypt']);
const LK_AL='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function lkNewCode(){const u=crypto.getRandomValues(new Uint8Array(20));let s='';for(const x of u)s+=LK_AL[x&31];return s.match(/.{4}/g).join('-')}
const lkNorm=c=>String(c||'').toUpperCase().replace(/O/g,'0').replace(/[IL]/g,'1').replace(/[^0-9A-Z]/g,'');
const lkSig=n=>(n.d||'')+'\u0001'+(n.b||'')+'\u0001'+JSON.stringify(n.dw||[]);
const lkPay=n=>JSON.stringify({d:n.d||'',b:n.b||'',dw:n.dw||[]});
// ---- trạng thái trong phiên ----
function lkHidden(id){return !!(N[id]&&N[id].lk&&!KEYS[id])}
function lkNodes(){const a=[];for(const i in N)a.push(N[i]);T.forEach(e=>{for(const i in e.nodes)a.push(e.nodes[i])});return a.filter(n=>n&&n.lk&&KEYS[n.id])}
function lkOutNote(n){if(!n||!n.lk)return n;const o=Object.assign({},n);delete o.d;delete o.dw;o.b='';return o}
function lkOutN(m){let r=m;for(const i in m)if(m[i]&&m[i].lk){if(r===m)r=Object.assign({},m);r[i]=lkOutNote(m[i])}return r}
function lkOutT(t){return t.map(e=>{let c=false;const nodes={};for(const i in e.nodes){nodes[i]=lkOutNote(e.nodes[i]);if(nodes[i]!==e.nodes[i])c=true}return c?Object.assign({},e,{nodes}):e})}
const lkNv=()=>lkOutN(N);
let lkP=Promise.resolve(),lkTm=0;const LKG={},LKBUSY=new Set(),LKJUST=new Set();
function lkFlush(){lkP=lkP.then(async()=>{let ch=false;
 for(const n of lkNodes()){const k=KEYS[n.id],s=lkSig(n);if(LKC[n.id]===s)continue;try{n.lk.c=await lkSeal(k,LKE.encode(lkPay(n)));LKC[n.id]=s;ch=true}catch(x){}}
 if(ch&&typeof lkSave=='function')lkSave()}).catch(()=>{});return lkP}
function lkSched(){clearTimeout(lkTm);if(Object.keys(KEYS).length)lkTm=setTimeout(lkFlush,500)}
// ---- tạo / mở / khoá lại ----
async function lkCtx(pass,code){const salt=crypto.getRandomValues(new Uint8Array(16)),rs=crypto.getRandomValues(new Uint8Array(16));
 return{code,salt,rs,kp:await lkPw(pass,salt,LK_IT),kr:await lkPw(lkNorm(code),rs,LK_IT)}}
async function lkCreate(id,pass,hint,ctx){const n=N[id],K=crypto.getRandomValues(new Uint8Array(32));ctx=ctx||await lkCtx(pass,lkNewCode());const{salt,rs,kp,kr,code}=ctx,key=await lkRaw(K);
 const lk={v:1,i:LK_IT,s:lkB64(salt),w:await lkSeal(kp,K),rs:lkB64(rs),r:await lkSeal(kr,K),c:await lkSeal(key,LKE.encode(lkPay(n)))};if(hint)lk.h=hint.slice(0,120);
 n.lk=lk;KEYS[id]=key;KRAW[id]=K;LKC[id]=lkSig(n);n.md=Date.now();return code}
async function lkUnlockWith(id,how,secret){const n=N[id],L=n.lk;let K;
 if(how=='p')K=await lkOpen(await lkPw(secret,lkUn(L.s),L.i),L.w);else K=await lkOpen(await lkPw(lkNorm(secret),lkUn(L.rs),L.i),L.r);
 const key=await lkRaw(K),p=JSON.parse(LKD.decode(await lkOpen(key,L.c)));
 n.d=typeof p.d=='string'?p.d:'';n.b=typeof p.b=='string'?p.b:'';if(Array.isArray(p.dw)&&p.dw.length)n.dw=p.dw;else delete n.dw;
 KEYS[id]=key;KRAW[id]=K;LKC[id]=lkSig(n);return K}
async function lkRewrap(id,pass,hint){const n=N[id],K=KRAW[id],salt=crypto.getRandomValues(new Uint8Array(16));n.lk.s=lkB64(salt);n.lk.i=LK_IT;n.lk.w=await lkSeal(await lkPw(pass,salt,LK_IT),K);if(hint)n.lk.h=hint.slice(0,120);else delete n.lk.h;n.md=Date.now()}
async function lkRelock(id){if(!KEYS[id])return;await lkFlush();const n=N[id];if(n&&n.lk&&KEYS[id]){n.d='';n.b='';delete n.dw}
 for(const e of T)if(e.nodes[id]&&e.nodes[id].lk){const x=e.nodes[id];x.d='';x.b='';delete x.dw}
 delete KEYS[id];delete KRAW[id];delete LKC[id];
 if(sel==id&&typeof pg!='undefined'){pg.innerHTML=''}
 WS.forEach(w=>{if(w.note==id&&w.body&&w.body.classList.contains('snap'))lkSnapMask(w)});render()}
function lkReset(){for(const k in KEYS)delete KEYS[k];for(const k in KRAW)delete KRAW[k];for(const k in LKC)delete LKC[k]}
function lkSweep(){if(!Object.keys(KEYS).length)return;const vis=new Set(ov.classList.contains('on')?WS.filter(w=>!w.min).map(w=>w.note):[]);let wait=false;
 for(const id of Object.keys(KEYS)){if(vis.has(id)||LKBUSY.has(id))continue;if((LKG[id]||0)>Date.now()){wait=true;continue}lkRelock(id)}
 if(wait)setTimeout(lkSweep,700)}
const lkSweepSoon=()=>setTimeout(lkSweep,0);
function lkSnapMask(w){w.body.innerHTML='<div class="psp lkm"><b>🔒 Note đã khoá</b><p>Bấm vào cửa sổ này để nhập mật khẩu.</p></div>'}
// ---- hộp thoại ----
const lkDlg=$('#lkd');
function lkModal(o){return new Promise(res=>{
 $('#lkdt').textContent=o.title;$('#lkdp').textContent=o.msg||'';const f=$('#lkdf');f.innerHTML='';const E=$('#lkde');E.textContent='';
 const inp={};(o.fields||[]).forEach(d=>{const l=document.createElement('label');l.className='lkl';l.append(d.label);const i=document.createElement('input');i.type=d.type||'password';i.id='lkf_'+d.id;i.placeholder=d.ph||'';i.value=d.val||'';i.autocomplete=d.type=='text'?'off':(d.ac||'off');if(d.ro)i.readOnly=true;i.maxLength=d.max||200;i.spellcheck=false;l.appendChild(i);f.appendChild(l);inp[d.id]=i});
 const ex=$('#lkdx');ex.innerHTML='';(o.extras||[]).forEach(x=>{const b=document.createElement('button');b.type='button';b.className='lkf';b.textContent=x.label;b.onclick=()=>{if(x.keep){x.fn(vals());return}done({extra:x.ret})};ex.appendChild(b)});
 const vals=()=>{const v={};for(const k in inp)v[k]=inp[k].value;return v};
 const ok=$('#lkdy'),no=$('#lkdn');ok.textContent=o.ok||'OK';no.style.display=o.noCancel?'none':'';let busy=false;
 function done(r){lkDlg.hidden=true;document.removeEventListener('keydown',kd,true);ok.onclick=no.onclick=null;res(r)}
 async function go(){if(busy)return;busy=true;ok.disabled=true;E.textContent='';try{const v=vals(),er=o.check?await o.check(v):null;if(er){E.textContent=er;busy=false;ok.disabled=false;const fi=Object.values(inp)[0];if(fi&&!fi.readOnly){fi.focus();fi.select()}return}done({ok:true,v})}catch(x){E.textContent='Có lỗi, hãy thử lại.';busy=false;ok.disabled=false}}
 const kd=e=>{if(e.key=='Escape'&&!o.noCancel){e.preventDefault();e.stopPropagation();done(null)}else if(e.key=='Enter'&&e.target.tagName=='INPUT'&&!e.target.readOnly){e.preventDefault();e.stopPropagation();go()}else if(e.key=='Tab'){const els=[...lkDlg.querySelectorAll('input:not([readonly]),button')].filter(x=>x.offsetParent);if(!els.length)return;const a=document.activeElement,i=els.indexOf(a);if(e.shiftKey&&i<=0){e.preventDefault();els[els.length-1].focus()}else if(!e.shiftKey&&i==els.length-1){e.preventDefault();els[0].focus()}}};
 document.addEventListener('keydown',kd,true);ok.onclick=go;no.onclick=()=>done(null);lkDlg.hidden=false;ok.disabled=false;
 const fi=Object.values(inp).find(x=>!x.readOnly);setTimeout(()=>{(fi||ok).focus()},30)})}
// ---- luồng giao diện ----
const LKMIN=4;
async function lkAsk(id){if(!lkHidden(id))return true;if(!lkOk()){flash('Trình duyệt này không hỗ trợ mã hoá (cần https hoặc localhost).',5000);return false}
 LKBUSY.add(id);try{for(;;){const n=N[id],r=await lkModal({title:'🔒 Note đã khoá',msg:'“'+(n.t||'Chưa đặt tên')+'”'+(n.lk.h?' — Gợi ý: '+n.lk.h:''),fields:[{id:'p',label:'Mật khẩu',ph:'Nhập mật khẩu của note này'}],ok:'Mở khoá',extras:[{label:'Quên mật khẩu?',ret:'forgot'}],
   check:async v=>{if(!v.p)return'Hãy nhập mật khẩu.';try{await lkUnlockWith(id,'p',v.p);return null}catch(x){return'Sai mật khẩu.'}}});
  if(!r)return false;if(r.ok){LKG[id]=Date.now()+2500;LKJUST.add(id);render();return true}
  if(r.extra=='forgot'){const q=await lkModal({title:'Quên mật khẩu',msg:'Nhập mã khôi phục đã lưu khi bạn khoá note, rồi đặt mật khẩu mới. (Mật khẩu cũ không thể xem lại vì được mã hoá một chiều — chỉ có thể đặt mật khẩu mới.)',
    fields:[{id:'c',label:'Mã khôi phục',type:'text',ph:'XXXX-XXXX-…',max:60},{id:'p',label:'Mật khẩu mới',ph:'Ít nhất '+LKMIN+' ký tự'},{id:'q',label:'Nhập lại mật khẩu mới'}],ok:'Đặt lại và mở khoá',
    check:async v=>{if(v.p.length<LKMIN)return'Mật khẩu mới cần ít nhất '+LKMIN+' ký tự.';if(v.p!==v.q)return'Hai mật khẩu chưa giống nhau.';try{await lkUnlockWith(id,'r',v.c)}catch(x){return'Mã khôi phục không đúng.'}await lkRewrap(id,v.p,N[id].lk.h||'');return null}});
   if(q&&q.ok){LKG[id]=Date.now()+2500;LKJUST.add(id);save();render();flash('Đã đặt mật khẩu mới.');return true}}}}finally{LKBUSY.delete(id);setTimeout(lkSweep,3000)}}
async function lkShowCode(code,head,fname){
 const dl=()=>{const b=new Blob([head+'\n'+code+'\n\nGiữ mã này ở nơi an toàn. Có mã này là đặt lại được mật khẩu và mở được note.\n'],{type:'text/plain'});sv(fname,b)};
 for(;;){const q=await lkModal({title:'Lưu mã khôi phục',msg:'Nếu quên mật khẩu, mã này là cách DUY NHẤT lấy lại note (và để đặt mật khẩu mới). Chỉ hiện một lần — hãy chép hoặc tải về rồi cất kỹ.',fields:[{id:'c',label:'Mã khôi phục',type:'text',val:code,ro:1}],ok:'Tôi đã lưu mã',noCancel:true,
  extras:[{label:'Sao chép mã',keep:true,fn:()=>{(navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(()=>flash('Đã sao chép mã khôi phục.'),()=>flash('Không sao chép được, hãy chọn và chép tay.'))}},{label:'Tải về (.txt)',keep:true,fn:dl}]});
  if(q&&q.ok)return}}
// Khoá cả nhánh: mọi note chưa khoá trong nhánh dùng chung 1 mật khẩu và 1 mã khôi phục (mỗi note vẫn có khoá dữ liệu riêng, nhập mật khẩu riêng khi mở)
async function lkBranchFlow(id){if(RO||!N[id])return;if(!lkOk()){flash('Trình duyệt này không hỗ trợ mã hoá (cần https hoặc localhost).',5000);return}
 const ids=desc(id).filter(i=>!N[i].lk),skip=desc(id).length-ids.length;if(!ids.length){flash('Mọi note trong nhánh đã được khoá.');return}
 ids.forEach(i=>LKBUSY.add(i));try{
  const r=await lkModal({title:'Khoá cả nhánh',msg:'Khoá '+ids.length+' note trong nhánh “'+(N[id].t||'Chưa đặt tên')+'” bằng cùng một mật khẩu'+(skip?' (bỏ qua '+skip+' note đã khoá từ trước)':'')+'. Khi mở, nhập mật khẩu riêng ở từng note. Chỉ có một mã khôi phục chung cho cả nhánh.',
   fields:[{id:'p',label:'Mật khẩu',ph:'Ít nhất '+LKMIN+' ký tự'},{id:'q',label:'Nhập lại mật khẩu'},{id:'h',label:'Gợi ý mật khẩu (không bắt buộc, ai cũng thấy)',type:'text',max:120}],ok:'Khoá '+ids.length+' note',
   check:async v=>{if(v.p.length<LKMIN)return'Mật khẩu cần ít nhất '+LKMIN+' ký tự.';if(v.p!==v.q)return'Hai mật khẩu chưa giống nhau.';if(v.h&&v.h.includes(v.p))return'Gợi ý không nên chứa mật khẩu.';return null}});
  if(!r||!r.ok)return;const ctx=await lkCtx(r.v.p,lkNewCode());
  for(const i of ids)await lkCreate(i,r.v.p,r.v.h,ctx);
  await lkFlush();save();render();
  await lkShowCode(ctx.code,'Mã khôi phục cho nhánh “'+(N[id].t||'')+'” ('+ids.length+' note)','ma-khoi-phuc-nhanh-'+id+'.txt');
  flash('Đã khoá '+ids.length+' note.')}finally{ids.forEach(i=>LKBUSY.delete(i));setTimeout(lkSweep,0)}}
// Thêm note mới vào nhánh đã khoá: hỏi có muốn khoá luôn không
async function lkOfferNew(id){if(RO||!N[id])return;const r=await lkModal({title:'Khoá note mới?',msg:'Note mới nằm trong nhánh đã khoá mật khẩu. Bạn có muốn khoá luôn không?',fields:[],ok:'Khoá note này'});
 if(r&&r.ok)lkSetFlow(id);else{const t=$('#pt');if(t)t.focus()}}
async function lkSetFlow(id){if(RO||!N[id])return;if(!lkOk()){flash('Trình duyệt này không hỗ trợ mã hoá (cần https hoặc localhost).',5000);return}
 const had=!!N[id].lk;LKBUSY.add(id);try{if(had&&!await lkAsk(id))return;
  const r=await lkModal({title:had?'Đổi mật khẩu':'Đặt mật khẩu cho note',msg:had?'Nhập mật khẩu mới cho note này.':'Nội dung, tóm tắt và nét vẽ của note sẽ được mã hoá. Tiêu đề vẫn hiện trên cây. Khoá lại ngay khi bạn đóng trang.',
   fields:[{id:'p',label:'Mật khẩu',ph:'Ít nhất '+LKMIN+' ký tự'},{id:'q',label:'Nhập lại mật khẩu'},{id:'h',label:'Gợi ý mật khẩu (không bắt buộc, ai cũng thấy)',type:'text',ph:'Ví dụ: tên con mèo + năm sinh',val:had?(N[id].lk.h||''):'',max:120}],ok:had?'Đổi mật khẩu':'Khoá note',
   check:async v=>{if(v.p.length<LKMIN)return'Mật khẩu cần ít nhất '+LKMIN+' ký tự.';if(v.p!==v.q)return'Hai mật khẩu chưa giống nhau.';if(v.h&&v.h.includes(v.p))return'Gợi ý không nên chứa mật khẩu.';return null}});
  if(!r||!r.ok)return;const{p,h}=r.v;
  if(had){await lkRewrap(id,p,h);save();flash('Đã đổi mật khẩu.');return}
  const code=await lkCreate(id,p,h);await lkFlush();save();render();
  await lkShowCode(code,'Mã khôi phục note “'+(N[id].t||'')+'”','ma-khoi-phuc-'+id+'.txt');
  flash('Đã khoá note.');}finally{LKBUSY.delete(id);setTimeout(lkSweep,0)}}
async function lkRemoveFlow(id){if(RO||!N[id]||!N[id].lk)return;LKBUSY.add(id);try{if(!await lkAsk(id))return;
  const r=await lkModal({title:'Bỏ khoá note',msg:'Note sẽ không còn được mã hoá và ai mở cây cũng đọc được.',fields:[],ok:'Bỏ khoá'});if(!r||!r.ok)return;
  const n=N[id];delete n.lk;delete KEYS[id];delete KRAW[id];delete LKC[id];n.md=Date.now();save();render();flash('Đã bỏ khoá note.')}finally{LKBUSY.delete(id);setTimeout(lkSweep,0)}}
function lkPanel(){const id=sel,n=id&&N[id];if(!n)return;const h=lkHidden(id);
 $('#lkset').textContent=n.lk?'🔑 Đổi mật khẩu':'🔒 Đặt mật khẩu';$('#lkrm').style.display=n.lk?'':'none';$('#lkbr').style.display=n.c.length&&desc(id).some(i=>!N[i].lk)?'':'none';
 if(h){$('#pb').value='***';$('#pb').readOnly=true}}
$('#lkset').onclick=()=>lkSetFlow(sel);$('#lkbr').onclick=()=>lkBranchFlow(sel);$('#lkrm').onclick=()=>lkRemoveFlow(sel);
// ---- móc vào luồng cũ ----
function lkSave(){if(typeof save0=='function')save0()}
const add0=add;add=function(p){add0.apply(this,arguments);if(N[p]&&N[p].lk&&sel&&N[sel]&&N[sel].p==p&&!N[sel].lk)setTimeout(()=>lkOfferNew(sel),60)};
const save0=save;save=function(){lkSched();return save0.apply(this,arguments)};
const panel0=panel;panel=function(){panel0.apply(this,arguments);lkPanel()};
const openDoc0=openDoc;openDoc=function(id,fresh){if(N[id]&&lkHidden(id)){lkAsk(id).then(ok=>{if(ok)openDoc0(id,fresh)});return}if(N[id]&&KEYS[id])LKG[id]=Date.now()+2500;openDoc0(id,fresh)};
const wOpenWin0=wOpenWin;wOpenWin=function(id){const w=wById(id);if(w&&lkHidden(w.note)){lkAsk(w.note).then(ok=>{if(ok)wOpenWin0(id)});return}wOpenWin0(id)};
const wActivate0=wActivate;wActivate=function(w,f){if(LKJUST.has(w.note)){LKJUST.delete(w.note);f=true}if(lkHidden(w.note)){lkAsk(w.note).then(ok=>{if(ok)wActivate0(w,true)});return}wActivate0(w,f);delete LKG[w.note];lkSweepSoon()};
const wSnapRender0=wSnapRender;wSnapRender=function(w){wSnapRender0.apply(this,arguments);if(lkHidden(w.note))lkSnapMask(w)};
const wClose0=wClose;wClose=function(w){wClose0.apply(this,arguments);lkSweepSoon()};
const wMin0=wMin;wMin=function(w){wMin0.apply(this,arguments);lkSweepSoon()};
const loadState0=loadState;loadState=function(){lkReset();return loadState0.apply(this,arguments)};
const applyMerge0=applyMerge;applyMerge=function(){const ids=Object.keys(KEYS),keys=Object.assign({},KEYS);applyMerge0.apply(this,arguments);
 ids.forEach(async id=>{const n=N[id];if(!n||!n.lk){delete KEYS[id];return}try{const p=JSON.parse(LKD.decode(await lkOpen(keys[id],n.lk.c)));n.d=p.d||'';n.b=p.b||'';if(p.dw&&p.dw.length)n.dw=p.dw;else delete n.dw;LKC[id]=lkSig(n);
  if(sel==id&&ov.classList.contains('on')){pg.innerHTML=clean(n.d||'');refreshImgs();inkDraw(PGX)}render()}catch(x){delete KEYS[id];delete KRAW[id];delete LKC[id]}})};
new MutationObserver(lkSweepSoon).observe(ov,{attributes:true,attributeFilter:['class']});new MutationObserver(lkSweepSoon).observe(wsp,{childList:true});
