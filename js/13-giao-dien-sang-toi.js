// Giao diện sáng/tối
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
// ===== Giao diện sáng/tối: Tự động (theo hệ thống) / Sáng / Tối =====
(function(){const K='arbor.theme',M=['auto','light','dark'],NM={auto:'Tự động (theo hệ thống)',light:'Sáng',dark:'Tối'},b=$('#thb'),mq=matchMedia('(prefers-color-scheme: dark)');let m='auto';
 try{const v=localStorage.getItem(K);if(M.includes(v))m=v}catch(e){}
 function ap(){const r=document.documentElement;if(m=='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',m);
  const dk=m=='dark'||(m=='auto'&&mq.matches),t=document.querySelector('meta[name=theme-color]');if(t)t.setAttribute('content',dk?'#13191b':'#eceff0');
  b.textContent='Giao diện: '+NM[m].replace(' (theo hệ thống)','');b.title='Giao diện: '+NM[m]+' — bấm để đổi'}
 b.onclick=()=>{m=M[(M.indexOf(m)+1)%3];try{localStorage.setItem(K,m)}catch(e){}ap();flash('Giao diện: '+NM[m])};
 (mq.addEventListener?mq.addEventListener('change',ap):mq.addListener(ap));ap()})();
