// Giao diện cây: thông báo, kéo thả, thùng rác, thu/mở nhánh, danh sách, chọn nhiều, điều hướng
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
function setCaret(el){const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}
pg.addEventListener('keydown',e=>{if(e.key!='Enter')return;let a=getSelection().anchorNode;a=a&&(a.nodeType==3?a.parentElement:a);const li=a&&a.closest&&a.closest('ul.tk>li');if(!li)return;e.preventDefault();
 if(!li.textContent.replace(/[\u200b\s]/g,'')){const ul=li.parentElement,p=document.createElement('p');p.innerHTML='<br>';ul.after(p);li.remove();if(!ul.children.length)ul.remove();setCaret(p)}
 else{const n=document.createElement('li');n.innerHTML='<input type="checkbox">&#8203;';li.after(n);setCaret(n)}
 pg.oninput()});
let DL=null,tt;
function flash(m,ms){const t=$('#ts');t.textContent=m;t.style.display='block';clearTimeout(tt);tt=setTimeout(()=>t.style.display='none',ms||3500)}
try{(window.claude?claude.use('downloads'):Promise.resolve(null)).then(d=>{if(d)DL=d;document.body.classList.add('dl')}).catch(()=>{})}catch(x){}
async function sv(name,data){if(!DL){const b=data instanceof Blob?data:new Blob([data],{type:name.endsWith('.json')?'application/json':'text/html'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);flash('Đã tải '+name);return}try{const r=await DL.save({filename:name,data});flash(r.status=='saved'?'Đã lưu '+name:'Đã gửi '+name)}catch(x){if(x&&x.code!='declined')flash('Không lưu được file ('+(x.code||'lỗi')+')')}}
const slug=t=>((t||'note').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||'note').slice(0,40);
function noteHtml(id){const n=N[id],pl=plOf(n),d=document.createElement('div');d.innerHTML=clean(id==sel&&ov.classList.contains('on')?pg.innerHTML:n.d||'');   // trang đang mở có đường dẫn ảnh vừa làm mớid.querySelectorAll('.pbk').forEach(b=>{b.removeAttribute('style');b.style.pageBreakAfter='always';b.style.border='0'});
 return '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>'+esc(n.t||'Note')+'</title><style>@page{size:'+PAPN[pl.sz]+' '+(pl.or=='l'?'landscape':'portrait')+';margin:'+pl.m.map(x=>(x/CM).toFixed(2)+'cm').join(' ')+'}body{font:11pt/1.5 Arial,sans-serif;max-width:'+Math.max(300,pgDim(pl)[0]-pl.m[1]-pl.m[3])+'px;margin:0 auto;padding:32px;color:#1c2a2e}.hf{color:#8a999d;font-size:9pt}h1.t{font-size:26px}table{border-collapse:collapse;width:100%}td{border:1px solid #bbb;padding:6px 10px}img,svg{max-width:100%;height:auto}blockquote{border-left:4px solid #1f8a7a;padding-left:14px;color:#4a5d62}.co{background:#e6f3f0;padding:10px 14px;border-left:4px solid #1f8a7a}ul.tk{list-style:none}</style></head><body>'+(pl.h?'<p class="hf">'+esc(pl.h)+'</p>':'')+'<h1 class="t">'+esc(n.t||'Chưa đặt tên')+'</h1><div style="position:relative;z-index:0">'+d.innerHTML+'</div>'+(pl.f?'<p class="hf">'+esc(pl.f)+'</p>':'')+'</body></html>'}
// Mục "Tải về" gộp hai kiểu tải: mở menu, chọn Word hoặc HTML; bấm ra ngoài hoặc Esc để đóng.
const dlm=$('#dlm'),dlbt=$('#dlb'),dlClose=()=>{dlm.classList.remove('on');dlbt.setAttribute('aria-expanded','false')};
dlbt.onclick=e=>{e.stopPropagation();const o=dlm.classList.toggle('on');dlbt.setAttribute('aria-expanded',o)};
dlm.addEventListener('click',dlClose);document.addEventListener('click',e=>{if(!e.target.closest('#dlw'))dlClose()});
addEventListener('keydown',e=>{if(e.key=='Escape'&&dlm.classList.contains('on')){dlClose();e.stopPropagation()}},true);
$('#xh').onclick=async()=>sv(slug(N[sel].t)+'.html',await inl(noteHtml(sel)));
$('#xw').onclick=async()=>{if(typeof htmlDocx=='undefined'){flash('Chưa tải được bộ tạo file Word. Hãy chọn Tải về > Trang web (.html) rồi mở bằng Word.');return}const pl=PL();sv(slug(N[sel].t)+'.docx',htmlDocx.asBlob(await inl(noteHtml(sel)),{orientation:pl.or=='l'?'landscape':'portrait',margins:{top:pl.m[0]*15,right:pl.m[1]*15,bottom:pl.m[2]*15,left:pl.m[3]*15}}))};
$('#rs').onclick=()=>$('#rf').click();
$('#rf').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const raw=JSON.parse(r.result);if(!raw.N||typeof raw.N!='object')throw 0;if(Object.values(raw.N).filter(n=>!n.p).length!=1)throw 0;const d=sanitizeState(raw),rt=Object.values(d.N).filter(n=>!n.p);
 askDel('Thay toàn bộ cây đang mở bằng nội dung trong file sao lưu? Cây hiện tại sẽ được tải về thành file arbor-notitiae.json trước khi thay.',async()=>{await $('#bu').onclick();
 if(!API)try{localStorage.setItem('ktree_prev',localStorage.getItem(lsKey())||'')}catch(x){}
 N=d.N;LK=d.LK||[];DW=d.DW||[];if(d.KB&&typeof d.KB=='object'){KB=d.KB;sk()}T=d.T||[];L=d.lv||3;$('#lv').value=String(L);sel=d.sel in N?d.sel:rt[0].id;V=d.V||V;uid=d.uid||uid;hits=null;spread();render();xf();fit();flash('Đã khôi phục cây tri thức');
 if(API&&!lock){lock=true;try{await liftImgs()}catch(x){}lock=false;setSync('');save()}},'Thay cây')}catch(x){flash('File không đúng định dạng sao lưu')}};r.readAsText(f);e.target.value=''};
function reparent(e){if(RO){render();return}if(drag.ms){spread(new Set(drag.ids));render();return}const t=document.elementsFromPoint(e.clientX,e.clientY).map(x=>x.closest&&x.closest('.n')).find(x=>x&&!drag.ids.includes(x.dataset.id));const id=drag.id;if(!t||!N[id].p){spread(new Set(drag.ids));render();return}const np=t.dataset.id;if(N[id].p==np){spread(new Set(drag.ids));render();return}
 const o=N[N[id].p];o.c=o.c.filter(c=>c!=id);N[np].c.push(id);opn(np);N[id].p=np;delete N[id].free;samePar(id);{const P2=N[np],pp=outPos(P2,P2.c.length-1),ddx=pp.x-N[id].x,ddy=pp.y-N[id].y;drag.ids.forEach(i=>{N[i].x+=ddx;N[i].y+=ddy});spread(new Set(drag.ids))}flash('Đã chuyển "'+(N[id].t||'note')+'" sang nhánh "'+(N[np].t||'note')+'"');render()}
let selObj=null,mvd=null;const zk=()=>(+$('#zm').value||100)/100;
function place(){const sx=$('#sx'),sb=$('#sbr'),rh=$('#rh');if(!selObj||!pg.contains(selObj)||!ov.classList.contains('on')){sx.style.display=sb.style.display=rh.style.display='none';return}
 const r=selObj.getBoundingClientRect(),pr=pa.getBoundingClientRect(),k=zk(),x=(r.left-pr.left)/k,y=(r.top-pr.top)/k,w=r.width/k,h=r.height/k;
 Object.assign(sx.style,{display:'block',left:x-2+'px',top:y-2+'px',width:w+4+'px',height:h+4+'px'});
 Object.assign(sb.style,{display:'flex',left:Math.max(0,x)+'px',top:Math.max(0,y-38)+'px'});
 Object.assign(rh.style,{display:'block',left:x+w-9+'px',top:y+h-9+'px'});
 const lay=selObj.matches('img,figure.dg');sb.querySelectorAll('[data-a="bh"],[data-a="fw"]').forEach(b=>{b.style.display=lay?'':'none';b.classList.toggle('on',selObj.dataset.wr==(b.dataset.a=='bh'?'b':'f'))})}
// Điểm (x,y) có nằm trên một chữ không: lấy vị trí con trỏ gần nhất rồi xem ô của kí tự ngay trước / ngay sau có chứa điểm đó không
function onText(x,y){const r=document.caretRangeFromPoint&&document.caretRangeFromPoint(x,y);if(!r||r.startContainer.nodeType!=3)return false;const n=r.startContainer,o=r.startOffset,q=document.createRange();
 for(const[a,b]of[[o-1,o],[o,o+1]]){if(a<0||b>n.length)continue;q.setStart(n,a);q.setEnd(n,b);for(const c of q.getClientRects())if(x>=c.left-3&&x<=c.right+3&&y>=c.top-4&&y<=c.bottom+4)return true}return false}
pg.addEventListener('click',e=>{let o=e.target.closest&&e.target.closest('img,figure.dg,table,.co');
 if(!o&&!onText(e.clientX,e.clientY))o=[...pg.querySelectorAll('[data-wr="b"]')].reverse().find(el=>{const r=el.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom});
 selObj=o&&pg.contains(o)?o:null;place()});
function aln(o,m){const st=o.style,img=o.tagName=='IMG';
 if(m=='bh'||m=='fw'){if(!o.matches('img,figure.dg'))return;      // sau chữ / trước chữ: đặt tự do trên trang, giữ nguyên chỗ và cỡ đang thấy
  const r=o.getBoundingClientRect(),pr=pg.getBoundingClientRect(),k=zk();st.float='';st.margin='0';st.textAlign='';st.display='block';st.width=Math.round(r.width/k)+'px';
  st.position='absolute';st.left=Math.round((r.left-pr.left)/k)+'px';st.top=Math.round((r.top-pr.top)/k)+'px';st.zIndex=m=='bh'?-1:1;o.dataset.wr=m=='bh'?'b':'f';return}
 if(o.dataset.wr){delete o.dataset.wr;st.position=st.left=st.top=st.zIndex='';st.margin=''}      // quay về nằm trong dòng văn bản
 st.float='';st.marginTop=st.marginBottom=st.marginLeft=st.marginRight='';st.textAlign='';
 if(img)st.display=(m=='fl'||m=='fr')?'':'block';
 if(m=='fl'||m=='fr'){st.float=m=='fl'?'left':'right';st[m=='fl'?'marginRight':'marginLeft']='16px';st.marginBottom='8px';if(!img&&!st.width)st.width='45%'}
 else{st.marginTop=st.marginBottom='12px';st.marginLeft=m=='l'?'0':'auto';st.marginRight=m=='r'?'0':'auto';if(o.matches('figure.dg'))st.textAlign=m=='l'?'left':m=='r'?'right':'center'}}
$('#sbr').addEventListener('mousedown',e=>{if(e.target.id!='mv')e.preventDefault()});
$('#sbr').addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b||!selObj)return;const a=b.dataset.a;if(a=='x'){const o=selObj;selObj=null;o.remove()}else aln(selObj,a);pg.oninput();place()});
$('#mv').addEventListener('pointerdown',e=>{if(!selObj)return;e.preventDefault();const o=selObj;let ref=null;document.body.classList.add('mvg');
 if(o.dataset.wr){const k=zk(),x0=e.clientX,y0=e.clientY,l0=parseFloat(o.style.left)||0,t0=parseFloat(o.style.top)||0;
  const mm=ev=>{o.style.left=Math.round(l0+(ev.clientX-x0)/k)+'px';o.style.top=Math.round(t0+(ev.clientY-y0)/k)+'px';place()};
  const up=()=>{removeEventListener('pointermove',mm);removeEventListener('pointerup',up);document.body.classList.remove('mvg');pg.oninput();place()};
  addEventListener('pointermove',mm);addEventListener('pointerup',up);return}
 const mm=ev=>{const kids=[...pg.children].filter(c=>c!==o&&!(o.tagName=='IMG'&&c===o.parentElement&&!c.textContent.trim()&&c.children.length==1));ref=null;
  for(const c of kids){const r=c.getBoundingClientRect();if(ev.clientY<r.top+r.height/2){ref={c,a:0};break}ref={c,a:1}}
  const di=$('#di');if(!ref){di.style.display='none';return}const r=ref.c.getBoundingClientRect(),pr=pa.getBoundingClientRect(),gr=pg.getBoundingClientRect(),k=zk();
  Object.assign(di.style,{display:'block',top:((ref.a?r.bottom:r.top)-pr.top)/k-1+'px',left:(gr.left-pr.left)/k+'px',width:gr.width/k+'px'})};
 const up=()=>{removeEventListener('pointermove',mm);removeEventListener('pointerup',up);document.body.classList.remove('mvg');$('#di').style.display='none';
  if(ref){const old=o.parentElement;let t=o;if(o.tagName=='IMG'&&old!==pg){t=document.createElement('p');t.append(o)}
   ref.a?ref.c.after(t):ref.c.before(t);
   if(old!==pg&&old.tagName=='P'&&!old.textContent.trim()&&!old.querySelector('img,table'))old.remove();pg.oninput()}place()};
 addEventListener('pointermove',mm);addEventListener('pointerup',up)});
$('#rh').addEventListener('pointerdown',e=>{if(!selObj)return;e.preventDefault();const o=selObj,k=zk(),w0=o.getBoundingClientRect().width/k,x0=e.clientX;
 if(o.tagName!='IMG'&&!o.style.float&&!o.style.marginLeft)o.style.marginLeft=o.style.marginRight='auto';
 const mm=ev=>{const w=Math.max(40,Math.min(pg.clientWidth,w0+(ev.clientX-x0)/k));o.style.width=w+'px';if(o.tagName=='IMG')o.style.height='auto';
  if(o.matches('figure.dg')){const sv=o.querySelector('svg');if(sv){sv.style.maxWidth='none';sv.style.width='100%';sv.style.height='auto'}}place()};
 const up=()=>{removeEventListener('pointermove',mm);removeEventListener('pointerup',up);pg.oninput()};addEventListener('pointermove',mm);addEventListener('pointerup',up)});
cv.addEventListener('dblclick',e=>{if(dmode||ov.classList.contains('on'))return;const t=document.elementsFromPoint(e.clientX,e.clientY).map(x=>x.closest&&x.closest('.n')).find(Boolean);if(t&&N[t.dataset.id]){LC={};openDoc(t.dataset.id,e.shiftKey)}else if(!RO&&!lkFrom&&!msOn&&!e.target.closest('#pn')){newFree(e.clientX,e.clientY)}});
function pplace(){if(!sel||!N[sel]||innerWidth<=640)return;const n=N[sel],w=300,h=pn.offsetHeight||280,wr=sz(n);let x=V.x+(n.x+wr)*V.k+44;if(x+w>innerWidth-8)x=V.x+n.x*V.k-w-44;
 pn.style.left=Math.max(8,Math.min(innerWidth-w-8,x))+'px';pn.style.top=Math.max(64,Math.min(innerHeight-h-8,V.y+n.y*V.k-10))+'px'}
let udT;
function trashLbl(){const b=$('#trb'),n=TR().length;if(b)b.textContent=n?'Thùng rác ('+n+')':'Thùng rác';const a=$('#arb'),m=T.length-n;if(a)a.textContent=m?'Kho ('+m+')':'Kho'}
function undoBar(e){const c=Object.keys(e.nodes).length;$('#uds').textContent=(e.ar?'Đã cất vào kho "':'Đã xoá "')+(e.nodes[e.id].t||'note')+'"'+(c>1?' và '+(c-1)+' note con':'');$('#ud').style.display='flex';$('#udb').onclick=()=>{slide(()=>restore(e.tid));$('#ud').style.display='none'};clearTimeout(udT);udT=setTimeout(()=>$('#ud').style.display='none',9000)}
function restore(tid){const k=T.findIndex(x=>x.tid==tid);if(k<0)return;const e=T[k],par=N[e.par]?e.par:root(),P=N[par],r=e.nodes[e.id],sib=P.c.length?N[P.c[P.c.length-1]]:null;
 const pp=outPos(P,P.c.length),dx=pp.x-r.x,dy=pp.y-r.y;Object.values(e.nodes).forEach(n=>{n.x+=dx;n.y+=dy;N[n.id]=n});r.p=par;(e.lk||[]).forEach(l=>{if(N[l.a]&&N[l.b]&&!LK.some(x=>x.id==l.id))LK.push(l)});P.c.splice(Math.min(e.idx,P.c.length),0,e.id);opn(P.id);T.splice(k,1);sel=e.id;samePar(e.id);
 spread(new Set(Object.keys(e.nodes)));V.x=innerWidth/2-r.x*V.k;V.y=innerHeight/2-r.y*V.k;xf();render()}
function askDel(msg,fn,ok){cfAct=fn;$('#cfb b').textContent=ok?'Xác nhận':'Xác nhận xoá';$('#cfk').textContent=ok||'Xoá vĩnh viễn';$('#cfp').textContent=msg+' Không thể hoàn tác. Hãy gõ DELETE để xác nhận.';$('#cfi').value='';$('#cfk').disabled=true;$('#cfm').classList.add('on');$('#cfi').focus()}
function trashUI(){T=T.filter(e=>e.ar||Date.now()-e.at<2592e6);$('#trl').innerHTML=TR().length?TR().map(e=>{const r=e.nodes[e.id],c=Object.keys(e.nodes).length;return `<div class="ti"><div><b>${esc(r.t||'Chưa đặt tên')}</b><small>${c} note · xoá lúc ${fd(e.at)}</small></div><span class="row"><button class="pill sm" data-r="${esc(e.tid)}">Khôi phục</button><button class="pill sm" data-p="${esc(e.tid)}">Xoá hẳn</button></span></div>`}).join(''):'<p class="mu">Thùng rác trống.</p>';$('#trp').style.display=TR().length?'':'none';trashLbl()}
$('#trb').onclick=()=>{trashUI();$('#tr').classList.add('on')};
$('#trx').onclick=()=>$('#tr').classList.remove('on');
$('#trl').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.r){slide(()=>restore(b.dataset.r));trashUI();flash('Đã khôi phục')}
 else if(b.dataset.p){const t=b.dataset.p,x=T.find(z=>z.tid==t);if(x)askDel('Xoá hẳn "'+(x.nodes[x.id].t||'note')+'" khỏi thùng rác?',()=>{T=T.filter(z=>z.tid!=t);trashUI();render()})}};
$('#trp').onclick=()=>askDel('Dọn sạch '+TR().length+' mục trong thùng rác?',()=>{T=T.filter(e=>e.ar);trashUI();render()});
function box(id){const n=N[id],s=sz(n);return{x:n.x+s/2-79,y:n.y-6,w:158,h:s+46}}
function spread(pin){const ids=vis();pin=pin||new Set();
 for(let it=0;it<80;it++){let ch=0;const g=new Map();
  ids.forEach(i=>{const b=box(i),x0=Math.floor(b.x/160),x1=Math.floor((b.x+b.w)/160),y0=Math.floor(b.y/120),y1=Math.floor((b.y+b.h)/120);for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const k=x+','+y;let c=g.get(k);if(!c)g.set(k,c=[]);c.push(i)}});
  const seen=new Set();
  g.forEach(c=>{for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++){const a=c[i],b=c[j],key=a<b?a+'|'+b:b+'|'+a;if(seen.has(key))continue;seen.add(key);
   const pa_=pin.has(a),pb=pin.has(b);if(pa_&&pb)continue;
   const A=box(a),B=box(b),ox=Math.min(A.x+A.w,B.x+B.w)-Math.max(A.x,B.x),oy=Math.min(A.y+A.h,B.y+B.h)-Math.max(A.y,B.y);if(ox<=0||oy<=0)continue;ch=1;
   let dx=0,dy=0;if(oy<=ox*1.2)dy=(A.y+A.h/2<=B.y+B.h/2?1:-1)*(oy+2);else dx=(A.x+A.w/2<=B.x+B.w/2?1:-1)*(ox+2);
   if(pa_){N[b].x+=dx;N[b].y+=dy}else if(pb){N[a].x-=dx;N[a].y-=dy}else{N[b].x+=dx/2;N[b].y+=dy/2;N[a].x-=dx/2;N[a].y-=dy/2}}});
  if(!ch)break}}
function snap(){cancelAnimationFrame(fy);cancelAnimationFrame(zl);zt=null;if(pend){cancelAnimationFrame(anim);for(const i in pend)if(N[i]){N[i].x=pend[i][0];N[i].y=pend[i][1]}pend=null;repos()}}
function slide(fn){snap();const b={};Object.keys(N).forEach(i=>b[i]=[N[i].x,N[i].y]);fn();const to={};let mv=0;
 Object.keys(N).forEach(i=>{if(b[i]&&(Math.abs(b[i][0]-N[i].x)>.5||Math.abs(b[i][1]-N[i].y)>.5)){to[i]=[N[i].x,N[i].y];mv=1}});
 if(!mv||matchMedia('(prefers-reduced-motion: reduce)').matches){render();return}
 for(const i in to){N[i].x=b[i][0];N[i].y=b[i][1]}pend=to;const t0=performance.now();
 const step=now=>{const k=Math.min(1,(now-t0)/420),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;for(const i in to)if(N[i]){N[i].x=b[i][0]+(to[i][0]-b[i][0])*e;N[i].y=b[i][1]+(to[i][1]-b[i][1])*e}repos();if(k<1)anim=requestAnimationFrame(step);else{pend=null;save()}};
 render();anim=requestAnimationFrame(step)}
function dep(id){let d=0,c=id;while(N[c].p&&!N[c].free){d++;c=N[c].p}return d}
function hid(id){const n=N[id];return n.c.length>0&&(!!n.fold||(dep(id)>=L-1&&!n.open))}
function opn(id){N[id].fold=0;N[id].open=1}
$('#lv').onchange=e=>{L=+e.target.value;Object.values(N).forEach(n=>{n.open=0;n.fold=0});if(sel&&!vis().includes(sel))sel=null;slide(()=>layout());fit()};
function fly(x,y,k,ms){cancelAnimationFrame(fy);cancelAnimationFrame(zl);zt=null;const s0={x:V.x,y:V.y,k:V.k},t0=performance.now(),D=ms===undefined?480:ms;
 if(!D||matchMedia('(prefers-reduced-motion: reduce)').matches){V.x=x;V.y=y;V.k=k;xf();return}
 const st=now=>{const u=Math.min(1,(now-t0)/D),e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;V.x=s0.x+(x-s0.x)*e;V.y=s0.y+(y-s0.y)*e;V.k=s0.k+(k-s0.k)*e;xf();if(u<1)fy=requestAnimationFrame(st)};fy=requestAnimationFrame(st)}
function zloop(){V.x+=(zt.x-V.x)*.25;V.y+=(zt.y-V.y)*.25;V.k+=(zt.k-V.k)*.25;xf();
 if(Math.abs(zt.k-V.k)<.0005&&Math.abs(zt.x-V.x)<.3&&Math.abs(zt.y-V.y)<.3){V.x=zt.x;V.y=zt.y;V.k=zt.k;xf();zt=null;return}zl=requestAnimationFrame(zloop)}
function ed(id){const n=N[id],a=ctr(N[n.p]),b=ctr(n),rc=ctr(N[root()]),k=Math.hypot(b[0]-a[0],b[1]-a[1])*.4,ua=n.p==root()?unit(b,a):unit(a,rc),ub=unit(b,rc);
 return `M${a[0]} ${a[1]}C${a[0]+ua[0]*k} ${a[1]+ua[1]*k} ${b[0]-ub[0]*k} ${b[1]-ub[1]*k} ${b[0]} ${b[1]}`}
function repos(){nd.querySelectorAll('.n').forEach(e=>{const n=N[e.dataset.id];if(n)e.style.transform='translate('+n.x+'px,'+n.y+'px)'});
 for(const p of es.children){const id=p.dataset.id;if(id){if(N[id]&&N[id].p&&N[N[id].p]&&!N[id].free)p.setAttribute('d',ed(id))}else{const k=p.dataset.lk||p.dataset.lkt,l=LK.find(x=>x.id==k);if(l&&N[l.a]&&N[l.b]){const q=lkd(l);if(p.dataset.lk)p.setAttribute('d',q.d);else{p.setAttribute('x',q.x);p.setAttribute('y',q.y)}}}}pplace()}
let lastSel=null;
function focusNode(id){const ch=[];let x=N[id].p;while(x){ch.unshift(x);x=N[x].p}const need=ch.filter(a=>hid(a));
 if(need.length)slide(()=>{need.forEach(a=>{opn(a);placeSub(a)});spread(new Set(desc(need[0])))});
 const q=pend&&pend[id],c=q?[q[0]+32,q[1]+32]:ctr(N[id]),k=Math.max(V.k,.6),SB=lmode?Math.min(300,innerWidth*.86):0;fly(SB+(innerWidth-SB)/2-c[0]*k,innerHeight/2-c[1]*k,k)}
function listRender(){const q=hits,show=new Set();
 let need=0;if(sel!==lastSel){lastSel=sel;need=1;if(sel&&N[sel]){let p=N[sel].p;while(p){lex.add(p);p=N[p].p}}}
 if(q)q.forEach(i=>{show.add(i);let p=N[i].p;while(p){show.add(p);p=N[p].p}});
 let h='';(function go(id,d){const n=N[id];if(q&&!show.has(id))return;const refs=q?[]:LK.filter(l=>l.k=='p'&&l.a==id&&N[l.b]).map(l=>l.b),kids=n.c.length+refs.length,open=q?n.c.some(c=>show.has(c)):lex.has(id);
  h+=`<div class="lr${id==sel?' sel':''}${q&&q.has(id)?' hit':''}" draggable="${n.p?'true':'false'}" data-id="${esc(id)}" style="margin-left:${d*22}px;--c:${col(id)}"><button class="ar" data-k="t" aria-label="Mở rộng hoặc thu gọn">${kids?(open?'▾':'▸'):''}</button><i class="dot"></i><span class="t">${esc(n.t||'Chưa đặt tên')}</span>${n.free?'<span class="cnt">độc lập</span>':''}${kids?`<span class="cnt">${kids}</span>`:''}<span class="s">${lkHidden(id)?'***':esc(n.b||'')}</span><span class="dt">${lkHidden(id)?'***':fd(n.md)}</span><span class="ac"><button class="pill sm" data-k="o">Mở</button><button class="pill sm" data-k="a">+ Con</button></span></div>`;
  if(kids&&open){srt(n.c).forEach(c=>go(c,d+1));      // sau các note con là các note dùng chung từ nhánh khác (chỉ là lối tắt, không mở rộng tiếp)
   refs.forEach(c=>{h+=`<div class="lr ref${c==sel?' sel':''}" data-id="${esc(c)}" style="margin-left:${(d+1)*22}px;--c:${col(c)}" title="Note dùng chung — nhánh chính: ${esc(N[N[c].p]?N[N[c].p].t||'':'')}"><button class="ar" data-k="t" tabindex="-1"></button><i class="dot"></i><span class="t">${esc(N[c].t||'Chưa đặt tên')}</span><span class="cnt">↗ dùng chung</span></div>`})}})(root(),0);
 $('#ls .lw').innerHTML=h||'<p class="mu">Không có note nào khớp.</p>';if(need){const sr=$('#ls .lr.sel');if(sr)sr.scrollIntoView({block:'nearest'})}}
const ls=$('#ls');let ld=null,lfirst=true;
$('#vw').onclick=()=>{lmode=!lmode;document.body.classList.toggle('lm',lmode);$('#vw').textContent=lmode?'Ẩn danh sách':'Danh sách';fly(V.x+(lmode?150:-150),V.y,V.k,350);
 if(lmode){if(lfirst){lfirst=false;Object.keys(N).forEach(i=>{if(dep(i)<2)lex.add(i)})}let p=sel&&N[sel]?N[sel].p:null;while(p){lex.add(p);p=N[p].p}}
 render()};
$('#lx').onclick=()=>$('#vw').click();
$('#lea').onclick=()=>{Object.keys(N).forEach(i=>{if(N[i].c.length)lex.add(i)});listRender()};
$('#lco').onclick=()=>{lex.clear();listRender()};
ls.addEventListener('click',e=>{const r=e.target.closest('.lr');if(!r)return;const id=r.dataset.id,b=e.target.closest('button');
 if(b&&b.dataset.k=='t'){lex.has(id)?lex.delete(id):lex.add(id);listRender();return}
 if(b&&b.dataset.k=='o'){openDoc(id);return}
 if(b&&b.dataset.k=='a'){if(RO)return;lex.add(id);add(id);return}
 sel=id;focusNode(id);render()});
ls.addEventListener('dblclick',e=>{const r=e.target.closest('.lr');if(r&&!e.target.closest('button'))openDoc(r.dataset.id,e.shiftKey)});
ls.addEventListener('dragstart',e=>{if(RO){e.preventDefault();return}const r=e.target.closest('.lr');if(!r||!N[r.dataset.id].p){e.preventDefault();return}ld=r.dataset.id;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',ld)}catch(x){}});
ls.addEventListener('dragover',e=>{const r=e.target.closest('.lr');if(!r||!ld)return;const t=r.dataset.id;if(desc(ld).includes(t))return;e.preventDefault();
 ls.querySelectorAll('.drop,.drop-a,.drop-b').forEach(x=>x.classList.remove('drop','drop-a','drop-b'));const rc=r.getBoundingClientRect(),y=(e.clientY-rc.top)/rc.height;r.classList.add(!N[t].p?'drop':y<.28?'drop-b':y>.72?'drop-a':'drop')});
ls.addEventListener('dragleave',e=>{const r=e.target.closest('.lr');if(r&&!r.contains(e.relatedTarget))r.classList.remove('drop','drop-a','drop-b')});
ls.addEventListener('dragend',()=>{ld=null;ls.querySelectorAll('.drop').forEach(x=>x.classList.remove('drop','drop-a','drop-b'))});
ls.addEventListener('drop',e=>{e.preventDefault();ls.querySelectorAll('.drop,.drop-a,.drop-b').forEach(x=>x.classList.remove('drop','drop-a','drop-b'));const r=e.target.closest('.lr');if(!r||!ld)return;const t=r.dataset.id,id=ld;ld=null;if(desc(id).includes(t))return;
 const rc=r.getBoundingClientRect(),y=(e.clientY-rc.top)/rc.height,mode=!N[t].p?'c':y<.28?'b':y>.72?'a':'c',P=N[mode=='c'?t:N[t].p];if(mode=='c'&&N[id].p==t)return;
 const o=N[N[id].p];o.c=o.c.filter(c=>c!=id);if(mode=='c')P.c.push(id);else{const i=P.c.indexOf(t);P.c.splice(mode=='b'?i:i+1,0,id)}
 const moved=N[id].p!=P.id;N[id].p=P.id;delete N[id].free;samePar(id);
 if(moved){opn(P.id);lex.add(P.id);const pp=outPos(P,P.c.length-1),dx=pp.x-N[id].x,dy=pp.y-N[id].y;desc(id).forEach(i=>{N[i].x+=dx;N[i].y+=dy});spread(new Set(desc(id)))}
 sel=id;render();flash(mode=='c'?'Đã chuyển "'+(N[id].t||'note')+'" vào "'+(P.t||'note')+'"':'Đã đổi thứ tự "'+(N[id].t||'note')+'"')});
function toggleFold(id){const n=N[id],was=hid(id),gs=was?[]:desc(id).filter(i=>i!=id).map(i=>nd.querySelector('[data-id="'+i+'"]')).filter(Boolean).map(e=>{const g=e.cloneNode(true);g.removeAttribute('data-id');g.classList.add('gh');return g});
 slide(()=>{if(was){opn(id);placeSub(id);spread(new Set(desc(id)))}else{n.fold=1;n.open=0}});
 if(gs.length){const tp=N[id];gs.forEach(g=>nd.appendChild(g));requestAnimationFrame(()=>requestAnimationFrame(()=>gs.forEach(g=>{g.style.opacity=0;g.style.transform='translate('+tp.x+'px,'+tp.y+'px) scale(.3)'})));setTimeout(()=>gs.forEach(g=>g.remove()),480)}}
function msUI(){$('#msb').style.display=msOn?'flex':'none';$('#msm').classList.toggle('on',msOn);$('#msn').textContent=ms.size?'Đã chọn '+ms.size+' note':'Bấm hoặc quét chuột để chọn note';$('#msg').disabled=ms.size<2;render()}
function msToggle(id){if(!N[id])return;ms.has(id)?ms.delete(id):ms.add(id);msOn=true;sel=null;msUI()}
$('#msm').onclick=()=>{msOn=!msOn;if(msOn)sel=null;else ms.clear();msUI()};
$('#msx').onclick=()=>{msOn=false;ms.clear();msUI()};
$('#msc').onclick=()=>{ms.clear();msUI()};
$('#msg').onclick=()=>groupSel();
function rbEnd(e){$('#rb').style.display='none';if(!drag.m)return;const k=V.k,x0=(Math.min(e.clientX,drag.sx)-V.x)/k,x1=(Math.max(e.clientX,drag.sx)-V.x)/k,y0=(Math.min(e.clientY,drag.sy)-V.y)/k,y1=(Math.max(e.clientY,drag.sy)-V.y)/k;
 vis().forEach(i=>{const n=N[i],z=sz(n),cx=n.x+z/2,cy=n.y+z/2;if(n.p&&cx>=x0&&cx<=x1&&cy>=y0&&cy<=y1)ms.add(i)});msUI()}
function groupSel(){const all=[...ms].filter(i=>N[i]&&N[i].p);
 const anc=(a,b)=>{let x=N[b].p;while(x){if(x==a)return true;x=N[x].p}return false};
 const S=all.filter(i=>!all.some(j=>j!=i&&anc(j,i)));
 if(S.length<2){flash('Chọn ít nhất 2 note (không tính note gốc)');return}
 const chain=i=>{const c=[];let x=N[i].p;while(x){c.push(x);x=N[x].p}return c};
 const P=N[chain(S[0]).find(a=>S.every(i=>chain(i).includes(a)))],at=P.c.findIndex(c=>S.includes(c)),gx=S.reduce((a,i)=>a+N[i].x,0)/S.length,gy=S.reduce((a,i)=>a+N[i].y,0)/S.length;
 msOn=false;ms.clear();let gid;
 slide(()=>{const oc={};S.forEach(i=>oc[i]=col(i));gid=mk('Nhóm mới','',P.id,P.p?undefined:P.c.length);const g=N[gid];g.g=1;g.x=gx;g.y=gy;
  P.c=P.c.filter(c=>c!=gid);S.forEach(i=>{const o=N[N[i].p];o.c=o.c.filter(c=>c!=i)});P.c.splice(at<0?P.c.length:Math.min(at,P.c.length),0,gid);
  S.forEach(i=>{g.c.push(i);N[i].p=gid;delete N[i].free;{const v=outv(i);desc(i).forEach(d=>{N[d].x+=v[0];N[d].y+=v[1]})}});
  S.forEach(i=>{if(col(i)!==oc[i])N[i].cc=oc[i]});opn(gid);sel=gid;spread(new Set([gid].concat(...S.map(desc))))});
 msUI();const t=$('#pt');t.focus();t.select();flash('Đã gom '+S.length+' note vào một nhóm. Đặt tên cho nhóm ở khung bên cạnh.')}
$('#ug').onclick=()=>{const g=N[sel];if(!g||!g.g)return;const P=N[g.p],at=P.c.indexOf(g.id),kids=g.c.slice(),nm=g.t||'Nhóm';let full=false;
 slide(()=>{const oc={};kids.forEach(k=>oc[k]=col(k));kids.forEach(k=>{N[k].p=P.id});P.c.splice(at,1,...kids);kids.forEach(k=>{if(col(k)!==oc[k])N[k].cc=oc[k]});
  const e={tid:'t'+Date.now(),at:Date.now(),id:g.id,idx:at,par:P.id,nodes:{[g.id]:Object.assign({},g,{c:[]})},lk:LK.filter(l=>l.a==g.id||l.b==g.id)};LK=LK.filter(l=>l.a!=g.id&&l.b!=g.id);delete N[g.id];full=trashPush(e);sel=kids.length?kids[0]:P.id;spread(new Set([].concat(...kids.map(desc))))});
 flash('Đã bỏ nhóm "'+nm+'". Nhóm được giữ trong thùng rác.'+(full?' '+TFULL:''))};

const hp=$('#hp');let KB={},cap=null;try{KB=JSON.parse(localStorage.getItem('ktree_keys'))||{}}catch(x){}
const sk=()=>{try{localStorage.setItem('ktree_keys',JSON.stringify(KB))}catch(x){}};
function hpTog(o){const open=o===undefined?!hp.classList.contains('on'):o;hp.classList.toggle('on',open);if(open)hpRender();else cap=null}
$('#hpb').onclick=()=>hpTog();$('#hpx').onclick=()=>hpTog(false);hp.addEventListener('mousedown',e=>{if(e.target===hp)hpTog(false)});
function zoomBy(f){cancelAnimationFrame(fy);cancelAnimationFrame(zl);if(!zt)zt={x:V.x,y:V.y,k:V.k};const cx=innerWidth/2,cy=innerHeight/2,k=Math.min(2.5,Math.max(.15,zt.k*f)),r=k/zt.k;zt.x=cx-(cx-zt.x)*r;zt.y=cy-(cy-zt.y)*r;zt.k=k;zl=requestAnimationFrame(zloop)}
function navTo(id){if(!id||!N[id])return;sel=id;render();const c=ctr(N[id]),sx=V.x+c[0]*V.k,sy=V.y+c[1]*V.k,SB=lmode?Math.min(300,innerWidth*.86):0;if(sx<SB+40||sx>innerWidth-40||sy<80||sy>innerHeight-60)focusNode(id)}
const panBy=(dx,dy)=>{fly(V.x-dx*140,V.y-dy*140,V.k,200);return 1};
const lvSet=v=>{const lv=$('#lv');lv.value=v;lv.dispatchEvent(new Event('change'));return 1};
const sib=d=>{if(!sel||!N[sel]){navTo(root());return 1}const n=N[sel];if(n.p){const sb=N[n.p].c,i=sb.indexOf(sel);if(sb[i+d])navTo(sb[i+d])}return 1};
const G1='Sơ đồ — chọn và di chuyển',G2='Sơ đồ — chỉnh sửa note',G3='Chọn nhiều và giao diện';
const ACT={
 parent:{g:G1,l:'Chọn note cha',k:['ArrowLeft'],f:()=>{if(!sel)navTo(root());else if(N[sel].p)navTo(N[sel].p);return 1}},
 child:{g:G1,l:'Chọn note con đầu tiên (mở nhánh nếu đang ẩn)',k:['ArrowRight'],f:()=>{if(!sel){navTo(root());return 1}const n=N[sel];if(n.c.length){hid(sel)?toggleFold(sel):navTo(n.c[0])}return 1}},
 prev:{g:G1,l:'Chọn note cùng cấp phía trước',k:['ArrowUp'],f:()=>sib(-1)},
 next:{g:G1,l:'Chọn note cùng cấp phía sau',k:['ArrowDown'],f:()=>sib(1)},
 panL:{g:G1,l:'Kéo khung nhìn sang trái',k:['Shift+ArrowLeft'],f:()=>panBy(-1,0)},
 panR:{g:G1,l:'Kéo khung nhìn sang phải',k:['Shift+ArrowRight'],f:()=>panBy(1,0)},
 panU:{g:G1,l:'Kéo khung nhìn lên',k:['Shift+ArrowUp'],f:()=>panBy(0,-1)},
 panD:{g:G1,l:'Kéo khung nhìn xuống',k:['Shift+ArrowDown'],f:()=>panBy(0,1)},
 fit:{g:G1,l:'Xem toàn bộ cây',k:['0'],f:()=>{fit();return 1}},
 zin:{g:G1,l:'Phóng to',k:['+','='],f:()=>{zoomBy(1.25);return 1}},
 zout:{g:G1,l:'Thu nhỏ',k:['-','_'],f:()=>{zoomBy(.8);return 1}},
 lv2:{g:G1,l:'Hiển thị 2 cấp',k:['2'],f:()=>lvSet('2')},lv3:{g:G1,l:'Hiển thị 3 cấp',k:['3'],f:()=>lvSet('3')},lv4:{g:G1,l:'Hiển thị 4 cấp',k:['4'],f:()=>lvSet('4')},lv5:{g:G1,l:'Hiển thị 5 cấp',k:['5'],f:()=>lvSet('5')},lv9:{g:G1,l:'Hiển thị tất cả cấp',k:['9'],f:()=>lvSet('99')},
 lay:{g:G1,l:'Sắp xếp lại cả cây',k:['Shift+r'],f:()=>{$('#lay').click();return 1}},
 find:{g:G1,l:'Tìm note',k:['/','Ctrl+f'],f:()=>{$('#q').focus();$('#q').select();return 1}},
 esc:{g:G1,l:'Bỏ chọn / thoát chế độ chọn nhiều',k:['Escape'],fixed:1,f:()=>{if(FOC){focusExit();return 1}if(dmode){drawTog(false);return 1}if(lkFrom){lkFrom=null;lkBar();return 1}if(msOn){$('#msx').click();return 1}if(sel){sel=null;render();return 1}}},
 add:{g:G2,l:'Thêm note con',k:['Tab','n'],f:()=>{if(sel){add(sel);return 1}}},
 sibl:{g:G2,l:'Thêm note cùng cấp',k:['Enter'],f:()=>{if(sel&&N[sel].p){add(N[sel].p);return 1}}},
 ren:{g:G2,l:'Sửa tên note',k:['F2'],f:()=>{if(sel){$('#pt').focus();$('#pt').select();return 1}}},
 open:{g:G2,l:'Mở trang soạn thảo',k:['o'],f:()=>{if(sel){openDoc(sel);return 1}}},
 focus:{g:G2,l:'Tập trung vào nhánh đang chọn (bật / tắt)',k:['f'],f:()=>focusToggle()},
 fold:{g:G2,l:'Thu gọn / mở nhánh',k:['Space'],f:()=>{if(sel&&N[sel].c.length){toggleFold(sel);return 1}}},
 del:{g:G2,l:'Xoá nhánh (phải gõ DELETE)',k:['Delete','Backspace'],f:()=>{if(sel){$('#dl').click();return 1}}},
 undo:{g:G2,l:'Hoàn tác ngay sau khi xoá',k:['Ctrl+z'],f:()=>{if(dmode){dUndo();return 1}if($('#ud').style.display=='flex')$('#udb').click();else flash('Chỉ hoàn tác được ngay sau khi xoá. Các nhánh đã xoá nằm trong thùng rác.');return 1}},
 link:{g:G2,l:'Nối note đang chọn với note khác',k:['k'],f:()=>{if(sel){lkFrom=sel;lkBar();return 1}}},
 move:{g:G2,l:'Chuyển note đang chọn sang nhánh khác',k:['v'],f:()=>{if(sel&&N[sel].p){nlOpen(sel);return 1}}},
 member:{g:G2,l:'Thêm note đang chọn vào một nhánh nữa',k:['Shift+v'],f:()=>{if(sel&&N[sel].p){nlOpen(sel,1);return 1}}},
 freeN:{g:G2,l:'Tạo note độc lập',k:['i'],f:()=>{newFree();return 1}},
 trash:{g:G2,l:'Mở thùng rác',k:['t'],f:()=>{$('#trb').click();return 1}},
 dredo:{g:G3,l:'Làm lại nét vẽ (khi đang vẽ)',k:['Ctrl+y','Ctrl+Shift+z'],f:()=>{if(dmode){dRedo();return 1}}},
 draw:{g:G3,l:'Bật / tắt chế độ vẽ tự do',k:['d'],f:()=>{drawTog();return 1}},
 multi:{g:G3,l:'Bật / tắt chế độ chọn nhiều',k:['m'],f:()=>{$('#msm').click();return 1}},
 all:{g:G3,l:'Chọn tất cả (khi chọn nhiều)',k:['Ctrl+a'],f:()=>{if(msOn){vis().forEach(i=>{if(N[i].p)ms.add(i)});msUI();return 1}}},
 grp:{g:G3,l:'Gom các note đã chọn thành nhóm',k:['g'],f:()=>{if(msOn&&ms.size>=2){groupSel();return 1}}},
 list:{g:G3,l:'Hiện / ẩn danh sách bên trái',k:['l'],f:()=>{$('#vw').click();return 1}},
 help:{g:G3,l:'Mở bảng phím tắt',k:['?'],f:()=>{hpTog(true);return 1}}};
const DOCK=[['Esc','Quay về sơ đồ'],['Ctrl+B / I / U','Đậm / nghiêng / gạch chân'],['Ctrl+Shift+X','Gạch ngang'],['Ctrl+Alt+1 2 3','Tiêu đề 1, 2, 3'],['Ctrl+Alt+0','Văn bản thường'],['Ctrl+L / E / R / J','Căn trái / giữa / phải / đều'],['Ctrl+Shift+L','Danh sách chấm'],['Ctrl+Shift+7','Danh sách số'],['Ctrl+] / Ctrl+[','Tăng / giảm thụt lề'],['Ctrl+Enter','Ngắt trang'],['Ctrl+Z / Ctrl+Y','Hoàn tác / làm lại']];
const keysOf=id=>KB[id]||ACT[id].k;
const kc=e=>{const k=e.key;if(['Shift','Control','Alt','Meta'].includes(k))return'';const one=k.length==1,L=one&&k.toLowerCase()!=k.toUpperCase();return(e.ctrlKey||e.metaKey?'Ctrl+':'')+(e.altKey?'Alt+':'')+(e.shiftKey&&(!one||L)?'Shift+':'')+(k==' '?'Space':one?k.toLowerCase():k)};
const pk=c=>{const m=/^((?:Ctrl\+|Alt\+|Shift\+)*)(.*)$/.exec(c),b=m[2],AR={ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓'};return m[1]+(AR[b]||(b.length==1?b.toUpperCase():b))};
const kmap=()=>{const m={};for(const id in ACT)keysOf(id).forEach(c=>m[c]=id);return m};
function hpRender(){const gs={};for(const id in ACT)(gs[ACT[id].g]=gs[ACT[id].g]||[]).push(id);
 $('#hph').innerHTML='<span id="hpm">'+(cap?'Nhấn phím mới cho "'+esc(ACT[cap].l)+'" (Esc để huỷ)':'Bấm Đổi rồi nhấn phím bạn muốn dùng.')+'</span><button class="pill sm" id="hpr">Đặt lại tất cả</button>';
 $('#hpl').innerHTML=Object.keys(gs).map(g=>'<div class="grp"><h4>'+g+'</h4><div class="kb">'+gs[g].map(id=>'<span>'+keysOf(id).map(c=>'<kbd>'+esc(pk(c))+'</kbd>').join(' / ')+'</span><span>'+ACT[id].l+'</span><span class="bt">'+(ACT[id].fixed?'':'<button class="pill sm" data-ch="'+id+'">'+(cap==id?'Đang chờ…':'Đổi')+'</button>')+(KB[id]?'<button class="pill sm" data-rs="'+id+'">Mặc định</button>':'')+'</span>').join('')+'</div></div>').join('')+'<div class="grp"><h4>Trang soạn thảo (cố định)</h4><div class="kb">'+DOCK.map(r=>'<span>'+r[0].split(' ').filter(Boolean).map(x=>x==='/'?x:'<kbd>'+x+'</kbd>').join(' ')+'</span><span>'+r[1]+'</span><span></span>').join('')+'</div></div>'}
$('#hp').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.ch){cap=b.dataset.ch;hpRender()}else if(b.dataset.rs){delete KB[b.dataset.rs];sk();hpRender()}else if(b.id=='hpr'){KB={};sk();cap=null;hpRender()}});
function capture(c){if(!c)return;if(c=='Escape'){cap=null;hpRender();return}const m=kmap();if(m[c]&&m[c]!=cap){$('#hpm').textContent='Phím "'+pk(c)+'" đang dùng cho: '+ACT[m[c]].l+'. Hãy chọn phím khác.';return}KB[cap]=[c];sk();cap=null;hpRender()}
addEventListener('keydown',e=>{const c=kc(e);
 if(cap){e.preventDefault();e.stopPropagation();capture(c);return}
 if(hp.classList.contains('on')){if(e.key=='Escape'||keysOf('help').includes(c)){e.preventDefault();hpTog(false)}return}
 if(ov.classList.contains('on')||$('#cfm').classList.contains('on')||$('#tr').classList.contains('on')||$('#ar').classList.contains('on')||$('#dv').classList.contains('on')||$('#dgd').classList.contains('on')||$('#au').classList.contains('on'))return;
 const a=document.activeElement;
 if(a&&(/INPUT|TEXTAREA|SELECT/.test(a.tagName)||a.isContentEditable)){if(e.key=='Escape')a.blur();return}
 if(a&&a.tagName=='BUTTON'&&(c=='Enter'||c=='Space'))return;
 const id=c&&kmap()[c];if(!id)return;if(RO&&['add','sibl','ren','del','undo','link','move','member','draw','dredo','freeN','multi','all','grp'].includes(id))return;if(ACT[id].f(e))e.preventDefault()});
pg.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey,k=e.key,l=k.length==1?k.toLowerCase():k;if(!mod)return;
 const run=(c,v)=>{e.preventDefault();document.execCommand(c,false,v);pg.oninput()};
 if(e.altKey){const m=/^Digit(\d)$/.exec(e.code);if(m&&'123'.includes(m[1]))run('formatBlock','h'+m[1]);else if(m&&m[1]=='0')run('formatBlock','p');return}
 if(e.shiftKey){if(l=='x')run('strikeThrough');else if(l=='l')run('insertUnorderedList');else if(e.code=='Digit7')run('insertOrderedList');return}
 if(k=='Enter'){run('insertHTML','<div class="pbk" contenteditable="false"></div><p><br></p>');return}
 if(l=='e')run('justifyCenter');else if(l=='l')run('justifyLeft');else if(l=='r')run('justifyRight');else if(l=='j')run('justifyFull');else if(k==']')run('indent');else if(k=='[')run('outdent');else if(l=='s'){e.preventDefault();flash('Trang tự động lưu khi bạn gõ')}});
let sb=null;
