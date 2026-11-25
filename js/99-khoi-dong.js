// Phần còn lại: sự kiện toàn cục và khởi động
// (Nguồn tách file để dễ sửa. Trình duyệt chạy app.js do build.js ghép từ js/*.js theo thứ tự tên — sửa xong chạy: node build.js)
addEventListener('pagehide',()=>{if(API)saveDraft();else if(!RO&&TID){try{localStorage.setItem(lsKey(),JSON.stringify(snapState()))}catch(x){}}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&API&&!RO){saveView();doPush()}});
// Đóng tab khi còn thay đổi chưa lên máy chủ: gửi ngay và để trình duyệt hỏi lại người dùng
addEventListener('beforeunload',e=>{if(unsaved()){saveDraft();clearTimeout(pt2);doPush();e.preventDefault();e.returnValue=''}});
// Chế độ lưu trên máy: tab khác vừa ghi cây này thì tab đang ở nền nạp lại, để hai tab không ghi đè nhau
addEventListener('storage',e=>{if(API||RO||!e.newValue)return;
 if(e.key=='ktree_list'){try{TL=JSON.parse(e.newValue)||TL}catch(x){}updTmb();return}
 if(e.key!=lsKey()||(!document.hidden&&document.hasFocus()))return;
 try{const d=JSON.parse(e.newValue),v=V,o=ov.classList.contains('on')&&sel;loadState(d);V=v;xf();if(o){if(N[o])openDoc(o);else closeDoc()}clearTimeout(st)}catch(x){}});
document.querySelectorAll('#cfm>div,#tr>div,#tm>div,#nlp>div,#dgd>div,#hp>div,#au>div').forEach(e=>{e.setAttribute('role','dialog');e.setAttribute('aria-modal','true')});
cv.addEventListener('mouseleave',()=>tip.style.display='none');
addEventListener('resize',()=>{if(fitLater&&innerWidth>=50&&innerHeight>=50){fitLater=false;fit(1)}});
