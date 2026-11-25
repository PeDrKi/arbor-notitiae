// Ghép các file trong js/ (theo thứ tự tên) thành một file app.js duy nhất.
// Vì sao ghép: toàn bộ code dùng chung phạm vi toàn cục và nhiều đoạn gọi hàm khai báo ở file sau (hàm được "kéo lên đầu" trong MỘT script).
// Tách thành nhiều <script> riêng sẽ làm hỏng thứ tự đó, nên mã nguồn tách file để dễ đọc/sửa còn trình duyệt chạy app.js.
// Dùng:  node build.js        (tạo/ghi đè app.js)      node build.js --check   (báo lỗi nếu app.js chưa khớp js/)
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'js'), out = path.join(__dirname, 'app.js');
const build = () => '// TỆP TỰ ĐỘNG TẠO bởi build.js từ các file trong js/ — hãy sửa file trong js/ rồi chạy: node build.js\n' +
  fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => '\n// ======== js/' + f + ' ========\n' + fs.readFileSync(path.join(dir, f), 'utf8')).join('');
if (require.main === module) {
  const code = build();
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== code) { console.error('app.js chưa khớp js/. Chạy: node build.js'); process.exit(1) }
    console.log('app.js khớp js/');
  } else { fs.writeFileSync(out, code); console.log('Đã tạo app.js (' + code.length + ' ký tự)') }
}
module.exports = { build };
