// Kiểm thử nhanh cho hai hàm xử lý dữ liệu trong index.html: sanitizeState (làm sạch dữ liệu nạp vào) và merge3 (gộp khi xung đột).
// Chạy: node tests/kiem-thu.js   (cần Node.js; không cần cài thêm gì)
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const a = html.indexOf('const OKB='), b = html.indexOf('// Vị trí khung nhìn');
assert(a > 0 && b > a, 'Không tìm thấy đoạn mã cần kiểm thử trong index.html');
// clean() cần trình duyệt, nên ở đây thay bằng bản giả chỉ đánh dấu là đã đi qua
const app = new Function('clean', 'let N={},SNAP={n:{},t:{}},LK=[],T=[],DW=[],uid=1,L=3;' + html.slice(a, b) +
  ';return{sanitizeState,merge3,set(s){N=s.N;LK=s.LK;T=s.T;DW=s.DW||[];uid=s.uid;L=s.lv||3},snap(s){SNAP={n:{},t:{LK:JSON.stringify(s.LK),DW:JSON.stringify(s.DW||[]),T:JSON.stringify(s.T),lv:JSON.stringify(s.lv)}};for(const i in s.N)SNAP.n[i]=JSON.stringify(s.N[i])}}')(h => '[sạch]' + h);
const clone = x => JSON.parse(JSON.stringify(x));
let n = 0;
const test = (name, fn) => { fn(); n++; console.log('ok  ' + name); };

const note = (id, p, c, extra) => Object.assign({ id, t: id, b: '', p, c, x: 0, y: 0, col: 0, fold: 0, cr: 1, md: 1 }, extra);
const tree = () => app.sanitizeState({ N: { r: note('r', null, ['a', 'b']), a: note('a', 'r', ['a1']), a1: note('a1', 'a', []), b: note('b', 'r', []) }, LK: [], T: [], uid: 10, lv: 3, rad: 1 });

test('sanitizeState: bỏ khoá note lạ và ép kiểu', () => {
  const s = app.sanitizeState({ N: { r: note('r', null, ['a', 'x"><img onerror=1>']), a: note('a', 'r', [], { x: '12', y: '0;url(x)', sz: '64px"', cc: 'red" onclick="1', d: '<b>x</b>' }), 'x"><img onerror=1>': note('q', 'r', []) }, uid: 'abc' });
  assert.deepStrictEqual(Object.keys(s.N), ['r', 'a']);
  assert.strictEqual(s.N.a.x, 12); assert.strictEqual(s.N.a.y, 0);
  assert(!('sz' in s.N.a) && !('cc' in s.N.a));
  assert.strictEqual(s.N.a.d, '[sạch]<b>x</b>');
  assert(s.uid > 0);
});
test('sanitizeState: bỏ liên kết và mục thùng rác có id lạ, bỏ note không nối về gốc', () => {
  const s = app.sanitizeState({ N: { r: note('r', null, []), o: note('o', 'khong-co', []) }, LK: [{ id: 'l1"x', a: 'r', b: 'r' }, { id: 'l2', a: 'r', b: 'r' }], T: [{ tid: 't"1', id: 'k', nodes: { k: note('k', 'r', []) } }, { tid: 't2', id: 'k', nodes: { k: note('k', 'r', []) } }] });
  assert.deepStrictEqual(Object.keys(s.N), ['r']);
  assert.deepStrictEqual(s.LK.map(l => l.id), ['l2']);
  assert.deepStrictEqual(s.T.map(e => e.tid), ['t2']);
});
test('sanitizeState: báo lỗi khi không có note gốc', () => {
  assert.throws(() => app.sanitizeState({ N: { a: note('a', 'b', []) } }));
  assert.throws(() => app.sanitizeState(null));
});

test('merge3: hai bên sửa hai note khác nhau và cùng thêm note con', () => {
  const base = tree(), mine = clone(base), theirs = clone(base);
  mine.N.a.t = 'mình'; mine.N.m1 = note('m1', 'r', []); mine.N.r.c.push('m1');
  theirs.N.b.t = 'họ'; theirs.N.t1 = note('t1', 'r', []); theirs.N.r.c.push('t1'); theirs.uid = 50;
  app.snap(base); app.set(mine);
  const m = app.merge3(theirs);
  assert(m, 'phải gộp được');
  assert.strictEqual(m.N.a.t, 'mình'); assert.strictEqual(m.N.b.t, 'họ');
  assert(m.N.r.c.includes('m1') && m.N.r.c.includes('t1'));
  assert.strictEqual(m.uid, 50);
});
test('merge3: cùng sửa một trường của một note thì không tự gộp', () => {
  const base = tree(), mine = clone(base), theirs = clone(base);
  mine.N.a.t = 'mình'; theirs.N.a.t = 'họ';
  app.snap(base); app.set(mine);
  assert.strictEqual(app.merge3(theirs), null);
});
test('merge3: cùng kéo một note thì lấy vị trí của mình', () => {
  const base = tree(), mine = clone(base), theirs = clone(base);
  mine.N.a.x = 100; theirs.N.a.x = 200; theirs.N.a.t = 'họ đổi tên';
  app.snap(base); app.set(mine);
  const m = app.merge3(theirs);
  assert.strictEqual(m.N.a.x, 100); assert.strictEqual(m.N.a.t, 'họ đổi tên');
});
test('merge3: mình xoá note mà họ vừa sửa thì không tự gộp', () => {
  const base = tree(), mine = clone(base), theirs = clone(base);
  delete mine.N.b; mine.N.r.c = ['a']; theirs.N.b.t = 'họ sửa';
  app.snap(base); app.set(mine);
  assert.strictEqual(app.merge3(theirs), null);
});
test('merge3: họ xoá một nhánh, mình sửa nhánh khác', () => {
  const base = tree(), mine = clone(base), theirs = clone(base);
  mine.N.b.b = 'tóm tắt mới'; delete theirs.N.a; delete theirs.N.a1; theirs.N.r.c = ['b'];
  app.snap(base); app.set(mine);
  const m = app.merge3(theirs);
  assert.deepStrictEqual(Object.keys(m.N).sort(), ['b', 'r']); assert.strictEqual(m.N.b.b, 'tóm tắt mới');
});
test('merge3: họ chuyển note vào nhánh mình vừa xoá thì không tự gộp', () => {
  const base = tree(), mine = clone(base), theirs = clone(base);
  delete mine.N.a; delete mine.N.a1; mine.N.r.c = ['b'];
  theirs.N.b.p = 'a1'; theirs.N.a1.c = ['b']; theirs.N.r.c = ['a'];
  app.snap(base); app.set(mine);
  assert.strictEqual(app.merge3(theirs), null);
});
test('merge3: liên kết ngang và thùng rác gộp theo id', () => {
  const base = tree(); base.LK = [{ id: 'l1', a: 'a', b: 'b', t: '' }];
  const mine = clone(base), theirs = clone(base);
  mine.LK = [{ id: 'l2', a: 'a1', b: 'b', t: 'mình' }];                       // mình xoá l1, thêm l2
  theirs.LK.push({ id: 'l3', a: 'r', b: 'b', t: 'họ' });                       // họ thêm l3
  theirs.T = [{ tid: 't9', at: 1, id: 'z', idx: 0, par: 'r', nodes: { z: note('z', 'r', []) }, lk: [] }];
  app.snap(base); app.set(mine);
  const m = app.merge3(theirs);
  assert.deepStrictEqual(m.LK.map(l => l.id).sort(), ['l2', 'l3']);
  assert.deepStrictEqual(m.T.map(e => e.tid), ['t9']);
});
test('sanitizeState: giữ dấu "thuộc thêm nhánh" (k = p) của liên kết, bỏ giá trị k lạ', () => {
  const s = app.sanitizeState({ N: { r: note('r', null, ['a', 'b']), a: note('a', 'r', []), b: note('b', 'r', []) }, LK: [{ id: 'l1', a: 'a', b: 'b', t: '', k: 'p' }, { id: 'l2', a: 'r', b: 'b', t: 'x', k: '"><script>' }] });
  assert.deepStrictEqual(s.LK, [{ id: 'l1', a: 'a', b: 'b', t: '', k: 'p' }, { id: 'l2', a: 'r', b: 'b', t: 'x' }]);
});
console.log('\nĐạt ' + n + ' kiểm thử.');
