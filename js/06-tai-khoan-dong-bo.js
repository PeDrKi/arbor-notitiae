// Tài khoản và đồng bộ Supabase: đăng nhập, lưu nháp, đẩy/gộp dữ liệu, ảnh
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
function setSync(t){const e=$('#sy2');e.textContent=t;e.style.display=API?'':'none'}
function setUser(u){API=u;$('#usr').style.display=$('#lo').style.display=u?'':'none';if(u)$('#usr').textContent=u.email;setSync('')}
function showAuth(){$('#au').classList.add('on');$('#aue').focus()}
function load(d){focusDrop();d=sanitizeState(withView(d));N=d.N;LK=d.LK||[];DW=d.DW||[];T=d.T||[];L=d.lv||3;sel=d.sel in N?d.sel:root();V=d.V||V;uid=d.uid||uid;$('#lv').value=String(L);shown=null;hits=null;ms.clear();msOn=false;render();xf();if(!d.V)fit(1)}
async function enter(u){const loc=!API&&(TL.length>1||Object.keys(N).length!=8||Object.values(N).some(n=>n.md-n.cr>1000));   // trên máy đang có cây đã được sửa
 setUser({id:u.id,email:u.email});lock=true;$('#au').classList.remove('on');   // khoá lưu cho tới khi nạp xong cây của tài khoản
 const fail=m=>{setUser(null);lock=false;flash(m+'. Tạm thời trang chỉ lưu trên máy này; hãy tải lại trang để thử lại.',8000)};
 const lr=await sb.from('trees').select('id,name,share_token').eq('user_id',u.id).order('created_at');
 if(lr.error){fail('Không đọc được danh sách cây: '+lr.error.message);return}
 const tl=lr.data;
 if(!tl.length){const id=crypto.randomUUID();await liftImgs();mkSnap();const ins=await sb.from('trees').insert({id,user_id:u.id,name:'Cây của tôi',data:srvState(),version:1});
  if(ins.error){fail('Không tạo được cây: '+emsg(ins.error));return}TL=[{id,name:'Cây của tôi'}];TID=id;ver=1;flash('Đã chuyển cây trên máy này vào tài khoản của bạn')}
 else{let cur=null;try{cur=localStorage.getItem('kt_cur_'+u.id)}catch(x){}const tid=tl.some(t=>t.id==cur)?cur:tl[0].id;
  const r=await sb.from('trees').select('data,version').eq('id',tid).single();if(r.error){fail('Không đọc được cây: '+r.error.message);return}TL=tl;TID=tid;load(r.data.data);ver=r.data.version;mkSnap();tryDraft();
  if(loc){const k='kt_lnote_'+u.id;let s='1';try{s=localStorage.getItem(k);localStorage.setItem(k,'1')}catch(x){}
   if(!s)flash('Cây đang lưu trên máy này không được đưa vào tài khoản vì tài khoản đã có cây. Nó vẫn nằm trên máy: đăng xuất để xem lại, bấm Sao lưu, rồi đăng nhập và Khôi phục vào một cây mới.',12000)}}
 lock=false;updTmb();setSync('Đã đồng bộ');if(unsaved())push()}
let pt2;function push(){clearTimeout(pt2);if(API&&!lock){setSync('Đang lưu…');pt2=setTimeout(doPush,900)}}
let SNAP={n:{},t:{}},pc=0,noRpc=false,pushP=null;
const TOPK=['uid','T','lv','rad','LK','DW'];
function cutState(){const n={},st=snapState(),t={};for(const i in st.N)n[i]=JSON.stringify(st.N[i]);TOPK.forEach(k=>{t[k]=JSON.stringify(st[k])});return{n,t,st}}
function mkSnap(){const c=cutState();SNAP={n:c.n,t:c.t};pc=0}
let pushOk=true,failN=0;
function diffState(c){const set={},add={},upd={},del=[],top={},J=JSON.stringify;let chg=0;   // add = note mới (gửi cả note), upd = chỉ các trường đã đổi của note cũ; set = cả hai, dùng cho patch_tree bản cũ
 for(const i in c.n)if(SNAP.n[i]!==c.n[i]){const n=set[i]=JSON.parse(c.n[i]);chg++;
  if(!(i in SNAP.n))add[i]=n;else{const o=JSON.parse(SNAP.n[i]),s={},d=[];for(const k in n)if(J(n[k])!==J(o[k]))s[k]=n[k];for(const k in o)if(!(k in n))d.push(k);upd[i]={s,d}}}
 for(const i in SNAP.n)if(!(i in c.n)){del.push(i);chg++}
 TOPK.forEach(k=>{if(SNAP.t[k]!==c.t[k]){top[k]=JSON.parse(c.t[k]);chg++}});return{set,add,upd,del,top,chg}}
function snapOf(s){const n={},t={},st={uid:s.uid,T:s.T,lv:s.lv,rad:s.rad?1:undefined,LK:s.LK,DW:s.DW};for(const i in s.N)n[i]=JSON.stringify(s.N[i]);TOPK.forEach(k=>{t[k]=JSON.stringify(st[k])});return{n,t}}
// Đưa kết quả gộp vào cây đang mở; mốc so sánh (SNAP) là bản trên máy chủ, nên lần lưu kế tiếp chỉ gửi phần mình đã sửa
function applyMerge(m,srv,v){const on=ov.classList.contains('on'),b=on&&SNAP.n[sel]?JSON.parse(SNAP.n[sel]):null,th=srv.N[sel];
 const rst=b&&th&&N[sel]&&(N[sel].d||'')===(b.d||'')&&(th.d||'')!==(b.d||'');   // trang đang mở: mình chưa sửa nội dung mà bên kia đã sửa
 N=m.N;LK=m.LK;DW=m.DW;T=m.T;uid=m.uid;L=m.lv||L;$('#lv').value=String(L);ver=v;SNAP=snapOf(srv);pc=0;
 if(!N[sel]){sel=null;if(on)wPrune()}else if(on){if(pT.value!==N[sel].t)pT.value=N[sel].t;if(rst){pg.innerHTML=clean(N[sel].d||'');refreshImgs()}}
 if(on&&N[sel])inkDraw(PGX);if(lkFrom&&!N[lkFrom]){lkFrom=null;lkBar()}ms.forEach(i=>{if(!N[i])ms.delete(i)});render();flash('Đã gộp thay đổi từ thiết bị khác vào cây này.')}
let mergeN=0,noRpc2=false;
function unsaved(){if(!API||RO||lock||!TID)return false;try{return diffState(cutState()).chg>0}catch(x){return false}}
// Bản nháp: phần thay đổi chưa lên được máy chủ, lưu tạm trong localStorage để lần mở sau gộp lại (mất mạng lâu, tắt trình duyệt)
let drf=false;function draftKey(id){return'kt_draft_'+(id||TID)}
function saveDraft(){if(!API||RO||lock||!TID)return;try{const df=diffState(cutState());if(!df.chg){dropDraft();return}const bn={},bt={};
  Object.keys(df.upd).concat(df.del).forEach(i=>bn[i]=SNAP.n[i]);Object.keys(df.top).forEach(k=>bt[k]=SNAP.t[k]);      // kèm bản gốc của những chỗ đã đổi, để lần sau biết bên kia có sửa trùng không
  localStorage.setItem(draftKey(),JSON.stringify({ver,add:df.add,upd:df.upd,del:df.del,top:df.top,bn,bt}));drf=true}catch(x){}}
function dropDraft(){if(!drf)return;drf=false;try{localStorage.removeItem(draftKey())}catch(x){}}
// Gọi ngay sau khi nạp cây từ máy chủ: nếu có bản nháp thì gộp vào; không gộp được thì tải bản nháp về thành file
function tryDraft(){let dr=null;try{dr=JSON.parse(localStorage.getItem(draftKey()))}catch(x){}if(!dr||typeof dr!='object')return;drf=true;
 const C=x=>JSON.parse(JSON.stringify(x)),srv={N:C(N),LK:C(LK),DW:C(DW),T:C(T),uid,lv:L,rad:1},keep=SNAP;let m=null,mine=null;
 try{const B=C(srv.N),top=dr.top||{},bt=dr.bt||{},bv=k=>typeof bt[k]=='string'?JSON.parse(bt[k]):srv[k];
  for(const i in dr.bn||{})if(typeof dr.bn[i]=='string')B[i]=JSON.parse(dr.bn[i]);
  const Mi=C(B);Object.assign(Mi,dr.add||{});for(const i in dr.upd||{})if(Mi[i]){Object.assign(Mi[i],dr.upd[i].s);(dr.upd[i].d||[]).forEach(f=>delete Mi[i][f])}(dr.del||[]).forEach(i=>delete Mi[i]);
  mine=sanitizeState({N:Mi,LK:'LK' in top?top.LK:srv.LK,DW:'DW' in top?top.DW:srv.DW,T:'T' in top?top.T:srv.T,uid:top.uid||srv.uid,lv:top.lv||srv.lv,rad:1});
  SNAP={n:{},t:{LK:JSON.stringify(bv('LK')),DW:JSON.stringify(bv('DW')),T:JSON.stringify(bv('T')),lv:JSON.stringify(bv('lv'))}};for(const i in B)SNAP.n[i]=JSON.stringify(B[i]);
  N=mine.N;LK=mine.LK;DW=mine.DW;T=mine.T;uid=mine.uid;L=mine.lv||L;m=merge3(srv)}catch(x){m=null}
 SNAP=keep;
 if(m){N=m.N;LK=m.LK;DW=m.DW;T=m.T;uid=m.uid;L=m.lv||L;$('#lv').value=String(L);if(!N[sel])sel=root();render();
  if(diffState(cutState()).chg){flash('Đã khôi phục các thay đổi chưa kịp lưu từ lần trước.',6000);push()}else dropDraft()}      // không còn gì khác máy chủ: lần trước thật ra đã lưu xong
 else{N=srv.N;LK=srv.LK;DW=srv.DW;T=srv.T;uid=srv.uid;L=srv.lv;dropDraft();
  if(mine){sv('arbor-notitiae-chua-luu.json',JSON.stringify({v:1,N:mine.N,V,sel,uid:mine.uid,T:mine.T,lv:mine.lv||L,LK:mine.LK,DW:mine.DW,KB}));flash('Lần trước còn thay đổi chưa lưu, nhưng cây đã bị sửa trùng chỗ ở nơi khác nên không gộp được. Bản chưa lưu vừa được tải về thành file .json.',10000)}}}
// Đổi vài lỗi của máy chủ sang lời dễ hiểu
const emsg=e=>{const m=e&&e.message||'lỗi không rõ';return/trees_data_size/.test(m)?'cây vượt quá giới hạn 10 MB (hãy bớt nội dung hoặc ảnh nhúng)':/too_many_trees/.test(m)?'tài khoản đã đạt giới hạn 100 cây':m};
function pushFail(m){pushOk=false;failN++;saveDraft();setSync(m);clearTimeout(pt2);pt2=setTimeout(doPush,Math.min(60000,5000*2**(failN-1)))}   // tự thử lại, giãn dần tới 60 giây
async function doPush(){if(!API||lock||!TID)return;await lkFlush();if(busy){again=true;return}busy=true;let done;pushP=new Promise(r=>done=r);const tid=TID;
 try{const c=cutState(),{set,add,upd,del,top,chg}=diffState(c);
  if(!chg){pushOk=true;failN=0;mergeN=0;dropDraft();setSync('Đã lưu lên Supabase')}
  else{let nv=null,conflict=false,gone=false,err=null,merged=false,wait=false,full=noRpc||pc>=40;
   if(!full){let r=null;
    if(!noRpc2){r=await sb.rpc('patch_tree2',{p_id:tid,p_base:ver,p_patch:{set:add,upd,del,top}});
     if(r.error&&!/conflict|not_found|fetch|network/i.test(r.error.message)){noRpc2=true;r=null}}      // chưa cài patch_tree2 (hoặc nó báo lỗi lạ): quay về patch_tree, gửi cả note
    if(!r&&tid===TID)r=await sb.rpc('patch_tree',{p_id:tid,p_base:ver,p_patch:{set,del,top}});
    if(!r){}else if(!r.error)nv=r.data;else if(/conflict/.test(r.error.message))conflict=true;else if(/not_found/.test(r.error.message))conflict=gone=true;
    else if(/patch_tree|PGRST202|does not exist|schema cache/i.test(r.error.message+(r.error.code||''))){noRpc=true;full=true}else err=r.error}
   if(tid===TID&&full&&nv===null&&!conflict&&!err){      // gửi cả cây: chưa cài hàm patch_tree, hoặc định kỳ để đồng bộ lại cho chắc
    const r=await sb.from('trees').update({data:srvState(),version:ver+1,updated_at:new Date().toISOString()}).eq('id',tid).eq('version',ver).select('version');
    if(r.error)err=r.error;else if(r.data&&r.data.length)nv=r.data[0].version;else conflict=true}
   if(conflict&&!gone&&tid===TID&&mergeN<3){      // máy chủ có bản mới hơn: tải về và thử gộp với phần mình đã sửa
    if(drag)wait=true;
    else{const r=await sb.from('trees').select('data,version').eq('id',tid).single();
     if(tid===TID&&!r.error){let srv=null,m=null;try{srv=sanitizeState(r.data.data);m=merge3(srv)}catch(x){}if(m){applyMerge(m,srv,r.data.version);merged=true}}}}
   if(tid!==TID){}      // đã chuyển sang cây khác trong lúc lưu: bỏ qua kết quả này
   else if(merged){mergeN++;again=true;setSync('Đang lưu…')}
   else if(wait){clearTimeout(pt2);pt2=setTimeout(doPush,1500)}      // đang kéo note: gộp sau
   else if(nv!==null){ver=nv;pc=full?0:pc+1;SNAP={n:c.n,t:c.t};pushOk=true;failN=0;mergeN=0;if(unsaved())saveDraft();else dropDraft();setSync('Đã lưu lên Supabase')}
   else if(conflict){dropDraft();lock=true;pushOk=true;setSync(gone?'Cây đã bị xoá':'Xung đột');sv('arbor-notitiae-ban-cua-ban.json',JSON.stringify({v:1,N,V,sel,uid,T,lv:L,LK,DW,KB}));flash((gone?'Cây này đã bị xoá ở nơi khác (hoặc phiên đăng nhập đã hết).':'Cây đã được sửa ở nơi khác.')+' Bản của bạn vừa được tải về thành file .json. Hãy tải lại trang để lấy bản mới nhất.',8000)}
   else{if(!failN)flash('Không lưu được: '+emsg(err)+'. Trang sẽ tự thử lại.',6000);pushFail('Lỗi khi lưu')}}}
 catch(x){if(tid===TID)pushFail('Mất kết nối')}
 busy=false;done();if(again){again=false;doPush()}}
addEventListener('online',()=>push());
const VN={'Invalid login credentials':'Email hoặc mật khẩu không đúng','User already registered':'Email này đã được đăng ký','Email not confirmed':'Email chưa được xác nhận. Hãy mở email để xác nhận.'};
const tr=m=>VN[m]||(/at least 6/.test(m)?'Mật khẩu quá ngắn':m);
async function boot(){const c=window.KT||{};if(!c.url||/YOUR/.test(c.url+c.key))return;   // chưa cấu hình: chỉ lưu trên máy
 if(typeof supabase=='undefined'){const e=$('#sy2');e.textContent='Chưa kết nối — chỉ lưu trên máy này';e.style.display='';e.style.color='#b3402f';      // đã cấu hình nhưng không nạp được thư viện: báo rõ, đừng im lặng
  flash('Không nạp được thư viện Supabase (mất mạng hoặc CDN bị chặn). Trang đang chỉ lưu trên máy này và KHÔNG đồng bộ với tài khoản. Hãy tải lại trang khi có mạng.',15000);return}
 sb=supabase.createClient(c.url,c.key);
 const sh=new URLSearchParams(location.search).get('share');
 if(sh){const r=await sb.rpc('get_shared_tree',{tok:sh});if(r.error||!r.data||!r.data.length){flash('Liên kết chia sẻ không hợp lệ hoặc đã bị tắt');return}
  RO=true;document.body.classList.add('ro');$('#rob').style.display='';TL=[{id:'shared',name:r.data[0].name}];TID='shared';load(r.data[0].data);updTmb();fit(1);flash('Đang xem bản chia sẻ — chỉ xem, không sửa được');return}
 sb.auth.onAuthStateChange((ev)=>{if(ev=='PASSWORD_RECOVERY'){showAuth();amodeSet('new')}
  else if(ev=='SIGNED_OUT'&&API&&!lock){lock=true;setSync('Đã đăng xuất');flash('Phiên đăng nhập đã kết thúc (có thể do đăng xuất ở tab khác). Hãy tải lại trang để đăng nhập lại.',8000)}});
 if(location.hash.includes('type=recovery'))return;
 const r=await sb.auth.getSession();if(/access_token|[?&]code=/.test(location.hash+location.search))history.replaceState(null,'',location.pathname);if(r.data.session)enter(r.data.session.user);else showAuth()}
let amode='in';
function amodeSet(m){amode=m;const T2={in:['Đăng nhập','Đăng nhập','Chưa có tài khoản? Đăng ký'],up:['Tạo tài khoản','Đăng ký','Đã có tài khoản? Đăng nhập'],reset:['Quên mật khẩu','Gửi email đặt lại','Quay lại đăng nhập'],new:['Đặt mật khẩu mới','Lưu mật khẩu mới','']}[m];
 $('#aut').textContent=T2[0];$('#aug').textContent=T2[1];$('#aus').textContent=T2[2];$('#aus').style.display=m=='new'?'none':'';$('#auf').style.display=m=='in'?'':'none';
 $('#aue').style.display=m=='new'?'none':'';$('#aup').style.display=m=='reset'?'none':'';$('#aup').autocomplete=m=='in'?'current-password':'new-password';$('#agg').style.display=(m=='in'||m=='up')?'':'none';$('#aur').textContent=''}
$('#aus').onclick=()=>amodeSet(amode=='in'?'up':'in');
$('#auf').onclick=()=>amodeSet('reset');
$('#aul').onclick=()=>$('#au').classList.remove('on');
$('#aug').onclick=async()=>{const email=$('#aue').value.trim(),pw=$('#aup').value,out=$('#aur');out.textContent='';
 try{
  if(amode=='reset'){const r=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});out.textContent=r.error?tr(r.error.message):'Đã gửi email đặt lại mật khẩu. Hãy kiểm tra hộp thư.';return}
  if(amode=='new'){const r=await sb.auth.updateUser({password:pw});if(r.error){out.textContent=tr(r.error.message);return}const s=await sb.auth.getSession();history.replaceState(null,'',location.pathname);if(s.data.session)enter(s.data.session.user);return}
  if(amode=='up'){const r=await sb.auth.signUp({email,password:pw});if(r.error){out.textContent=tr(r.error.message);return}
   if(!r.data.session){out.textContent='Đã tạo tài khoản. Hãy mở email để xác nhận, rồi quay lại đăng nhập.';return}enter(r.data.user);return}
  const r=await sb.auth.signInWithPassword({email,password:pw});if(r.error){out.textContent=tr(r.error.message);return}enter(r.data.user)
 }catch(x){out.textContent='Không kết nối được Supabase'}};
['aue','aup'].forEach(i=>$('#'+i).onkeydown=e=>{if(e.key=='Enter')$('#aug').click()});
$('#agg').onclick=async()=>{try{const r=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});if(r.error)$('#aur').textContent=tr(r.error.message)}catch(x){$('#aur').textContent='Không kết nối được Supabase'}};
$('#lo').onclick=async()=>{if(!await flushTree()){flash('Chưa lưu được thay đổi nên chưa đăng xuất. Hãy kiểm tra mạng rồi thử lại.',6000);return}lock=true;try{await sb.auth.signOut()}catch(x){}location.reload()};
