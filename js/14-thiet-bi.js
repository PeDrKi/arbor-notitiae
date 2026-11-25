// Thiết bị đã đăng nhập
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
// ===== Thiết bị đã đăng nhập: danh sách, trạng thái hoạt động, đăng xuất từ xa (cần phần 8 của supabase.sql) =====
const DEVK='arbor.dev';let DEV='',devTm=0,devOpenTm=0,devMissing=false;
function devId(){if(DEV)return DEV;try{DEV=localStorage.getItem(DEVK)||''}catch(e){}
 if(!/^[0-9a-f-]{36}$/.test(DEV)){DEV=crypto.randomUUID();try{localStorage.setItem(DEVK,DEV)}catch(e){}}return DEV}
function devName(){const u=navigator.userAgent;
 const os=/Windows/.test(u)?'Windows':/Android/.test(u)?'Android':/iPad/.test(u)?'iPad':/iPhone|iPod/.test(u)?'iPhone':/Mac OS X/.test(u)?'macOS':/CrOS/.test(u)?'ChromeOS':/Linux/.test(u)?'Linux':'Thiết bị';
 const br=/Edg\//.test(u)?'Edge':/OPR\/|Opera/.test(u)?'Opera':/Firefox\/|FxiOS/.test(u)?'Firefox':/Chrome\/|CriOS/.test(u)?'Chrome':/Safari\//.test(u)?'Safari':'Trình duyệt';
 let pwa=false;try{pwa=matchMedia('(display-mode: standalone)').matches}catch(e){}return br+' · '+os+(pwa?' (ứng dụng)':'')}
function devAgo(t){const s=Math.max(0,(Date.now()-new Date(t).getTime())/1000);if(s<90)return 'vừa xong';if(s<3600)return Math.round(s/60)+' phút trước';if(s<86400)return Math.round(s/3600)+' giờ trước';return Math.round(s/86400)+' ngày trước'}
async function devRevokedLocal(){if(lock)return;lock=true;try{sessionStorage.setItem('arbor.revoked','1')}catch(e){}
 try{await sb.auth.signOut({scope:'local'})}catch(x){}try{if(API)localStorage.removeItem('kt_cur_'+API.id)}catch(x){}location.reload()}
async function devTouch(){if(!API||!sb||devMissing||lock)return;
 try{const r=await sb.rpc('touch_device',{p_id:devId(),p_name:devName(),p_ua:''});
  if(r.error){if(/PGRST202|42883|Could not find|does not exist/i.test((r.error.code||'')+' '+(r.error.message||'')))devMissing=true;return}
  if(r.data==='revoked')devRevokedLocal()}catch(x){}}
function devStart(){clearInterval(devTm);devTouch();devTm=setInterval(()=>{if(document.visibilityState=='visible')devTouch()},60000)}
function devStop(){clearInterval(devTm)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='visible'&&API)devTouch()});
const setUser0=setUser;setUser=function(u){setUser0.apply(this,arguments);$('#dvb').style.display=u?'':'none';if(u)devStart();else devStop()};$('#dvb').style.display=API?'':'none';
// ---- giao diện ----
const dvEl=$('#dv');
async function dvLoad(){const L=$('#dvl');
 if(!API||!sb){L.innerHTML='<p class="mu">Cần đăng nhập để xem thiết bị.</p>';return}
 L.innerHTML='<p class="mu">Đang tải…</p>';
 try{await devTouch();const r=await sb.rpc('list_devices');
  if(r.error){L.innerHTML='<p class="mu">Chưa dùng được: hãy chạy phần “8) Thiết bị đã đăng nhập” trong file supabase.sql trên Supabase (SQL Editor), rồi tải lại trang.</p>';return}
  const me=devId(),a=r.data||[];
  $('#dvo').style.display=a.some(d=>d.id!==me)?'':'none';
  L.innerHTML=a.length?a.map(d=>{const cur=d.id===me;return `<div class="ti"><div><b>${esc(d.name||'Thiết bị')}${cur?' <span class="dvc">thiết bị này</span>':''}</b><small><span class="dvd ${d.online?'on':''}"></span>${d.online?'Đang hoạt động':'Hoạt động '+devAgo(d.last_seen)} · đăng nhập từ ${fd(new Date(d.created_at).getTime())}</small></div>${cur?'':`<button class="pill sm" data-d="${esc(d.id)}">Đăng xuất</button>`}</div>`}).join(''):'<p class="mu">Chưa có thiết bị nào.</p>'}
 catch(x){L.innerHTML='<p class="mu">Không kết nối được Supabase.</p>'}}
const dvOpen=()=>{dvEl.classList.add('on');dvLoad();clearInterval(devOpenTm);devOpenTm=setInterval(()=>{if(dvEl.classList.contains('on'))dvLoad();else clearInterval(devOpenTm)},30000)},
 dvClose=()=>{dvEl.classList.remove('on');clearInterval(devOpenTm)};
$('#dvb').onclick=dvOpen;$('#dvx').onclick=dvClose;$('#dvr').onclick=dvLoad;dvEl.addEventListener('pointerdown',e=>{if(e.target==dvEl)dvClose()});
document.addEventListener('keydown',e=>{if(e.key=='Escape'&&dvEl.classList.contains('on')&&lkDlg.hidden){dvClose();e.stopImmediatePropagation()}},true);
async function dvAsk(title,msg,ok){const r=await lkModal({title,msg,fields:[],ok});return !!(r&&r.ok)}
$('#dvl').onclick=async e=>{const b=e.target.closest('button[data-d]');if(!b)return;
 if(!await dvAsk('Đăng xuất thiết bị','Thiết bị này sẽ bị đăng xuất khỏi tài khoản và phải đăng nhập lại. Dữ liệu trên máy chủ không bị mất.','Đăng xuất thiết bị'))return;
 const r=await sb.rpc('revoke_device',{p_id:b.dataset.d});flash(r.error?'Không đăng xuất được thiết bị này.':'Đã đăng xuất thiết bị.');dvLoad()};
$('#dvo').onclick=async()=>{if(!await dvAsk('Đăng xuất mọi thiết bị khác','Tất cả thiết bị khác sẽ bị đăng xuất; chỉ giữ lại thiết bị này.','Đăng xuất tất cả'))return;
 const r=await sb.rpc('revoke_other_devices',{p_keep:devId()});flash(r.error?'Không đăng xuất được.':'Đã đăng xuất '+r.data+' thiết bị khác.');dvLoad()};
// đăng xuất bình thường: bỏ thiết bị này khỏi danh sách
const lo0=$('#lo').onclick;$('#lo').onclick=async function(){try{if(API&&sb&&!devMissing)await sb.rpc('forget_device',{p_id:devId()})}catch(x){}return lo0.apply(this,arguments)};
// thông báo sau khi bị đăng xuất từ xa
try{if(sessionStorage.getItem('arbor.revoked')){sessionStorage.removeItem('arbor.revoked');setTimeout(()=>flash('Thiết bị này đã bị đăng xuất từ một thiết bị khác. Hãy đăng nhập lại.',9000),600)}}catch(e){}
