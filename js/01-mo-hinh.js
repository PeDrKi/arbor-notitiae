// Dữ liệu: trạng thái, bố cục cây, vẽ node, bảng note, làm sạch & gộp dữ liệu (sanitizeState, merge3)
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
const W=64,GX=210,GY=120,PAL=['#1f8a7a','#5b5fc7','#b9831a','#b8436b','#2f7fc1','#7a9a2e'];const PAL2=PAL.concat(['#d9534f','#e08e0b','#8e44ad','#16a085','#34495e','#8a9aa0']);
const $=s=>document.querySelector(s),cv=$('#cv'),wd=$('#w'),nd=$('#nd'),es=$('#e'),pn=$('#pn');
let FOC=null,FSNAP=null,FOCS=null,FOCD=null,FV=null,FDEF=2;   // chế độ Tập trung (khai báo sớm vì layout / snapState dùng tới khi khởi động)
let KEYS={},KRAW={},LKC={};const LK_IT=250000,LK_CAP=8e6,LKB=/^[A-Za-z0-9+\/=_-]*$/;let API=null,ver=0,lock=false,busy=false,again=false,qw=false,RO=false,TID='main',TL=[],LK=[],DW=[],drRef=null,drN=-1,dmode=false,dw=null,fitLater=false,lkFrom=null,lmode=false,lex=new Set(),fy=0,zl=0,zt=null,anim=0,pend=null,shown=null,L=3,ms=new Set(),msOn=false,T=[],dlA=null,N={},sel=null,V={x:80,y:window.innerHeight/2,k:1},uid=1,hits=null;
const mk=(t,b,p,col)=>{const id='n'+uid+++'_'+Math.random().toString(36).slice(2,6);   // đuôi ngẫu nhiên để hai thiết bị không tạo trùng id
N[id]={id,t,b,p,c:[],x:0,y:0,col,fold:0,cr:Date.now(),md:Date.now()};if(p)N[p].c.push(id);return id};
function seed(){N={};uid=1;const r=mk('Bộ não thứ hai','Gốc của mọi tri thức. Bấm + để thêm nhánh.',null,null);
const a=mk('Học tập','Những gì đang học.',r,0),b=mk('Công việc','Dự án, quy trình, bài học rút ra.',r,1),c=mk('Ý tưởng','Những ý nảy ra giữa chừng.',r,2);
mk('Ngoại ngữ','Từ vựng, ngữ pháp, mẹo nhớ.',a);mk('Lập trình','Khái niệm và đoạn code đáng nhớ.',a);mk('Họp tuần','Ghi chú cuộc họp.',b);mk('Ứng dụng nhỏ','Ý tưởng làm thử vào cuối tuần.',c);sel=r;layout()}
function col(id){if(N[id].cc)return N[id].cc;let n=N[id];while(n.p&&N[n.p].p)n=N[n.p];return n.p?PAL[(n.col||0)%PAL.length]:'var(--ink)'}
function layout(){focusExit(true);const r=root();
 const sub=(r0,cx,cy)=>{const Wt={},A={},D={},kids=id=>id==r?N[id].c.filter(c=>!N[c].free):N[id].c;
  const wt=id=>Wt[id]=(!kids(id).length||hid(id))?1:kids(id).reduce((a,c)=>a+wt(c),0);wt(r0);
  (function go(id,a0,a1,d){D[id]=d;A[id]=(a0+a1)/2;if(!kids(id).length||hid(id))return;let a=a0;kids(id).forEach(c=>{const sp=(a1-a0)*Wt[c]/Wt[id];go(c,a,a+sp,d+1);a+=sp})})(r0,-Math.PI/2,1.5*Math.PI,0);
  const by={},R={0:0},mx=Math.max(...Object.values(D));Object.keys(D).forEach(i=>{(by[D[i]]=by[D[i]]||[]).push(i)});
  for(let d=1;d<=mx;d++){const as=by[d].map(i=>A[i]).sort((u,v)=>u-v);let g=2*Math.PI;if(as.length>1){g=Infinity;as.forEach((u,i)=>{const nx=i+1<as.length?as[i+1]:as[0]+2*Math.PI;g=Math.min(g,nx-u)})}R[d]=Math.min(8000,Math.max(R[d-1]+215,125/Math.max(g,.001)))}
  Object.keys(D).forEach(i=>{const n=N[i],z=sz(n),rr=R[D[i]];n.x=cx+Math.cos(A[i])*rr-z/2;n.y=cy+Math.sin(A[i])*rr-z/2})};
 const fr=N[r].c.filter(c=>N[c].free);sub(r,0,0);fr.forEach(f=>sub(f,N[f].x+sz(N[f])/2,N[f].y+sz(N[f])/2));
 const mark=(id,anc,top)=>{N[id].c.forEach(c=>{const m=N[c];if(top&&m.free)return;if(anc){m.x=anc.x;m.y=anc.y;m.hid=1}else delete m.hid;mark(c,anc||(hid(c)?m:null))})};
 mark(r,hid(r)?N[r]:null,true);fr.forEach(f=>mark(f,hid(f)?N[f]:null));spread()}
const ctr=n=>{const z=sz(n);return[n.x+z/2,n.y+z/2]};
const unit=(p,q)=>{const dx=p[0]-q[0],dy=p[1]-q[1],l=Math.hypot(dx,dy);return l<1e-6?[1,0]:[dx/l,dy/l]};
function outPos(P,k){const R0=ctr(N[root()]),[px,py]=ctr(P);let a;
 if(!P.p){const as=P.c.filter(c=>!N[c].free).map(c=>{const[x,y]=ctr(N[c]);return Math.atan2(y-py,x-px)}).sort((u,v)=>u-v);
  if(!as.length)a=-Math.PI/2;else{let bg=-1,bm=0;as.forEach((u,i)=>{const nx=i+1<as.length?as[i+1]:as[0]+2*Math.PI,g=nx-u;if(g>bg){bg=g;bm=u+g/2}});a=bm}}
 else{a=Math.atan2(py-R0[1],px-R0[0])+Math.ceil(k/2)*.6*(k%2?1:-1)}
 return{x:px+Math.cos(a)*GX-32,y:py+Math.sin(a)*GX-32}}
function outv(i){const u=unit(ctr(N[i]),ctr(N[root()]));return[u[0]*GX,u[1]*GX]}
function placeSub(id){const P=N[id];P.c.forEach((c,k)=>{if(N[c].hid){const q=outPos(P,k);N[c].x=q.x;N[c].y=q.y;delete N[c].hid}if(!hid(c))placeSub(c)})}
let _r=null;const root=()=>(_r&&N[_r]&&!N[_r].p)?_r:(_r=Object.keys(N).find(i=>!N[i].p));
function vis(){const o=[];(function go(id){o.push(id);if(!hid(id))N[id].c.forEach(go)})(root());return o}
function desc(id){return [id].concat(...N[id].c.map(desc))}
const esc=s=>s.replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function render(){
  const v=vis(),nwS=new Set(shown?v.filter(i=>!shown.has(i)):[]),mpS=new Set(LK.filter(l=>l.k=='p'&&N[l.a]).map(l=>l.b));shown=new Set(v);
  nd.innerHTML=v.map(id=>{const n=N[id],s=id==sel,q=hits;
    return `<div class="n${nwS.has(id)?' nw':''}${n.p?'':' root'}${n.g?' grp':''}${n.sh=='s'?' shs':''}${mpS.has(id)?' mp':''}${ms.has(id)?' ms':''}${s?' sel':''}${q&&q.has(id)?' hit':''}${q&&!q.has(id)?' dim':''}" data-id="${esc(id)}" tabindex="0" style="transform:translate(${n.x}px,${n.y}px);width:${sz(n)}px;height:${sz(n)}px;--c:${col(id)}"><span class="lb">${n.lk?'🔒 ':''}${esc(n.t||'Chưa đặt tên')}</span>${n.d?'<u class="dc"></u>':''}${n.c.length?`<i class="fold" data-a="f" title="Thu gọn / mở rộng">${hid(id)?'+'+(desc(id).length-1):'–'}</i>`:''}${s?'<button class="add" data-a="a" title="Thêm nhánh con" aria-label="Thêm nhánh con">+</button>':''}</div>`}).join('');
  const el={};nd.querySelectorAll('.n').forEach(e=>el[e.dataset.id]=e);
  es.innerHTML=v.filter(id=>N[id].p&&el[N[id].p]&&!N[id].free).map(id=>`<path${nwS.has(id)?' class="nw"':''} data-id="${esc(id)}" d="${ed(id)}" stroke="${col(id)}" opacity=".75"/>`).join('')+lkHtml(v);
  const f=Object.keys(N).length;
  if(drRef!==DW||drN!==DW.length)drawRender();panel();trashLbl();save();if(lmode)listRender();
}
function xf(){pplace();wd.style.transform=`translate(${V.x}px,${V.y}px) scale(${V.k})`;cv.style.backgroundSize=24*V.k+'px '+24*V.k+'px';cv.style.backgroundPosition=V.x+'px '+V.y+'px'}
function panel(){if(!sel||!N[sel]){pn.classList.remove('on');return}pn.classList.add('on');const n=N[sel];
  if(document.activeElement!==$('#pt'))$('#pt').value=n.t;if(document.activeElement!==$('#pb'))$('#pb').value=n.b;
  $('#dl').style.display=n.p?'':'none';$('#dl span').textContent=dlA==sel?'Bấm lại để xoá':'Xoá nhánh';$('#fl').style.display=n.c.length?'':'none';$('#ug').style.display=n.g?'':'none';$('#pt').readOnly=RO;$('#pb').readOnly=RO;$('#szs').value=n.sz?String(n.sz):'';$('#dtc').style.display=(n.p&&!n.free)?'':'none';$('#mvb').style.display=$('#mab').style.display=n.p?'':'none';$('#shp').value=n.sh||'c';
  const ml=LK.filter(l=>(l.a==sel||l.b==sel)&&N[l.a]&&N[l.b]);
  const mp=ml.filter(l=>l.k=='p'),mx=ml.filter(l=>l.k!='p');
  $('#lks').innerHTML=(mp.length?'<b style="font-size:12px;color:var(--mute)">Thuộc nhiều nhánh</b>'+mp.map(l=>{const up=l.b==sel,o=up?l.a:l.b;return `<div class="lki"><span style="font-size:12px;color:var(--mute);flex:none">${up?'Cũng thuộc':'Chứa'}</span><button class="pill sm" data-go="${esc(o)}" title="Đi tới note này" style="flex:1;min-width:0;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(N[o].t||'Chưa đặt tên')}</button><button data-ul="${esc(l.id)}" aria-label="Bỏ khỏi nhánh này" title="Bỏ khỏi nhánh này">×</button></div>`}).join(''):'')+(mx.length?'<b style="font-size:12px;color:var(--mute)">Liên kết ngang</b>'+mx.map(l=>{const o=l.a==sel?l.b:l.a;return `<div class="lki"><button class="pill sm" data-go="${esc(o)}" title="Đi tới note này">${esc(N[o].t||'Chưa đặt tên')}</button><input data-lt="${esc(l.id)}" value="${esc(l.t||'')}" placeholder="Nhãn (tuỳ chọn)" aria-label="Nhãn liên kết"><button data-ul="${esc(l.id)}" aria-label="Xoá liên kết" title="Xoá liên kết">×</button></div>`}).join(''):'');$('#fl').textContent=hid(sel)?'Mở nhánh':'Thu gọn';
  const top=!!n.p&&N[n.p].p===null||false;
  const cur=col(sel);
  if(window.pnSync)pnSync();$('#sws').innerHTML=PAL2.map(c=>`<button class="sw${c==cur?' on':''}" data-c="${c}" style="background:${c}" aria-label="Màu ${c}"></button>`).join('')+`<input type="color" id="cc" class="sw cp" title="Chọn màu tuỳ ý" value="${/^#[0-9a-f]{6}$/i.test(cur)?cur:'#1f8a7a'}"><button class="pill sm" data-x="b" title="Áp màu này cho mọi note con">Cả nhánh</button><button class="pill sm" data-x="r" title="Về màu mặc định theo nhánh">Mặc định</button>`;pplace()}
function add(p){const P=N[p];opn(P.id);const pos=outPos(P,P.c.length),id=mk('','',p,P.p?undefined:P.c.length);N[id].x=pos.x;N[id].y=pos.y;sel=id;slide(()=>spread(new Set([id])));const t=$('#pt');t.focus();t.select()}
// Một note có thể thuộc thêm nhiều nhánh: mỗi nhánh thêm là một mục trong LK dạng {a: note cha thêm, b: note, k:'p'}. Nhánh chính vẫn là N[id].p.
const extraPar=id=>LK.filter(l=>l.k=='p'&&l.b==id&&N[l.a]).map(l=>l.a);
const samePar=id=>{LK=LK.filter(l=>!(l.k=='p'&&l.b==id&&l.a==N[id].p))};      // nhánh thêm trùng với nhánh chính thì bỏ mục thừa
// Trước khi xoá nhánh id: note con cháu nào còn thuộc một nhánh khác ở ngoài thì chuyển hẳn sang nhánh đó (cùng các note con) thay vì bị xoá theo
function rescue(id){const dead=new Set(desc(id));let n=0,again=true;
 while(again){again=false;for(const x of [...dead]){if(x==id||!dead.has(x))continue;const l=LK.find(l=>l.k=='p'&&l.b==x&&N[l.a]&&!dead.has(l.a));if(!l)continue;
  const o=N[N[x].p];o.c=o.c.filter(c=>c!=x);N[l.a].c.push(x);N[x].p=l.a;LK=LK.filter(y=>y!==l);desc(x).forEach(i=>dead.delete(i));n++;again=true}}
 return n}
function del(id){if(!N[id]||!N[id].p)return;const kept=rescue(id),p=N[N[id].p],ids=desc(id),nodes={};ids.forEach(i=>nodes[i]=N[i]);const e={tid:'t'+Date.now(),at:Date.now(),id,idx:p.c.indexOf(id),par:p.id,nodes,lk:LK.filter(l=>ids.includes(l.a)||ids.includes(l.b))};LK=LK.filter(l=>!ids.includes(l.a)&&!ids.includes(l.b));ids.forEach(i=>delete N[i]);p.c=p.c.filter(c=>c!=id);const full=trashPush(e);sel=p.id;render();undoBar(e);if(kept||full)flash((kept?kept+' note dùng chung được giữ lại ở nhánh khác của chúng. ':'')+(full?TFULL:''),6000)}
const TFULL='Thùng rác đã đủ 30 mục nên mục cũ nhất vừa bị xoá hẳn.';
const TR=()=>T.filter(e=>!e.ar);
function trashPush(e){T.unshift(e);let full=false;while(TR().length>30){const k=T.map(x=>!x.ar).lastIndexOf(true);T.splice(k,1);full=true}return full}
function fit(now){if(innerWidth<50||innerHeight<50){fitLater=true;return}      // cửa sổ chưa có kích thước (tab mở ngầm, cửa sổ thu nhỏ): chờ tới khi có rồi mới căn
 const v=vis().map(i=>{const q=pend&&pend[i];return q?{x:q[0],y:q[1]}:N[i]});const x0=Math.min(...v.map(n=>n.x)),x1=Math.max(...v.map(n=>n.x+W)),y0=Math.min(...v.map(n=>n.y)),y1=Math.max(...v.map(n=>n.y+80));
  const SB=lmode?Math.min(300,innerWidth*.86):0,w=innerWidth-SB,h=innerHeight,k=Math.max(.15,Math.min(1.2,(w-120)/(x1-x0),(h-200)/(y1-y0)));fly(SB+(w-(x1-x0)*k)/2-x0*k,(h-(y1-y0)*k)/2-y0*k+20,k,now?0:undefined)}
let drag=null;
cv.addEventListener('pointerdown',e=>{snap();if(tpDown(e))return;if(dmode){if(!dw)drawStart(e);return}const t=e.target.closest('[data-a]'),n=e.target.closest('.n');if(lkFrom){if(n&&n.dataset.id!=lkFrom)addLink(lkFrom,n.dataset.id);else if(!n){lkFrom=null;lkBar()}return}
  if(t){const id=t.closest('.n').dataset.id;if(t.dataset.a=='a')add(id);else{toggleFold(id)}return}
  if(n&&(msOn||e.shiftKey||e.ctrlKey||e.metaKey)){const id=n.dataset.id;if(ms.has(id)&&N[id].p){const ids=[...new Set([...ms].filter(i=>N[i]).flatMap(i=>desc(i)))];drag={ms:1,id,sx:e.clientX,sy:e.clientY,ids,o:ids.map(i=>[N[i].x,N[i].y]),m:0}}else msToggle(id);return}if(n){const id=n.dataset.id;drag={id,sx:e.clientX,sy:e.clientY,ids:desc(id),o:desc(id).map(i=>[N[i].x,N[i].y]),m:0};if(sel!=id){sel=id;render()}}
  else if(msOn){drag={rb:1,sx:e.clientX,sy:e.clientY,m:0}}else{drag={pan:1,sx:e.clientX,sy:e.clientY,vx:V.x,vy:V.y,m:0};cv.classList.add('pan')}});
addEventListener('pointermove',e=>{if(tp.has(e.pointerId)){tp.set(e.pointerId,[e.clientX,e.clientY]);if(gz){gzMove();return}}if(dw){if(e.pointerId===dw.pid)drawMove(e);return}if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(Math.abs(dx)+Math.abs(dy)>7)drag.m=1;if(!drag.m)return;
  if(drag.rb){const r=$('#rb');r.style.display='block';Object.assign(r.style,{left:Math.min(e.clientX,drag.sx)+'px',top:Math.min(e.clientY,drag.sy)+'px',width:Math.abs(dx)+'px',height:Math.abs(dy)+'px'})}else if(drag.pan){V.x=drag.vx+dx;V.y=drag.vy+dy;xf()}else{drag.ids.forEach((i,j)=>{N[i].x=drag.o[j][0]+dx/V.k;N[i].y=drag.o[j][1]+dy/V.k});repos()}});
addEventListener('pointercancel',e=>{if(tpUp(e))return;if(dw&&e.pointerId===dw.pid)drawEnd()});
addEventListener('pointerup',e=>{if(tpUp(e))return;if(dw){if(e.pointerId===dw.pid)drawEnd();return}if(drag&&drag.rb)rbEnd(e);if(drag&&drag.ms&&!drag.m){const i=drag.id;drag=null;msToggle(i)}if(drag&&drag.id&&drag.m)slide(()=>reparent(e));if(drag&&drag.pan&&!drag.m){sel=null;render()}else if(drag&&drag.id&&!drag.m){const t=Date.now();if(LC.id==drag.id&&t-LC.t<600){LC={};openDoc(drag.id)}else LC={id:drag.id,t}}drag=null;cv.classList.remove('pan');save()});
let LC={};
cv.addEventListener('wheel',e=>{e.preventDefault();cancelAnimationFrame(fy);cancelAnimationFrame(zl);if(!zt)zt={x:V.x,y:V.y,k:V.k};const f=Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)),k=Math.min(2.5,Math.max(.15,zt.k*f)),r=k/zt.k;zt.x=e.clientX-(e.clientX-zt.x)*r;zt.y=e.clientY-(e.clientY-zt.y)*r;zt.k=k;zl=requestAnimationFrame(zloop)},{passive:false});
// Gõ tiêu đề: chỉ sửa nhãn của note đó trên sơ đồ và trong danh sách, không dựng lại cả cây
function retitle(){const t=N[sel].t||'Chưa đặt tên',a=nd.querySelector('[data-id="'+sel+'"] .lb'),b=lmode?ls.querySelectorAll('.lr[data-id="'+sel+'"] .t'):[];if(a)a.textContent=t;b.forEach(x=>x.textContent=t);save()}
$('#pt').oninput=e=>{N[sel].t=e.target.value;N[sel].md=Date.now();retitle()};
$('#pb').oninput=e=>{N[sel].b=e.target.value;N[sel].md=Date.now();save()};
let cfAct=null;
$('#dl').onclick=()=>{const n=N[sel];if(!n||!n.p)return;const tid=sel;cfAct=()=>{if(N[tid])del(tid)};const k=desc(sel).length-1;$('#cfb b').textContent='Xác nhận xoá nhánh';$('#cfk').textContent='Xoá vĩnh viễn';$('#cfp').textContent='Xoá "'+(n.t||'Chưa đặt tên')+'"'+(k?' cùng '+k+' note con':'')+' và nội dung trang của chúng? Nhánh sẽ vào thùng rác, bạn có thể hoàn tác hoặc khôi phục sau. Hãy gõ DELETE để xác nhận.';$('#cfi').value='';$('#cfk').disabled=true;$('#cfm').classList.add('on');$('#cfi').focus()};
$('#cfi').oninput=e=>{$('#cfk').disabled=e.target.value.trim()!=='DELETE'};
$('#cfn').onclick=()=>{$('#cfm').classList.remove('on');cfAct=null};
$('#cfk').onclick=()=>{if($('#cfi').value.trim()!=='DELETE'||!cfAct)return;const f=cfAct;cfAct=null;$('#cfm').classList.remove('on');f()};
$('#cfi').onkeydown=e=>{if(e.key=='Enter')$('#cfk').click();if(e.key=='Escape')$('#cfn').click()};
$('#cx').onclick=()=>{sel=null;render()};
$('#ad').onclick=()=>add(sel);
$('#fl').onclick=()=>toggleFold(sel);
$('#sws').onclick=e=>{const b=e.target.closest('button');if(!b||!N[sel])return;
 if(b.dataset.c)N[sel].cc=b.dataset.c;
 else if(b.dataset.x=='b'){const c=col(sel);desc(sel).forEach(i=>N[i].cc=c)}
 else if(b.dataset.x=='r')delete N[sel].cc;
 render()};
$('#sws').onchange=e=>{if(e.target.id=='cc'){N[sel].cc=e.target.value;render()}};
$('#sws').oninput=e=>{if(e.target.id=='cc'){const el=nd.querySelector('[data-id="'+sel+'"]');if(el)el.style.setProperty('--c',e.target.value)}};
$('#fit').onclick=()=>fit();$('#lay').onclick=()=>{slide(()=>layout());fit()};
// Tìm kiếm: gồm tiêu đề, mô tả và nội dung trang; không phân biệt hoa/thường và dấu tiếng Việt. Enter nhảy qua từng kết quả.
const fold=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
const sIdx=new Map();   // id -> {d, f}: văn bản thuần của trang, chỉ tính lại khi nội dung trang đổi
function sText(id){const n=N[id],c=sIdx.get(id);if(c&&c.d===n.d&&c.t===n.t&&c.b===n.b)return c.f;const f=fold(n.t+' '+n.b+' '+(n.d?txt(n.d):''));sIdx.set(id,{d:n.d,t:n.t,b:n.b,f});return f}
let hitI=-1;
$('#q').oninput=e=>{const s=fold(e.target.value.trim());hitI=-1;hits=s?new Set(Object.keys(N).filter(i=>sText(i).includes(s))):null;
  if(hits){hits.forEach(i=>{let p=N[i].p;while(p){opn(p);p=N[p].p}});spread()}render()};
$('#q').onkeydown=e=>{if(e.key=='Enter'&&hits&&hits.size){const a=[...hits];hitI=(hitI+(e.shiftKey?-1:1)+a.length)%a.length;const n=N[a[hitI]];V.x=innerWidth/2-(n.x+100)*V.k;V.y=innerHeight/2-n.y*V.k;xf()}};

const OKB=/^(script|iframe|object|embed|link|meta|base|form|frame|frameset|applet|audio|video|source|track|animate|animatetransform|animatemotion|set|noscript|template|portal|button|textarea|select|option|dialog)$/i;
const PUR={ADD_TAGS:['foreignobject'],ADD_ATTR:['contenteditable','target','referrerpolicy'],HTML_INTEGRATION_POINTS:{foreignobject:true}};   // cấu hình DOMPurify; foreignobject cần cho nhãn của sơ đồ Mermaid
const IDR=/^[a-z0-9_-]{1,40}$/i,HEX=/^#[0-9a-f]{6}$/i,own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
// Làm sạch dữ liệu cây nạp từ bên ngoài (máy chủ, liên kết chia sẻ, localStorage, file sao lưu) trước khi dùng
function sanitizeState(d){if(!d||typeof d!='object'||!d.N||typeof d.N!='object')throw new Error('bad state');
 const num=(v,f)=>{v=typeof v=='number'||typeof v=='string'?+v:NaN;return isFinite(v)?v:f},str=v=>typeof v=='string'?v:v==null?'':String(v),idk=k=>typeof k=='string'&&IDR.test(k)&&k!='__proto__';
 const draws=a=>(Array.isArray(a)?a:[]).filter(s=>s&&typeof s=='object'&&idk(s.id)&&typeof s.p=='string'&&/^[\d.,\- ]{3,60000}$/.test(s.p)).slice(0,3000).map(s=>Object.assign({id:s.id,c:HEX.test(s.c)?s.c:'#d9534f',w:Math.min(40,Math.max(1,num(s.w,4))),p:s.p},s.h?{h:1}:{},s.u?{u:1}:{}));      // nét vẽ tay
 const PSZ=['a5','a3','letter','legal'];   // khổ giấy hợp lệ (a4 là mặc định, không lưu)
 const pgLay=v=>{if(!v||typeof v!='object')return null;const o={};if(PSZ.includes(v.sz))o.sz=v.sz;if(v.or=='l')o.or='l';
  if(Array.isArray(v.m)&&v.m.length==4){const m=v.m.map(x=>Math.round(Math.max(20,Math.min(400,num(x,96)))));if(m.some(x=>x!=96))o.m=m}
  if(typeof v.h=='string'&&v.h)o.h=v.h.slice(0,120);if(typeof v.f=='string'&&v.f)o.f=v.f.slice(0,120);if(v.pn===0)o.pn=0;return Object.keys(o).length?o:null};
 const note=(n,k)=>{const o={id:k,t:str(n.t),b:str(n.b),p:idk(n.p)?n.p:null,c:Array.isArray(n.c)?n.c.filter(idk):[],x:num(n.x,0),y:num(n.y,0),col:n.col==null?n.col:num(n.col,0),fold:n.fold?1:0,cr:num(n.cr,Date.now()),md:num(n.md,Date.now())};
  ['open','hid','g','free'].forEach(f=>{if(n[f])o[f]=1});if(n.sh=='s'||n.sh=='c')o.sh=n.sh;if(num(n.sz,0)>0)o.sz=num(n.sz,0);
  if(typeof n.cc=='string'&&(HEX.test(n.cc)||n.cc=='var(--ink)'))o.cc=n.cc;if(n.d)o.d=clean(str(n.d));const ik=draws(n.dw);if(ik.length)o.dw=ik;const pl=pgLay(n.pl);if(pl)o.pl=pl;if(n.lk){const L=lkSan(n.lk);if(L){o.lk=L;delete o.d;delete o.dw;o.b=''}}return o};
 const notes=m=>{const o={};for(const k in m)if(idk(k)&&m[k]&&typeof m[k]=='object')o[k]=note(m[k],k);return o};
 const links=a=>(Array.isArray(a)?a:[]).filter(l=>l&&typeof l=='object'&&idk(l.id)&&idk(l.a)&&idk(l.b)).map(l=>Object.assign({id:l.id,a:l.a,b:l.b,t:str(l.t)},l.k=='p'?{k:'p'}:{}));   // k:'p' = note b còn thuộc thêm nhánh của note a
 const A=notes(d.N),r=Object.keys(A).find(k=>!A[k].p),NN={};if(!r)throw new Error('bad state');
 (function go(k,p){const n=A[k],cs=n.c;n.p=p;n.c=[];NN[k]=n;cs.forEach(c=>{if(own(A,c)&&!own(NN,c)){n.c.push(c);go(c,k)}})})(r,null);   // chỉ giữ các note nối được về gốc, quan hệ cha–con khớp nhau
 const T=(Array.isArray(d.T)?d.T:[]).filter(e=>e&&typeof e=='object'&&idk(e.tid)&&idk(e.id)&&e.nodes&&typeof e.nodes=='object').map(e=>{const nodes=notes(e.nodes);for(const k in nodes)nodes[k].c=nodes[k].c.filter(c=>own(nodes,c));return{tid:e.tid,at:num(e.at,Date.now()),id:e.id,idx:Math.max(0,num(e.idx,0)),par:idk(e.par)?e.par:'',nodes,lk:links(e.lk),...(e.ar?{ar:1}:{})}}).filter(e=>own(e.nodes,e.id));
 const v=d.V,u=num(d.uid,0);
 return{N:NN,LK:links(d.LK),DW:draws(d.DW),T,V:v&&typeof v=='object'?{x:num(v.x,0),y:num(v.y,0),k:Math.min(2.5,Math.max(.15,num(v.k,1)))}:undefined,sel:typeof d.sel=='string'&&own(NN,d.sel)?d.sel:null,uid:u>0?u:1+Math.max(0,...Object.keys(NN).map(k=>+k.slice(1)||0)),lv:num(d.lv,0)||undefined,rad:d.rad?1:undefined,KB:d.KB}}
// Gộp ba bên khi máy chủ có bản mới hơn: gốc = lần đồng bộ gần nhất (SNAP), mình = cây đang mở, họ = bản trên máy chủ (đã làm sạch).
// Trả về null nếu hai bên sửa cùng một chỗ theo cách khác nhau; khi đó trang giữ cách cũ: khoá lại và tải bản của mình về.
function merge3(srv,Nm=typeof lkNv=='function'?lkNv():N){if(typeof focusExit=='function')focusExit(true);const J=JSON.stringify,eq=(a,b)=>J(a)===J(b)||(!a&&!b),M={},soft=['x','y','md','open','fold','hid'],base={};
 for(const i in SNAP.n)base[i]=JSON.parse(SNAP.n[i]);
 const dif=(a,b)=>[...new Set(Object.keys(a).concat(Object.keys(b)))].filter(k=>!eq(a[k],b[k])),hard=(a,b)=>dif(a,b).some(k=>!soft.includes(k));
 const by=(a,k)=>{const o={};a.forEach(x=>o[x[k]]=x);return o};      // liên kết ngang và thùng rác: gộp theo id
 const m3=(bs,mine,th,k)=>{const B=by(bs,k),Mi=by(mine,k),Th=by(th,k);return mine.filter(x=>!own(B,x[k])&&!own(Th,x[k])).concat(th.filter(x=>!own(B,x[k])||own(Mi,x[k])).map(x=>own(Mi,x[k])&&own(B,x[k])&&!eq(Mi[x[k]],B[x[k]])?Mi[x[k]]:x))};
 for(const i of new Set(Object.keys(base).concat(Object.keys(Nm),Object.keys(srv.N)))){const b=own(base,i)&&base[i],m=own(Nm,i)&&Nm[i],s=own(srv.N,i)&&srv.N[i];
  if(!b){if(m&&s)return null;M[i]=Object.assign({},m||s);continue}      // note mới ở một bên
  if(!m&&!s)continue;
  if(!m){if(hard(s,b))return null;continue}      // mình xoá, họ sửa
  if(!s){if(hard(m,b))return null;continue}      // họ xoá, mình sửa
  const o=Object.assign({},s),ks=dif(s,b);
  for(const k of dif(m,b)){
   if(k=='c'&&ks.includes('c')){const rm=b.c.filter(x=>!m.c.includes(x)),ad=m.c.filter(x=>!b.c.includes(x));o.c=s.c.filter(x=>!rm.includes(x)).concat(ad.filter(x=>!s.c.includes(x)));continue}
   if(k=='dw'&&ks.includes('dw')){o.dw=m3(b.dw||[],m.dw||[],s.dw||[],'id');if(!o.dw.length)delete o.dw;continue}      // cả hai cùng vẽ lên một trang: gộp nét
   if(k=='md'){o.md=Math.max(m.md||0,s.md||0);continue}
   if(ks.includes(k)&&!eq(m[k],s[k])&&!soft.includes(k))return null;      // cùng một trường, hai giá trị khác nhau
   if(k in m)o[k]=m[k];else delete o[k]}
  M[i]=o}
 const R=sanitizeState({N:M,DW:m3(JSON.parse(SNAP.t.DW||'[]'),DW,srv.DW||[],'id'),LK:m3(JSON.parse(SNAP.t.LK||'[]'),LK,srv.LK,'id'),T:m3(JSON.parse(SNAP.t.T||'[]'),T,srv.T,'tid').filter((e,i,a)=>e.ar||a.slice(0,i).filter(x=>!x.ar).length<30),uid:Math.max(uid,srv.uid||0),lv:J(L)!==SNAP.t.lv?L:srv.lv||L,rad:1});
 return Object.keys(R.N).length==Object.keys(M).length?R:null}
// Vị trí khung nhìn và note đang chọn: lưu riêng trên máy theo từng cây, không gửi lên máy chủ
