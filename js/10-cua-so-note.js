// Cửa sổ note nổi
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
// ===== Cửa sổ note: mở nhiều note cùng lúc, kéo / đổi cỡ / thu nhỏ / phóng to / đóng, thanh tác vụ =====
// Chỉ một cửa sổ đang sửa (trình soạn thảo #sc được chuyển vào cửa sổ đó); các cửa sổ khác hiện bản xem và bấm vào là chuyển sang sửa.
const wsp=$('#wsp'),wpark=$('#wpark'),scEl=$('#sc'),WS=[],WMAX=4;let wAct=null,wZ=10,wUid=0,nlWin=false;
const wtb=document.body.appendChild(Object.assign(document.createElement('div'),{id:'wtb',hidden:true}));
const wTitleOf=w=>(N[w.note]&&N[w.note].t)||'Chưa đặt tên',wById=id=>WS.find(x=>x.id==id),wVis=()=>WS.filter(w=>!w.min);
// bản xem: sao chép các luật CSS của #pg sang .psn để nội dung trông như trong trang
(function(){const out=[],sw=r=>r.cssText.replace(/#pg\b/g,'.psn');for(const sh of document.styleSheets){if(sh.ownerNode===pgSty)continue;let rs;try{rs=sh.cssRules}catch(x){continue}
 for(const r of rs){if(r.type==1&&r.selectorText&&r.selectorText.includes('#pg'))out.push(sw(r));else if(r.type==4&&r.cssText.includes('#pg'))out.push(sw(r))}}
 document.head.appendChild(Object.assign(document.createElement('style'),{textContent:out.join('\n')}))})();
function wSnapRender(w){const n=N[w.note];if(!n)return;const v=plOf(n),W=pgDim(v)[0],m=v.m;
 w.body.innerHTML=`<div class="psp" style="width:${W}px;padding:${m[0]}px ${m[1]}px ${m[2]}px ${m[3]}px"><div class="pttl">${esc(n.t||'')}</div><div class="psn">${clean(n.d||'')}</div></div>`;w.body.classList.add('snap');wSnapZoom(w)}
function wSnapZoom(w){const p=w.body.querySelector('.psp');if(!p||!w.body.classList.contains('snap'))return;const W=parseFloat(p.style.width)||794;p.style.zoom=Math.max(.3,Math.min(1,(w.body.clientWidth-16)/W))}
function wApply(w){const s=w.el.style;s.left=w.x+'px';s.top=w.y+'px';s.width=w.w+'px';s.height=w.h+'px';s.zIndex=w.z;w.el.classList.toggle('max',!!w.max);w.el.classList.toggle('min',!!w.min);if(w.body.classList.contains('snap'))wSnapZoom(w)}
function wClamp(w){const W=wsp.clientWidth,H=wsp.clientHeight;w.w=Math.min(Math.max(320,w.w),Math.max(320,W));w.h=Math.min(Math.max(220,w.h),Math.max(220,H));w.x=Math.max(-w.w+120,Math.min(W-120,w.x));w.y=Math.max(0,Math.min(H-40,w.y))}
function wTile(){const v=wVis(),n=v.length,W=wsp.clientWidth,H=wsp.clientHeight,g=4;if(!n)return;
 const cell=i=>n==1?[0,0,W,H]:n==2?[i*W/2,0,W/2,H]:n==3?(i==0?[0,0,W/2,H]:[W/2,(i-1)*H/2,W/2,H/2]):[(i%2)*W/2,Math.floor(i/2)*H/2,W/2,H/2];
 v.forEach((w,i)=>{const[x,y,ww,hh]=cell(i);w.max=n==1;w.x=Math.round(x+g);w.y=Math.round(y+g);w.w=Math.round(ww-2*g);w.h=Math.round(hh-2*g);wApply(w)})}
function wCreate(id){const el=document.createElement('div');el.className='wn';
 el.innerHTML='<div class="wt"><span class="wti"></span><button class="wmin" title="Thu nhỏ xuống thanh tác vụ" aria-label="Thu nhỏ">─</button><button class="wmax" title="Phóng to / thu về" aria-label="Phóng to">▢</button><button class="wcl" title="Đóng cửa sổ" aria-label="Đóng">✕</button></div><div class="wb"></div><i class="wre" data-d="e"></i><i class="wrb" data-d="s"></i><i class="wrz" data-d="se"></i>';
 const w={id:'w'+(++wUid),note:id,x:0,y:0,w:640,h:480,z:++wZ,max:false,min:false,el,body:el.querySelector('.wb')};
 WS.push(w);wsp.appendChild(el);
 new ResizeObserver(()=>wSnapZoom(w)).observe(w.body);
 el.addEventListener('pointerdown',e=>{if(wAct!=w.id){const x=e.clientX,y=e.clientY,snap=!!e.target.closest('.wb.snap');wOpenWin(w.id);if(snap)wCaret(x,y)}else{w.z=++wZ;el.style.zIndex=w.z}},true);
 el.querySelector('.wmin').onclick=()=>wMin(w);el.querySelector('.wmax').onclick=()=>wToggleMax(w);el.querySelector('.wcl').onclick=()=>wClose(w);
 const wt=el.querySelector('.wt');wt.addEventListener('dblclick',e=>{if(!e.target.closest('button'))wToggleMax(w)});
 wt.addEventListener('pointerdown',e=>{if(e.target.closest('button')||w.max||e.button>0)return;const x0=e.clientX,y0=e.clientY,a=w.x,b=w.y;wt.setPointerCapture(e.pointerId);
  const mv=ev=>{w.x=a+ev.clientX-x0;w.y=b+ev.clientY-y0;wClamp(w);wApply(w)},up=()=>{wt.removeEventListener('pointermove',mv);wt.removeEventListener('pointerup',up);wt.removeEventListener('pointercancel',up)};
  wt.addEventListener('pointermove',mv);wt.addEventListener('pointerup',up);wt.addEventListener('pointercancel',up)});
 el.querySelectorAll('[data-d]').forEach(h=>h.addEventListener('pointerdown',e=>{if(w.max||e.button>0)return;e.preventDefault();e.stopPropagation();const d=h.dataset.d,x0=e.clientX,y0=e.clientY,w0=w.w,h0=w.h;h.setPointerCapture(e.pointerId);
  const mv=ev=>{if(d.includes('e'))w.w=Math.max(320,w0+ev.clientX-x0);if(d.includes('s'))w.h=Math.max(220,h0+ev.clientY-y0);wClamp(w);wApply(w)},up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up)};
  h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)}));
 wTitle(w);return w}
const wTitle=w=>{w.el.querySelector('.wti').textContent=wTitleOf(w)};
// đặt con trỏ tại chỗ vừa bấm (khi chuyển từ bản xem sang sửa)
function wCaret(x,y){requestAnimationFrame(()=>{let r=null;if(document.caretRangeFromPoint)r=document.caretRangeFromPoint(x,y);else if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(x,y);if(p){r=document.createRange();r.setStart(p.offsetNode,p.offset)}}
 pg.focus({preventScroll:true});if(r&&pg.contains(r.startContainer)){const s=getSelection();s.removeAllRanges();s.addRange(r);rg=r}})}
// đưa trình soạn thảo ra khỏi cửa sổ đang giữ nó, thay bằng bản xem
function wSnapFrom(w){const st=scEl.scrollTop;wpark.appendChild(scEl);wSnapRender(w);w.body.scrollTop=st}
function wShow(){const off=!ov.classList.contains('on');if(off){ov.classList.add('on');document.body.classList.add('wsov');wtbPlace();WS.forEach(x=>{if(x.id!=wAct&&!x.min)wSnapRender(x)})}return off}
function wActivate(w,force){const prev=wById(wAct);
 if(prev&&prev!==w&&scEl.parentNode===prev.body)wSnapFrom(prev);
 if(scEl.parentNode!==w.body){const st=w.body.scrollTop;w.body.innerHTML='';w.body.classList.remove('snap');w.body.appendChild(scEl);docLoad(w.note);scEl.scrollTop=st}
 else if(force)docLoad(w.note);
 wAct=w.id;w.z=++wZ;w.el.style.zIndex=w.z;WS.forEach(x=>x.el.classList.toggle('act',x===w));wTitle(w);wBar();wFitZoom()}
function wOpenWin(id){const w=wById(id);if(!w)return;const off=wShow();if(w.min){w.min=false;w.el.classList.remove('min')}wActivate(w,off)}
function openDoc(id,fresh){if(!N[id])return;let w=WS.find(x=>x.note==id);const off=wShow();
 if(!w){const vis=wVis(),tgt=!fresh&&(vis.find(x=>x.id==wAct)||vis[0]||wById(wAct));
  if(tgt){tgt.note=id;if(tgt.min){tgt.min=false;tgt.el.classList.remove('min')}if(scEl.parentNode!==tgt.body)wSnapRender(tgt);w=tgt;wActivate(w,true);return}
  if(WS.length>=WMAX){flash('Tối đa '+WMAX+' cửa sổ. Hãy đóng bớt một cửa sổ.');return}
  const first=!wVis().length;w=wCreate(id);if(first){w.max=true;const W=wsp.clientWidth,H=wsp.clientHeight;w.x=0;w.y=0;w.w=W;w.h=H;wApply(w)}else{wTile()}}
 if(w.min){w.min=false;w.el.classList.remove('min');if(wVis().length>1)wTile()}
 wActivate(w,off)}
function wMin(w){w.min=true;w.el.classList.add('min');
 if(w.id==wAct){const nx=wVis().sort((a,b)=>b.z-a.z)[0];if(nx)wActivate(nx);else wHideWs()}wBar()}
function wToggleMax(w){w.max=!w.max;if(!w.max){w.w=Math.min(w.w,wsp.clientWidth);if(w.w>wsp.clientWidth*.95){w.w=Math.round(wsp.clientWidth*.7);w.h=Math.round(wsp.clientHeight*.8);w.x=Math.round(wsp.clientWidth*.15);w.y=20}}wApply(w);wFitZoom()}
function wClose(w){const was=w.id==wAct;if(scEl.parentNode===w.body)wpark.appendChild(scEl);const i=WS.indexOf(w);WS.splice(i,1);w.el.remove();
 if(was)wAct=null;const v=wVis();
 if(v.length){const nx=v.sort((a,b)=>b.z-a.z)[0];if(v.length==1&&!v[0].max)v[0].max=true,wApply(v[0]);wActivate(nx,true)}else{if(!WS.length)wAct=null;wHideWs()}wBar()}
function wHideWs(){if(pmode)inkTog(false);ov.classList.remove('on');dgd.classList.remove('on');document.body.classList.remove('wsov');wtbPlace();render()}
function wPrune(){[...WS].forEach(w=>{if(!N[w.note])wClose(w)})}
closeDoc=function(){wHideWs()};$('#bk').onclick=wHideWs;
// thanh tác vụ
function wtbPlace(){const inOv=ov.classList.contains('on');if(inOv&&wtb.parentNode!==ov){ov.insertBefore(wtb,$('#sb'))}else if(!inOv&&wtb.parentNode!==document.body)document.body.appendChild(wtb)}
function wBar(){wtb.hidden=!WS.length;if(!WS.length)return;const on=ov.classList.contains('on');
 wtb.innerHTML=WS.map(w=>`<button class="wtbn${w.id==wAct&&on&&!w.min?' on':''}${w.min?' min':''}" data-w="${w.id}" title="${esc(wTitleOf(w))}${w.min?' (đã thu nhỏ)':''}">${esc(wTitleOf(w))}</button>`).join('')+'<button class="wtbn wnew" data-new="1" title="Mở thêm một note trong cửa sổ mới (tối đa '+WMAX+')">＋ Mở note…</button>'}
wtb.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.new){nlOpen();nlWin=true;$('#nlp b').textContent='Mở note trong cửa sổ mới';return}
 const w=wById(b.dataset.w);if(!w)return;const on=ov.classList.contains('on');
 if(on&&!w.min&&w.id==wAct&&wVis().length>1){wMin(w);return}   // bấm nút của cửa sổ đang sửa: thu nhỏ (khi còn cửa sổ khác)
 const wasMin=w.min;wOpenWin(w.id);if(wasMin&&wVis().length>1&&!w.max)wTile()});
// chọn note từ hộp tìm note để mở cửa sổ mới
const _nlOpen=nlOpen;nlOpen=function(a,b){nlWin=false;return _nlOpen(a,b)};
// cỡ chữ / trang tự co lại khi cửa sổ hẹp hơn tờ giấy (chỉ trên màn hình rộng, điện thoại giữ cách cũ)
function wFitZoom(){if(!ov.classList.contains('on'))return;const u=(+$('#zm').value||100)/100;let z=u;if(innerWidth>860){const W=pgDim(PL())[0],av=scEl.clientWidth-24;if(av>0&&av<W*u)z=Math.max(.35,av/W)}$('#zw').style.zoom=z;place()}
$('#zm').onchange=wFitZoom;new ResizeObserver(()=>wFitZoom()).observe(scEl);
pT.addEventListener('input',()=>{const w=wById(wAct);if(w){wTitle(w);wBar()}});
addEventListener('resize',()=>{WS.forEach(w=>{if(!w.max){wClamp(w);wApply(w)}})});
// menu ☰: mở / đóng, bấm ra ngoài hoặc Esc để đóng, bấm một mục thì tự đóng
(function(){const b=$('#mnb'),m=$('#acm'),set=o=>{m.hidden=!o;b.setAttribute('aria-expanded',o)};
 b.addEventListener('click',e=>{e.stopPropagation();set(m.hidden)});
 m.addEventListener('click',e=>{if(e.target.closest('button.pill')&&!e.target.closest('#usr'))set(false)});
 document.addEventListener('pointerdown',e=>{if(!m.hidden&&!e.target.closest('#mnw'))set(false)},true);
 document.addEventListener('keydown',e=>{if(e.key=='Escape'&&!m.hidden){set(false);e.stopImmediatePropagation()}},true)})();

(function(){const mn=$('#pmn'),tg=[['#pmo-t','#pmo'],['#pst-t','#pst']],K='arbor.pnMini';let mini=false,tm=0,last=null;
 try{mini=localStorage.getItem(K)=='1'}catch(e){}
 const hv=()=>matchMedia('(hover:hover)').matches;
 function ap(){pn.classList.toggle('mini',mini);mn.textContent=mini?'▢':'—';mn.title=mini?'Mở rộng bảng':'Thu nhỏ bảng';mn.setAttribute('aria-label',mn.title);if(typeof pplace=='function')pplace()}
 function arm(d){clearTimeout(tm);if(mini||!hv())return;tm=setTimeout(()=>{if(!pn.classList.contains('on')||pn.matches(':hover')||pn.contains(document.activeElement)&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))return;pn.classList.add('auto')},d)}
 const wake=()=>{clearTimeout(tm);if(pn.classList.contains('auto'))pn.classList.remove('auto')};
 mn.onclick=()=>{mini=!mini;try{localStorage.setItem(K,mini?'1':'0')}catch(e){}wake();ap()};
 tg.forEach(([t,b])=>{$(t).onclick=()=>{const o=$(b).hidden;$(b).hidden=!o;$(t).setAttribute('aria-expanded',o);if(typeof pplace=='function')pplace()}});
 pn.addEventListener('pointerenter',wake);pn.addEventListener('focusin',wake);pn.addEventListener('pointerleave',()=>arm(1200));
 pn.addEventListener('pointerdown',()=>{if(pn.classList.contains('auto')){wake()}});
 let wasOn=false;new MutationObserver(()=>{const on=pn.classList.contains('on');if(on==wasOn)return;wasOn=on;if(!on){wake();last=null}}).observe(pn,{attributes:true,attributeFilter:['class']});
 window.pnSync=()=>{if(sel&&N[sel]){$('#pdot').style.setProperty('--c',col(sel));if(sel!==last){last=sel;wake();arm(3500)}}};
 ap()})();

(function(){const q=document.querySelector('.pq');if(!q)return;let t=0;
 const openQ=()=>{q.classList.add('open');clearTimeout(t);t=setTimeout(()=>q.classList.remove('open'),45000)};
 q.addEventListener('pointerover',()=>{if(!q.classList.contains('open'))openQ()});q.addEventListener('focusin',()=>{if(!q.classList.contains('open'))openQ()});
 q.querySelectorAll('.pill').forEach(b=>{if(!b.title)b.title=b.textContent.trim()});
})();

(function(){const K='arbor.spell',b=$('#spb'),els=()=>[$('#pg'),$('#pt'),$('#pb')];let on=true;
 try{on=localStorage.getItem(K)!='0'}catch(e){}
 function ap(){els().forEach(e=>{if(e){e.spellcheck=on;e.setAttribute('spellcheck',on?'true':'false')}});
  b.setAttribute('aria-pressed',on);b.textContent='Chính tả: '+(on?'Bật':'Tắt');b.title='Bật/tắt gạch chân kiểm tra chính tả (đang '+(on?'bật':'tắt')+')'}
 b.addEventListener('mousedown',e=>e.preventDefault());
 b.onclick=()=>{on=!on;try{localStorage.setItem(K,on?'1':'0')}catch(e){}ap();const g=$('#pg');if(document.activeElement===g){g.blur();g.focus({preventScroll:true})}flash('Kiểm tra chính tả: '+(on?'bật':'tắt'))};
 ap()})();
