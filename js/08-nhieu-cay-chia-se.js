// Nhiều cây, chia sẻ, ảnh, làm sạch HTML
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
function lsKey(id){id=id||TID;return id=='main'?'ktree':'ktree_'+id}
function saveTL(){if(API){try{localStorage.setItem('kt_cur_'+API.id,TID)}catch(x){}return}try{localStorage.setItem('ktree_list',JSON.stringify(TL));localStorage.setItem('ktree_cur',TID)}catch(x){}}
function snapState(){const n=FOC?fOrigN():N;return{N:typeof lkOutN=='function'?lkOutN(n):n,sel,V:FOC&&FV?FV:V,uid,T:typeof lkOutT=='function'?lkOutT(T):T,lv:L,rad:1,LK,DW}}
function srvState(){const s=snapState();delete s.sel;delete s.V;return s}
function loadState(d){focusDrop();d=sanitizeState(withView(d));N=d.N;LK=d.LK||[];DW=d.DW||[];T=d.T||[];L=d.lv||3;V=d.V||{x:innerWidth/2,y:innerHeight/2,k:1};uid=d.uid||uid;sel=d.sel in N?d.sel:root();$('#lv').value=String(L);shown=null;hits=null;ms.clear();msOn=false;lkFrom=null;lkBar();render();xf()}
function blankState(name){N={};uid=1;const r=mk(name,'Gốc của cây này.',null,null);N[r].x=-42;N[r].y=-42;return{N,sel:r,V:{x:innerWidth/2,y:innerHeight/2,k:1},uid,T:[],lv:3,rad:1,LK:[],DW:[]}}
const NOSAVE='Chưa lưu được thay đổi của cây đang mở nên chưa chuyển cây. Hãy kiểm tra mạng rồi thử lại.';
// Trả về false nếu thay đổi của cây đang mở chưa lên được máy chủ
async function flushTree(){if(!TID)return true;clearTimeout(st);if(!API){try{localStorage.setItem(lsKey(),JSON.stringify(snapState()))}catch(x){}return true}
 saveView();clearTimeout(pt2);while(busy)await pushP;if(lock)return true;await doPush();while(busy)await pushP;return lock||pushOk}
function updTmb(){const t=TL.find(x=>x.id==TID);$('#tmb').textContent='Cây: '+(t?t.name:'…')+' ▾'}
async function switchTree(id){if(id==TID)return;if(!await flushTree()){flash(NOSAVE,6000);return}
 if(API){const r=await sb.from('trees').select('data,version').eq('id',id).single();if(r.error){flash('Không mở được cây: '+r.error.message);return}TID=id;ver=r.data.version;lock=false;drf=false;loadState(r.data.data);mkSnap();tryDraft()}
 else{let d=null;try{d=JSON.parse(localStorage.getItem(lsKey(id)))}catch(x){}TID=id;loadState(d&&d.N?d:blankState((TL.find(t=>t.id==id)||{}).name||'Cây'))}
 saveTL();fit(1);tmRender();updTmb()}
async function newTree(){const name=$('#tmq').value.trim()||'Cây mới';if(!await flushTree()){flash(NOSAVE,6000);return}clearTimeout(st);if(API)clearTimeout(pt2);lock=true;const old=snapState(),stt=blankState(name);let id;
 if(API){id=crypto.randomUUID();const r=await sb.from('trees').insert({id,user_id:API.id,name,data:stt,version:1});if(r.error){flash('Không tạo được cây: '+emsg(r.error),6000);N=old.N;uid=old.uid;lock=false;return}ver=1}
 else{id='t'+Date.now().toString(36);try{localStorage.setItem(lsKey(id),JSON.stringify(stt))}catch(x){}}
 TL.push({id,name});TID=id;lock=false;saveTL();loadState(stt);if(API)mkSnap();fit(1);$('#tmq').value='';tmRender();updTmb();flash('Đã tạo cây "'+name+'"')}
async function renameTree(id,name){const t=TL.find(x=>x.id==id);if(!t)return;t.name=name;if(API){const r=await sb.from('trees').update({name}).eq('id',id);if(r.error)flash('Không đổi được tên: '+r.error.message)}else saveTL();tmRender();updTmb()}
function delTree(id){const t=TL.find(x=>x.id==id);if(!t)return;if(TL.length<2){flash('Cần giữ ít nhất một cây');return}
 askDel('Xoá cây "'+t.name+'" cùng mọi note và liên kết trong cây?',async()=>{const was=id==TID;clearTimeout(st);if(API)clearTimeout(pt2);lock=true;
  if(API){const r=await sb.from('trees').delete().eq('id',id);if(r.error){flash('Không xoá được: '+r.error.message);lock=false;return}try{localStorage.removeItem(vwKey(id));localStorage.removeItem(draftKey(id))}catch(x){}}else{try{localStorage.removeItem(lsKey(id))}catch(x){}}
  TL=TL.filter(x=>x.id!=id);if(was){TID=null;lock=false;await switchTree(TL[0].id)}else lock=false;saveTL();tmRender();updTmb();flash('Đã xoá cây "'+t.name+'"')})}
function tmRender(){$('#tml').innerHTML=TL.map(t=>`<div class="ti"><div><b>${esc(t.name)}</b>${t.id==TID?'<small>đang mở</small>':''}</div><span class="row"><button class="pill sm" data-o="${t.id}">Mở</button><button class="pill sm" data-rn="${t.id}">Đổi tên</button>${API?`<button class="pill sm" data-sh="${t.id}">Chia sẻ${t.share_token?' ✓':''}</button>`:''}<button class="pill sm" data-dl="${t.id}">Xoá</button></span></div>`+(API&&t.share_token&&t.shOpen?`<div class="ti"><input readonly value="${esc(location.origin+location.pathname+'?share='+t.share_token)}" style="flex:1;min-width:0" aria-label="Liên kết chia sẻ"><button class="pill sm" data-cp="${t.id}">Sao chép</button><button class="pill sm" data-us="${t.id}">Tắt chia sẻ</button></div>`:'')).join('');$('#tma').style.display=$('#tmi').style.display=API?'':'none'}
$('#tmb').onclick=()=>{tmRender();$('#tm').classList.add('on')};$('#tmx').onclick=()=>$('#tm').classList.remove('on');$('#tmn').onclick=()=>newTree();
$('#tml').onclick=async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.o){await switchTree(d.o);$('#tm').classList.remove('on')}
 else if(d.rn){const nm=$('#tmq').value.trim();if(!nm){flash('Gõ tên mới vào ô phía trên rồi bấm Đổi tên');return}await renameTree(d.rn,nm);$('#tmq').value=''}
 else if(d.dl)delTree(d.dl);else if(d.sh)shareToggle(d.sh);else if(d.us)shareOff(d.us)
 else if(d.cp){const t=TL.find(x=>x.id==d.cp);try{await navigator.clipboard.writeText(location.origin+location.pathname+'?share='+t.share_token);flash('Đã sao chép liên kết')}catch(x){flash('Hãy chọn và sao chép liên kết thủ công')}}};
updTmb();
function tokGen(){const a=new Uint8Array(24);crypto.getRandomValues(a);return btoa(String.fromCharCode(...a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function shareToggle(id){const t=TL.find(x=>x.id==id);if(!t)return;if(t.share_token){t.shOpen=!t.shOpen;tmRender();return}
 const tok=tokGen(),r=await sb.from('trees').update({share_token:tok}).eq('id',id);if(r.error){flash('Không bật được chia sẻ: '+r.error.message);return}t.share_token=tok;t.shOpen=true;tmRender()}
async function shareOff(id){const t=TL.find(x=>x.id==id),r=await sb.from('trees').update({share_token:null}).eq('id',id);if(r.error){flash('Không tắt được chia sẻ: '+r.error.message);return}t.share_token=null;t.shOpen=false;tmRender();flash('Đã tắt chia sẻ. Liên kết cũ không còn hoạt động.')}
const IMG=()=>sb.storage.from('note-images');
// Đưa ảnh nhúng base64 trong các note (và trong thùng rác) vào kho ảnh, để dữ liệu cây gửi lên máy chủ không phình to
async function liftImgs(){if(!API)return 0;const done=new Map(),EXT={jpeg:'jpg',jpg:'jpg',png:'png',gif:'gif',webp:'webp'};let bad=0;
 for(const m of [N].concat(T.map(e=>e.nodes)))for(const i in m){if(m[i]&&m[i].lk)continue;const urls=[...new Set((String(m[i].d||'').match(/src="data:image\/(?:png|jpe?g|gif|webp);base64,[^"]+"/g)||[]).map(x=>x.slice(5,-1)))];
  for(const u of urls){if(bad>=3)return done.size;      // kho ảnh không dùng được: thôi, giữ ảnh nhúng như cũ
   try{let r=done.get(u);
    if(!r){const mt=/^data:(image\/(\w+));base64,/.exec(u),bin=atob(u.slice(mt[0].length)),a=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)a[k]=bin.charCodeAt(k);
     const p=API.id+'/'+crypto.randomUUID()+'.'+EXT[mt[2]],up=await IMG().upload(p,new Blob([a],{type:mt[1]}),{contentType:mt[1]});if(up.error)throw up.error;
     const g=await IMG().createSignedUrl(p,86400);if(g.error)throw g.error;r={p,src:g.data.signedUrl};done.set(u,r);setSync('Đang chuyển ảnh vào kho… ('+done.size+')')}
    if(m[i])m[i].d=String(m[i].d).split('src="'+u+'"').join('src="'+esc(r.src)+'" data-sb="'+esc(r.p)+'"')}catch(x){bad++}}}
 if(done.size&&ov.classList.contains('on'))pg.querySelectorAll('img').forEach(im=>{const r=done.get(im.getAttribute('src'));if(r){im.src=r.src;im.setAttribute('data-sb',r.p)}});
 return done.size}
async function imgList(){const out=[];for(let off=0;;off+=1000){const l=await IMG().list(API.id,{limit:1000,offset:off});if(l.error)throw l.error;out.push(...l.data.filter(f=>f.id));if(l.data.length<1000)break}return out}
async function imgRemove(paths){let n=0;for(let i=0;i<paths.length;i+=100){const x=await IMG().remove(paths.slice(i,i+100));if(x.error)throw Object.assign(x.error,{done:n});n+=Math.min(100,paths.length-i)}return n}
// Dọn ảnh thừa: chỉ xoá ảnh đã tải lên quá 1 ngày mà không note nào (kể cả note trong thùng rác, ở mọi cây) còn dùng
$('#tmi').onclick=async()=>{if(!await flushTree()){flash(NOSAVE,6000);return}
 try{const r=await sb.from('trees').select('data').eq('user_id',API.id);if(r.error)throw r.error;
  const used=new Set(),scan=m=>{for(const i in m||{}){const g=String(m[i]&&m[i].d||'').match(/data-sb="([^"]+)"/g);if(g)g.forEach(x=>used.add(x.slice(9,-1)))}};
  r.data.forEach(t=>{const d=t.data||{};scan(d.N);(Array.isArray(d.T)?d.T:[]).forEach(e=>scan(e&&e.nodes))});scan(N);T.forEach(e=>scan(e.nodes));
  const old=Date.now()-864e5,dead=(await imgList()).map(f=>({p:API.id+'/'+f.name,t:new Date(f.created_at).getTime()})).filter(f=>!used.has(f.p)&&f.t<old).map(f=>f.p);
  if(!dead.length){flash('Không có ảnh thừa nào để dọn.');return}
  askDel('Xoá hẳn '+dead.length+' ảnh trong kho mà không còn note nào dùng (đã tính cả note trong thùng rác của mọi cây)?',async()=>{try{flash('Đã dọn '+await imgRemove(dead)+' ảnh không còn dùng.')}catch(x){flash('Dọn được '+(x.done||0)+' ảnh rồi gặp lỗi: '+(x.message||'lỗi không rõ'),6000)}})
 }catch(x){flash('Không dọn được ảnh: '+(x.message||'lỗi không rõ'),6000)}};
$('#tma').onclick=()=>askDel('Xoá tài khoản '+API.email+' cùng mọi cây, note và ảnh của bạn?',async()=>{try{
 try{await imgRemove((await imgList()).map(x=>API.id+'/'+x.name))}catch(x){}
 const r=await sb.rpc('delete_my_account');if(r.error){flash('Không xoá được tài khoản: '+r.error.message);return}
 lock=true;await sb.auth.signOut();try{localStorage.removeItem('kt_cur_'+API.id)}catch(x){}location.reload()}catch(x){flash('Không xoá được tài khoản')}});
$('#bu').onclick=async()=>{let NN=N;
 if(API){NN=JSON.parse(JSON.stringify(N));const paths=new Set();for(const i in NN){const m=(NN[i].d||'').match(/data-sb="([^"]+)"/g);if(m)m.forEach(x=>paths.add(x.slice(9,-1)))}
  if(paths.size){const ps=[...paths],r=await sb.storage.from('note-images').createSignedUrls(ps,600),map={};
   await Promise.all((r.data||[]).map(async(x,i)=>{try{const b=await(await fetch(x.signedUrl)).blob();map[ps[i]]=await new Promise(z=>{const f=new FileReader();f.onload=()=>z(f.result);f.readAsDataURL(b)})}catch(e){}}));
   for(const i in NN)if(NN[i].d){const t=document.createElement('div');t.innerHTML=clean(NN[i].d);t.querySelectorAll('img[data-sb]').forEach(im=>{const u=map[im.dataset.sb];if(u){im.src=u;im.removeAttribute('data-sb')}});NN[i].d=t.innerHTML}}}
 sv('arbor-notitiae.json',JSON.stringify({v:1,N:NN,V,sel,uid,T,lv:L,LK,DW,KB}))};
// CSS trong sơ đồ: chỉ giữ các luật bó trong chính sơ đồ đó (bộ chọn bắt đầu bằng #mm…), để không đụng được tới giao diện trang
function scopeCss(css,id){css=css.replace(/@import[^;]*;?/gi,'').replace(/url\(\s*(?!['"]?#)[^)]*\)/gi,'none');
 try{const s=new CSSStyleSheet();s.replaceSync(css);return[...s.cssRules].filter(r=>r.type==1&&r.selectorText.split(',').every(x=>x.trim().startsWith('#'+id))).map(r=>r.cssText).join('')}catch(x){return css}}
// Lọc HTML của trang note: DOMPurify (nếu đã nạp) rồi tới lớp lọc riêng bên dưới
function clean(h){if(!h)return'';if(window.DOMPurify&&DOMPurify.isSupported)h=DOMPurify.sanitize(h,PUR);const doc=new DOMParser().parseFromString('<body>'+h,'text/html');
 const walk=el=>{[...el.children].forEach(c=>{const t=c.localName;if(OKB.test(t)||(t=='input'&&c.getAttribute('type')!='checkbox')){c.remove();return}
  if(t=='style'){const sv=c.closest('svg');if(!sv||!/^mm\d+$/.test(sv.id)){c.remove();return}c.textContent=scopeCss(c.textContent,sv.id)}
  if(t=='img')c.setAttribute('referrerpolicy','no-referrer');
  if(c.style&&/fixed|sticky/.test(c.style.position))c.style.removeProperty('position');
  [...c.attributes].forEach(a=>{const n=a.name.toLowerCase(),v=a.value;
   if(n.startsWith('on')||n=='srcdoc'||n=='formaction'||n=='action'){c.removeAttribute(a.name);return}
   if((n=='href'||n=='xlink:href'||n=='src'||n=='data'||n=='poster')&&!/^\s*(https?:|#|\/|mailto:|data:image\/(png|jpe?g|gif|webp);base64,)/i.test(v)){c.removeAttribute(a.name);return}
   if(n=='style'&&/expression\(|javascript:|@import|url\(\s*(?!['"]?#)/i.test(v))c.removeAttribute(a.name)});
  if(t=='a'&&c.getAttribute('target')=='_blank')c.setAttribute('rel','noopener noreferrer');walk(c)})};
 walk(doc.body);return doc.body.innerHTML}
function txt(h){return new DOMParser().parseFromString('<body>'+h,'text/html').body.textContent.trim()}
