// Liên kết, note độc lập, nét vẽ tay, cử chỉ chạm
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
function put(c){const d=()=>c.toDataURL('image/jpeg',.82);if(!API)return Promise.resolve({src:d()});
 return new Promise(r=>c.toBlob(async b=>{try{const p=API.id+'/'+crypto.randomUUID()+'.jpg',u=await sb.storage.from('note-images').upload(p,b,{contentType:'image/jpeg'});if(u.error)throw u.error;
  const g=await sb.storage.from('note-images').createSignedUrl(p,86400);if(g.error)throw g.error;r({src:g.data.signedUrl,p})}catch(x){r({src:d()})}},'image/jpeg',.82))}
async function refreshImgs(){if(!API)return;const im=[...pg.querySelectorAll('img[data-sb]')];if(!im.length)return;
 const r=await sb.storage.from('note-images').createSignedUrls(im.map(i=>i.dataset.sb),86400);
 if(r.data)r.data.forEach((x,i)=>{if(x.signedUrl)im[i].src=x.signedUrl})}   // chỉ đổi trên màn hình; không ghi đường dẫn mới vào note để khỏi tạo một lần lưu
async function inl(h){const m=[...new Set(h.match(/https:[^"'\s]+\/storage\/v1\/object\/sign\/[^"'\s]+/g)||[])];for(const u of m){try{const b=await(await fetch(u)).blob(),d=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});h=h.split(u).join(d)}catch(x){}}return h}
document.addEventListener('DOMContentLoaded',boot);   // thẻ supabase-js dùng defer nên đã nạp xong trước sự kiện này
function lkd(l){const a=ctr(N[l.a]),b=ctr(N[l.b]),mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],k=.18;return{d:`M${a[0]} ${a[1]}Q${mx-dy*k} ${my+dx*k} ${b[0]} ${b[1]}`,x:mx-dy*k/2,y:my+dx*k/2}}
function lkHtml(v){const S=new Set(v);return LK.filter(l=>S.has(l.a)&&S.has(l.b)).map(l=>{const q=lkd(l);return l.k=='p'?`<path class="lk lkp" data-lk="${esc(l.id)}" d="${q.d}" style="stroke:${col(l.b)}"/>`:`<path class="lk" data-lk="${esc(l.id)}" d="${q.d}"/><text class="lkt" data-lkt="${esc(l.id)}" x="${q.x}" y="${q.y}" text-anchor="middle">${esc(l.t||'')}</text>`}).join('')}
function lkBar(){const b=$('#lkn');b.style.display=lkFrom?'flex':'none';if(lkFrom)$('#lkt').textContent='Bấm vào note cần nối với “'+(N[lkFrom].t||'note')+'”'}
function addLink(a,b){lkFrom=null;lkBar();if(a==b||LK.some(l=>(l.a==a&&l.b==b)||(l.a==b&&l.b==a))){flash('Hai note này đã được nối với nhau');render();return}
 LK.push({id:'l'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),a,b,t:''});render();flash('Đã nối "'+(N[a].t||'note')+'" với "'+(N[b].t||'note')+'". Gõ nhãn cho liên kết ở khung bên cạnh.')}
$('#lkb').onclick=()=>{if(sel){lkFrom=sel;lkBar()}};$('#mvb').onclick=()=>{if(sel&&N[sel]&&N[sel].p)nlOpen(sel)};$('#mab').onclick=()=>{if(sel&&N[sel]&&N[sel].p)nlOpen(sel,1)};$('#lkx').onclick=()=>{lkFrom=null;lkBar()};
$('#lks').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.go)navTo(b.dataset.go);else if(b.dataset.ul){LK=LK.filter(l=>l.id!=b.dataset.ul);render()}};
$('#lks').oninput=e=>{const id=e.target.dataset.lt,l=id&&LK.find(x=>x.id==id);if(!l)return;l.t=e.target.value;const tx=es.querySelector('[data-lkt="'+id+'"]');if(tx)tx.textContent=l.t;save()};
function newFree(x,y){const r=root(),SB=lmode?Math.min(300,innerWidth*.86):0;if(x===undefined){x=SB+(innerWidth-SB)/2;y=innerHeight/2}
 const id=mk('','',r,N[r].c.length);N[id].free=1;N[id].x=(x-V.x)/V.k-32;N[id].y=(y-V.y)/V.k-32;sel=id;slide(()=>spread(new Set([id])));const t=$('#pt');t.focus();t.select()}
$('#nf').onclick=()=>newFree();
// Vẽ tay theo kiểu ứng dụng ghi chú viết tay, dùng chung cho hai nơi: sơ đồ (DW) và trang của từng note (N[id].dw).
// Mỗi nét là {id, c: màu, w: độ dày, p: "x,y x,y …", h: 1 nếu là bút dạ quang}, toạ độ theo sơ đồ hoặc theo trang.
// (Các hàm dùng khi vẽ lại được khai báo bằng function vì render() ở phần khởi động phía trên đã cần tới chúng.)
function wpt(e){return[(e.clientX-V.x)/V.k,(e.clientY-V.y)/V.k]}function r1(v){return Math.round(v*10)/10}
function ppt(e){const r=pg.getBoundingClientRect(),k=zk();return[(e.clientX-r.left)/k,(e.clientY-r.top)/k]}      // toạ độ tính từ góc vùng soạn thảo, để nét bám theo chữ khi lề trang đổi theo cỡ màn hình
function inkPos(){const l=pg.offsetLeft+'px',t=pg.offsetTop+'px';[$('#pdr'),$('#pdu')].forEach(e=>{e.style.left=l;e.style.top=t})}
function spts(s){return s.p.split(' ').map(q=>q.split(',').map(Number))}
// Đường cong mượt đi qua trung điểm giữa các điểm lấy mẫu, thay cho đường gấp khúc
function pathD(a){if(a.length<3)return'M'+a.map(p=>r1(p[0])+','+r1(p[1])).join('L');let d='M'+r1(a[0][0])+','+r1(a[0][1]);
 for(let i=1;i<a.length-1;i++)d+='Q'+r1(a[i][0])+','+r1(a[i][1])+' '+r1((a[i][0]+a[i+1][0])/2)+','+r1((a[i][1]+a[i+1][1])/2);
 const z=a[a.length-1];return d+'L'+r1(z[0])+','+r1(z[1])}
function inkHtml(a){return a.map(s=>`<path data-s="${esc(s.id)}" d="${pathD(spts(s))}" stroke-linejoin="round" style="stroke:${s.c};stroke-width:${s.w}${s.h?';opacity:.35;stroke-linecap:butt':''}"/>`).join('')}
function drawRender(){drRef=DW;drN=DW.length;$('#dr').innerHTML=inkHtml(DW)}
const DCOL=['#d9534f','#2f7fc1','#1f8a7a','#e08e0b','#8e44ad','#667b81'],E0=[];
// Hai nơi vẽ: get/set mảng nét, khung svg, đổi toạ độ con trỏ, tỉ lệ thu phóng, và việc cần làm sau mỗi thay đổi
const CVX={get:()=>DW,set:a=>{DW=a;drRef=a;drN=a.length},svg:()=>$('#dr'),draw:()=>{$('#dr').innerHTML=inkHtml(DW)},pt:wpt,k:()=>V.k,done:()=>save()};
const PGX={get:()=>N[sel]&&N[sel].dw||E0,set:a=>{if(a.length)N[sel].dw=a;else delete N[sel].dw;N[sel].md=Date.now()},svg:()=>$(dund?'#pdu':'#pdr'),draw:()=>{const a=PGX.get();inkPos();$('#pdr').innerHTML=inkHtml(a.filter(s=>!s.u));$('#pdu').innerHTML=inkHtml(a.filter(s=>s.u))},pt:ppt,k:()=>zk(),done:()=>{meta();save()}};
let dund=false,ink=CVX,pmode=false,dcol=DCOL[0],dtool='pen',dU=[],dR=[],dOwn=null,dTip=false;
function inkDraw(x){x.draw()}
function drawUI(){const cur=ink.get();$('#dwc').innerHTML=DCOL.map(c=>`<button class="sw${c==dcol&&dtool!='era'?' on':''}" data-c="${c}" style="background:${c}" aria-label="Màu ${c}"></button>`).join('');
 [['dwp','pen'],['dwh','hi'],['dwe','era']].forEach(x=>$('#'+x[0]).classList.toggle('on',dtool==x[1]));$('#dwl').classList.toggle('on',dund);$('#dwu').disabled=cur!==dOwn||!dU.length;$('#dwr').disabled=cur!==dOwn||!dR.length;$('#dwa').disabled=!cur.length}
// Mọi thay đổi nét vẽ đi qua đây để hoàn tác / làm lại được. Nếu nét vẽ vừa bị thay từ bên ngoài (nạp cây, gộp từ thiết bị khác) thì bỏ lịch sử cũ.
function dPut(a){ink.set(a);dOwn=ink.get();inkDraw(ink);drawUI();ink.done()}
function dSet(next){const cur=ink.get();if(cur!==dOwn){dU=[];dR=[]}dU.push(cur);if(dU.length>50)dU.shift();dR=[];dPut(next)}
function dUndo(){const cur=ink.get();if(cur!==dOwn||!dU.length)return;dR.push(cur);dPut(dU.pop())}
function dRedo(){const cur=ink.get();if(cur!==dOwn||!dR.length)return;dU.push(cur);dPut(dR.pop())}
function inkBar(on){dw=null;dU=[];dR=[];dOwn=null;$('#dwb').style.display=on?'flex':'none';$('#dwl').style.display=pmode?'':'none';if(!on)return;drawUI();
 if(!dTip&&navigator.maxTouchPoints>0){dTip=true;flash('Một ngón để vẽ, hai ngón để di chuyển. Nếu dùng bút cảm ứng: bút để vẽ, ngón tay để di chuyển.',7000)}}
function drawTog(on){if(RO)return;dmode=on===undefined?!dmode:on;ink=CVX;document.body.classList.toggle('dm',dmode);$('#drw').classList.toggle('on',dmode);inkBar(dmode);
 if(dmode){if(msOn)$('#msx').click();lkFrom=null;lkBar();sel=null;tip.style.display='none';render()}}
// Bật / tắt vẽ tay trong trang soạn thảo của note đang mở
function inkTog(on){if(RO)return;pmode=on===undefined?!pmode:on;ink=pmode?PGX:CVX;pa.classList.toggle('ink',pmode);const b=$('#tb [data-c="ink"]');if(b)b.classList.toggle('on',pmode);inkBar(pmode);
 if(pmode){selObj=null;place();getSelection().removeAllRanges();pg.blur()}}
function erase(e){const[x,y]=ink.pt(e),r=10/ink.k(),cur=ink.get();
 const keep=cur.filter(s=>{const a=spts(s),R=r+s.w/2;      // xoá nét nào có đoạn nằm trong tầm cục tẩy
  for(let i=0;i<a.length;i++){const p=a[i],q=a[i+1]||p,dx=q[0]-p[0],dy=q[1]-p[1],l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-p[0])*dx+(y-p[1])*dy)/l)):0;if(Math.hypot(x-p[0]-t*dx,y-p[1]-t*dy)<=R)return false}return true});
 if(keep.length==cur.length)return;
 if(dw.hit)dPut(keep);else{dw.hit=1;dSet(keep)}}      // cả một lần rê tẩy tính là một bước hoàn tác
const penW=()=>+$('#dww').value*(dtool=='hi'?4:1);
function drawStart(e){if(e.button>0)return;if(dtool=='era'){dw={era:1,pid:e.pointerId};erase(e);return}
 dw={pid:e.pointerId,pts:[ink.pt(e)],sx:e.clientX,sy:e.clientY,hi:dtool=='hi',ps:0,pn:0,pen:e.pointerType=='pen',el:document.createElementNS('http://www.w3.org/2000/svg','path')};
 dw.el.setAttribute('stroke-linejoin','round');dw.el.style.stroke=dcol;dw.el.style.strokeWidth=penW();if(dw.hi){dw.el.style.opacity=.35;dw.el.style.strokeLinecap='butt'}ink.svg().appendChild(dw.el);dw.el.setAttribute('d',pathD(dw.pts))}
function drawMove(e){if(dw.era){erase(e);return}if(dw.pen&&e.pressure>0){dw.ps+=e.pressure;dw.pn++}
 if(dw.pts.length>4000||Math.hypot(e.clientX-dw.sx,e.clientY-dw.sy)<2)return;dw.sx=e.clientX;dw.sy=e.clientY;dw.pts.push(ink.pt(e));dw.el.setAttribute('d',pathD(dw.pts))}
function drawEnd(){const d=dw,cur=ink.get();dw=null;if(!d||d.era)return;if(d.pts.length==1)d.pts.push([d.pts[0][0]+.1,d.pts[0][1]]);      // chạm một cái: thành một chấm
 if(cur.length>=3000){inkDraw(ink);flash('Đã đủ 3000 nét vẽ. Hãy xoá bớt nét cũ trước khi vẽ thêm.',5000);return}
 const w=r1(penW()*(d.pen&&d.pn&&!d.hi?.5+d.ps/d.pn:1));      // bút cảm ứng: ấn mạnh thì nét dày hơn
 dSet(cur.concat(Object.assign({id:'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),c:dcol,w,p:d.pts.map(p=>r1(p[0])+','+r1(p[1])).join(' ')},d.hi?{h:1}:{},pmode&&dund?{u:1}:{})))}
// Cảm ứng nhiều ngón: hai ngón để di chuyển (trên sơ đồ còn thu phóng), cả khi đang vẽ. Khi đã thấy bút cảm ứng thì lúc vẽ, ngón tay chỉ dùng để di chuyển.
const tp=new Map();let gz=null,penSeen=false;
function gzStart(pg){const a=[...tp.values()],sc=$('#sc');gz={pg:!!pg,st:sc.scrollTop,sl:sc.scrollLeft,v:{x:V.x,y:V.y,k:V.k},c:[a.reduce((t,p)=>t+p[0],0)/a.length,a.reduce((t,p)=>t+p[1],0)/a.length],d:a.length>1?Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]):0}}
function gzMove(){const a=[...tp.values()],c=[a.reduce((t,p)=>t+p[0],0)/a.length,a.reduce((t,p)=>t+p[1],0)/a.length];
 if(gz.pg){const sc=$('#sc');sc.scrollTop=gz.st-(c[1]-gz.c[1]);sc.scrollLeft=gz.sl-(c[0]-gz.c[0]);return}      // trong trang: cuộn trang
 const k=a.length>1&&gz.d>0?Math.min(2.5,Math.max(.15,gz.v.k*Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])/gz.d)):gz.v.k;
 V.k=k;V.x=c[0]-(gz.c[0]-gz.v.x)*k/gz.v.k;V.y=c[1]-(gz.c[1]-gz.v.y)*k/gz.v.k;xf()}
function tpDown(e){if(e.pointerType=='pen')penSeen=true;if(e.pointerType!='touch')return false;tp.set(e.pointerId,[e.clientX,e.clientY]);
 if(tp.size<2&&!gz&&!(dmode&&penSeen))return false;
 if(dw){if(dw.el)dw.el.remove();dw=null}      // ngón thứ hai chạm xuống: bỏ nét đang vẽ dở
 if(drag){if(drag.id&&drag.m){drag.ids.forEach((i,j)=>{if(N[i]){N[i].x=drag.o[j][0];N[i].y=drag.o[j][1]}});repos()}drag=null;cv.classList.remove('pan');$('#rb').style.display='none'}
 gzStart();return true}
function tpUp(e){if(!tp.has(e.pointerId))return false;tp.delete(e.pointerId);if(!gz)return false;if(tp.size)gzStart(gz.pg);else{const pg=gz.pg;gz=null;if(!pg)save()}return true}
// Vẽ tay trong trang: bắt con trỏ trên trang giấy khi đang bật "Vẽ tay"
pa.addEventListener('pointerdown',e=>{if(!pmode||e.target.closest('#sbr,#rh'))return;e.preventDefault();if(e.pointerType=='pen')penSeen=true;
 if(e.pointerType=='touch'){tp.set(e.pointerId,[e.clientX,e.clientY]);if(tp.size>1||gz||penSeen){if(dw){if(dw.el)dw.el.remove();dw=null}gzStart(true);return}}
 if(!dw)drawStart(e)});
$('#drw').onclick=()=>drawTog();$('#dwx').onclick=()=>{pmode?inkTog(false):drawTog(false)};
$('#dwc').onclick=e=>{const b=e.target.closest('button');if(b){dcol=b.dataset.c;if(dtool=='era')dtool='pen';drawUI()}};
$('#dwp').onclick=()=>{dtool='pen';drawUI()};$('#dwh').onclick=()=>{dtool='hi';drawUI()};$('#dwe').onclick=()=>{dtool='era';drawUI()};
$('#dwu').onclick=dUndo;$('#dwr').onclick=dRedo;$('#dwl').onclick=()=>{dund=!dund;drawUI()};
$('#dwa').onclick=()=>{const n=ink.get().length;if(n)askDel('Xoá hết '+n+' nét vẽ '+(pmode?'trên trang này':'trên sơ đồ này')+'?',()=>dSet([]))};
$('#dtc').onclick=()=>{const n=N[sel];if(!n||!n.p||n.free)return;let t=n;while(t.p&&N[t.p].p)t=N[t.p];const r=root(),id=sel;
 slide(()=>{const o=N[n.p];o.c=o.c.filter(c=>c!=id);n.col=t==n?(n.col||0):(t.col||0);n.p=r;n.free=1;N[r].c.push(id);samePar(id);spread(new Set(desc(id)))});flash('Đã tách "'+(n.t||'note')+'" thành note độc lập')};
$('#shp').onchange=e=>{if(N[sel]){N[sel].sh=e.target.value;render()}};
const srt=a=>{const m=$('#lsr').value;if(!m)return a;return a.slice().sort((x,y)=>m=='n'?(N[x].t||'').localeCompare(N[y].t||'','vi'):m=='m'?N[y].md-N[x].md:N[y].cr-N[x].cr)};
$('#lsr').onchange=()=>listRender();
pg.addEventListener('paste',e=>{const f=[...((e.clipboardData&&e.clipboardData.files)||[])].find(x=>/^image\//.test(x.type));if(f){e.preventDefault();$('#fi').onchange({target:{files:[f],value:''}})}});
pg.addEventListener('dragover',e=>{if(e.dataTransfer&&[...(e.dataTransfer.types||[])].includes('Files'))e.preventDefault()});
pg.addEventListener('drop',e=>{const f=[...((e.dataTransfer&&e.dataTransfer.files)||[])].find(x=>/^image\//.test(x.type));if(!f)return;e.preventDefault();
 const r=document.caretRangeFromPoint&&document.caretRangeFromPoint(e.clientX,e.clientY);if(r){const s=getSelection();s.removeAllRanges();s.addRange(r);rg=r}$('#fi').onchange({target:{files:[f],value:''}})});
T=T.filter(e=>e.ar||Date.now()-e.at<2592e6);trashLbl();
function sz(n){return n.sz||(n.p?64:84)}
$('#szs').onchange=e=>{const n=N[sel];if(!n)return;slide(()=>{const v=+e.target.value;if(v)n.sz=v;else delete n.sz;spread(new Set([sel]))})};
// Hộp chọn note dùng cho hai việc: chèn liên kết tới note (mv rỗng) và chọn note cha mới khi chuyển nhánh (mv = id note cần chuyển)
let nlMv=null,nlAdd=false;      // nlAdd: thêm note vào một nhánh nữa (giữ nhánh cũ) thay vì chuyển hẳn
function addMember(np,id){if(RO||!N[id]||!N[id].p||!N[np]||np==id||N[id].p==np||desc(id).includes(np)||extraPar(id).includes(np))return;
 LK.push({id:'l'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),a:np,b:id,t:'',k:'p'});
 slide(()=>{const anc=[];let a=N[np].p;while(a){anc.unshift(a);a=N[a].p}anc.filter(x=>hid(x)).forEach(x=>{opn(x);placeSub(x)})});      // mở các nhánh che note cha mới để thấy đường nối
 lex.add(np);render();flash('Đã thêm "'+(N[id].t||'note')+'" vào nhánh "'+(N[np].t||'note')+'". Note này giờ thuộc '+(extraPar(id).length+1)+' nhánh.',5000)}
function nlOpen(mv,add){nlMv=mv||null;nlAdd=!!(mv&&add);$('#nlp b').textContent=nlMv?(nlAdd?'Thêm “'+(N[nlMv].t||'note')+'” vào nhánh của note…':'Chuyển “'+(N[nlMv].t||'note')+'” vào dưới note…'):'Liên kết tới note';$('#nlq').value='';nlList();$('#nlp').classList.add('on');$('#nlq').focus()}
// Chuyển note (cùng các note con) vào dưới note np, kể cả khi np đang nằm trong nhánh thu gọn
function moveTo(id,np){if(RO||!N[id]||!N[id].p||!N[np]||N[id].p==np||desc(id).includes(np))return;
 slide(()=>{const anc=[];let a=N[np].p;while(a){anc.unshift(a);a=N[a].p}anc.filter(x=>hid(x)).forEach(x=>{opn(x);placeSub(x)});if(hid(np))placeSub(np);opn(np);
  const o=N[N[id].p];o.c=o.c.filter(c=>c!=id);N[np].c.push(id);N[id].p=np;delete N[id].free;samePar(id);
  const ids=desc(id),P=N[np],pp=outPos(P,P.c.length-1),dx=pp.x-N[id].x,dy=pp.y-N[id].y;ids.forEach(i=>{N[i].x+=dx;N[i].y+=dy});spread(new Set(ids))});
 sel=id;lex.add(np);render();focusNode(id);flash('Đã chuyển "'+(N[id].t||'note')+'" sang nhánh "'+(N[np].t||'note')+'"')}
function nlList(){const q=$('#nlq').value.trim().toLowerCase(),no=nlMv&&N[nlMv]?new Set(desc(nlMv).concat(N[nlMv].p,nlAdd?extraPar(nlMv):[])):new Set([sel]);$('#nll').innerHTML=Object.keys(N).filter(i=>!no.has(i)&&(!q||(N[i].t||'').toLowerCase().includes(q))).slice(0,60).map(i=>`<button class="pill sm" data-id="${esc(i)}">${esc(N[i].t||'Chưa đặt tên')}</button>`).join('')||'<p class="mu">Không có note nào.</p>'}
$('#nlq').oninput=nlList;$('#nlx').onclick=()=>$('#nlp').classList.remove('on');
$('#nll').onclick=e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.id;$('#nlp').classList.remove('on');if(nlWin){nlWin=false;openDoc(id,true);return}if(nlMv){const s=nlMv;nlMv=null;nlAdd?addMember(id,s):moveTo(s,id);return}back();const txt=getSelection().toString()||N[id].t||'note';
 document.execCommand('insertHTML',false,'<a class="nl" data-note="'+id+'" href="#">'+esc(txt)+'</a>&nbsp;');
 if(!LK.some(l=>(l.a==sel&&l.b==id)||(l.a==id&&l.b==sel)))LK.push({id:'l'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),a:sel,b:id,t:''});pg.oninput()};
pg.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a.nl');if(!a)return;e.preventDefault();const id=a.dataset.note;if(N[id]){openDoc(id,e.shiftKey||e.ctrlKey||e.metaKey)}else flash('Note này đã bị xoá')});
