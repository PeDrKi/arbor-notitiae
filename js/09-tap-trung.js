// Chế độ Tập trung
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
// ===== Chế độ Tập trung: đưa một nhánh vào giữa màn hình, con toả tròn quanh nó, phần còn lại mờ đi =====
// Vị trí chỉ xếp tạm: toạ độ gốc được giữ trong FSNAP và luôn được dùng khi lưu / gộp (snapState, cutState), thoát chế độ là mọi note về đúng chỗ cũ.
const _hid=hid;hid=function(id){if(FOC&&FOCS&&FOCS.has(id))return N[id].c.length>0&&FOCD[id]>=FOC.depth;return _hid(id)};
const fKids=id=>N[id].c.filter(k=>!N[k].free);
document.body.appendChild($('#fcbar'));   // thanh Tập trung nằm ngoài lớp soạn thảo trang
function fSet(){FOCS=new Set();FOCD={};if(!FOC||!N[FOC.id])return;(function go(id,d){FOCS.add(id);FOCD[id]=d;if(d<FOC.depth)fKids(id).forEach(k=>go(k,d+1))})(FOC.id,0)}
function fOrig(i){const s=FSNAP&&FSNAP[i];if(s)return s;const n=N[i];if(n.p&&N[n.p]){const o=fOrig(n.p),p=N[n.p];return{x:o.x+(n.x-p.x),y:o.y+(n.y-p.y)}}return{x:n.x,y:n.y}}   // note mới thêm lúc đang tập trung: giữ khoảng cách tới note cha
const fOrigN=()=>{const o={};for(const i in N)o[i]=Object.assign({},N[i],fOrig(i));return o};
function fLayout(){const c=FOC.id,D=FOC.depth;for(const i in N){const s=FSNAP[i];if(s){N[i].x=s.x;N[i].y=s.y}}fSet();
 const s0=FSNAP[c]||{x:N[c].x,y:N[c].y},cx=s0.x+sz(N[c])/2,cy=s0.y+sz(N[c])/2,Wt={},A={};
 const wt=id=>Wt[id]=(FOCD[id]>=D||!fKids(id).length)?1:fKids(id).reduce((a,k)=>a+wt(k),0);wt(c);
 (function go(id,a0,a1){A[id]=(a0+a1)/2;if(FOCD[id]>=D||!fKids(id).length)return;let a=a0;fKids(id).forEach(k=>{const sp=(a1-a0)*Wt[k]/Wt[id];go(k,a,a+sp);a+=sp})})(c,-Math.PI/2,1.5*Math.PI);
 const by={},R={0:0},mx=Math.max(...Object.values(FOCD));Object.keys(FOCD).forEach(i=>{(by[FOCD[i]]=by[FOCD[i]]||[]).push(i)});
 for(let d=1;d<=mx;d++){const as=by[d].map(i=>A[i]).sort((u,v)=>u-v);let g=2*Math.PI;if(as.length>1){g=Infinity;as.forEach((u,i)=>{const nx=i+1<as.length?as[i+1]:as[0]+2*Math.PI;g=Math.min(g,nx-u)})}R[d]=Math.min(8000,Math.max(R[d-1]+215,125/Math.max(g,.001)))}
 Object.keys(FOCD).forEach(i=>{const n=N[i],z=sz(n),r=R[FOCD[i]];n.x=cx+Math.cos(A[i])*r-z/2;n.y=cy+Math.sin(A[i])*r-z/2});
 const out=R[mx]+170;   // các note ngoài nhánh được đẩy ra ngoài vòng tập trung, giữ nguyên hướng so với tâm
 for(const i in N){if(FOCS.has(i)||!FSNAP[i])continue;const z=sz(N[i]),ox=FSNAP[i].x+z/2-cx,oy=FSNAP[i].y+z/2-cy,l=Math.hypot(ox,oy)||1,ux=l<1?1:ox/l,uy=l<1?0:oy/l;N[i].x=cx+ux*(l+out)-z/2;N[i].y=cy+uy*(l+out)-z/2}}
function fFly(){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;FOCS.forEach(i=>{const n=N[i],z=sz(n);x0=Math.min(x0,n.x);x1=Math.max(x1,n.x+z);y0=Math.min(y0,n.y);y1=Math.max(y1,n.y+z+16)});
 const SB=lmode?Math.min(300,innerWidth*.86):0,w=innerWidth-SB,h=innerHeight,k=Math.max(.2,Math.min(1.2,(w-120)/(x1-x0),(h-220)/(y1-y0)));fly(SB+(w-(x1-x0)*k)/2-x0*k,(h-(y1-y0)*k)/2-y0*k+20,k)}
function fApply(){if(!FOC)return;if(!N[FOC.id]){focusExit(true);return}
 nd.querySelectorAll('.n').forEach(e=>e.classList.toggle('fdim',!FOCS.has(e.dataset.id)));
 es.querySelectorAll('path[data-id]').forEach(p=>{const i=p.dataset.id,ok=N[i]&&FOCS.has(i)&&FOCS.has(N[i].p);p.style.opacity=ok?'':'.08'});
 es.querySelectorAll('[data-lk],[data-lkt]').forEach(p=>{const l=LK.find(x=>x.id==(p.dataset.lk||p.dataset.lkt)),ok=l&&FOCS.has(l.a)&&FOCS.has(l.b);p.style.opacity=ok?'':'.06'})}
const _render=render;render=function(){if(FOC)fSet();_render();if(FOC)fApply()};
function fBar(){const b=$('#fcbar');b.hidden=!FOC;$('#fcb').setAttribute('aria-pressed',!!FOC);if(!FOC)return;$('#fcn').textContent=N[FOC.id].t||'(không tên)';b.querySelectorAll('[data-fd]').forEach(x=>x.classList.toggle('on',+x.dataset.fd==FOC.depth))}
function focusEnter(id){if(!N[id])return;if(!FOC){FSNAP={};for(const i in N)FSNAP[i]={x:N[i].x,y:N[i].y};FV={x:V.x,y:V.y,k:V.k}}
 FOC={id,depth:FOC?FOC.depth:FDEF};sel=id;fLayout();render();fBar();fFly();if(!fKids(id).length)flash('Note này chưa có nhánh con; hãy thêm con để thấy chúng toả tròn.')}
function focusExit(silent){if(!FOC)return;const P={};for(const i in N)P[i]=fOrig(i);for(const i in N){N[i].x=P[i].x;N[i].y=P[i].y}
 const v=FV;FOC=null;FSNAP=null;FOCS=null;FOCD=null;FV=null;fBar();if(silent)return;render();if(v)fly(v.x,v.y,v.k)}
function focusDrop(){FOC=null;FSNAP=null;FOCS=null;FOCD=null;FV=null;fBar()}   // khi cả cây bị thay (nạp cây khác): bỏ chế độ, không khôi phục vị trí
function focusToggle(){if(!sel||!N[sel]){flash('Hãy chọn một note trước.');return 1}if(FOC&&FOC.id==sel)focusExit();else focusEnter(sel);return 1}
$('#fcb').onclick=focusToggle;$('#fcx').onclick=()=>focusExit();
$('#fcbar').addEventListener('click',e=>{const b=e.target.closest('[data-fd]');if(b&&FOC){FOC.depth=FDEF=+b.dataset.fd;fLayout();render();fBar();fFly()}});
cv.addEventListener('contextmenu',e=>{if(!(e.ctrlKey&&e.shiftKey))return;const n=e.target.closest&&e.target.closest('.n');if(n&&N[n.dataset.id]&&!n.classList.contains('fdim')){e.preventDefault();focusEnter(n.dataset.id)}});
