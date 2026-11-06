# Arbor Notitiae (Cây tri thức) — lưu dữ liệu trên Supabase

Không cần máy chủ riêng. `index.html` là một trang tĩnh nói chuyện trực tiếp với Supabase:
- Tài khoản: Supabase Auth (email + mật khẩu, có quên mật khẩu)
- Cơ sở dữ liệu: bảng `trees` (Postgres), mỗi cây một dòng (mỗi người có thể có nhiều cây), bảo vệ bằng Row Level Security
- Lưu trữ: bucket riêng tư `note-images`, mỗi người một thư mục

## Cài đặt (khoảng 10 phút)
1. Tạo dự án tại supabase.com.
2. Vào SQL Editor, dán toàn bộ `supabase.sql`, bấm Run.
3. Authentication > Providers: bảo đảm Email đang bật.
   - Muốn dùng thử nhanh: Authentication > Sign In / Providers > Email > tắt "Confirm email".
   - Khi chạy thật nên để bật xác nhận email.
4. Authentication > URL Configuration: đặt Site URL và thêm vào Redirect URLs địa chỉ trang web của bạn
   (cần cho email xác nhận và email đặt lại mật khẩu). Có thể thêm cả http://localhost:8000 để thử.
5. Project Settings > API: chép "Project URL" và khoá "anon public".
6. Mở `index.html`, tìm dòng `window.KT={url:"...",key:"..."}` ở đầu file và dán hai giá trị đó vào.
7. Đưa `index.html` lên bất kỳ hosting tĩnh nào (Netlify, GitHub Pages, Cloudflare Pages...)
   hoặc thử ở máy: `python3 -m http.server 8000` rồi mở http://localhost:8000.

## Đăng nhập bằng Google / Gmail
Trang có nút "Tiếp tục với Google". Để bật nó:
1. Google Cloud Console (console.cloud.google.com) > tạo dự án > APIs & Services > OAuth consent screen
   (loại External, điền tên ứng dụng và email hỗ trợ).
2. Credentials > Create Credentials > OAuth client ID > loại "Web application".
   Mục "Authorized redirect URIs": dán `https://<mã-dự-án>.supabase.co/auth/v1/callback`
   (Supabase hiện đúng địa chỉ này trong Authentication > Providers > Google).
3. Chép Client ID và Client Secret, dán vào Supabase: Authentication > Providers > Google > bật và Save.
4. Bảo đảm địa chỉ trang web của bạn nằm trong Authentication > URL Configuration (Site URL và Redirect URLs).
Lưu ý: khi consent screen còn ở chế độ "Testing", chỉ các Gmail bạn thêm vào danh sách Test users mới đăng nhập được;
muốn mọi người dùng thì bấm Publish app.
Bạn cũng có thể đăng ký bằng email và mật khẩu với địa chỉ Gmail như bình thường (cần xác nhận email nếu bạn để bật).

## Bảo mật
- Khoá `anon` được phép nằm trong trang web; dữ liệu được bảo vệ bởi các chính sách RLS trong `supabase.sql`.
- Tuyệt đối KHÔNG đặt khoá `service_role` vào `index.html`.
- Ảnh nằm trong bucket riêng tư và được tải bằng đường dẫn có chữ ký, hết hạn sau 1 ngày (tự làm mới khi mở trang note).
- Nội dung trang note được lọc bằng DOMPurify cùng một lớp lọc riêng trước khi hiển thị.
- Trang có Content-Security-Policy (thẻ `<meta>` ở đầu `index.html`) và các thư viện CDN đều có mã `integrity`.
  Nếu Supabase của bạn dùng tên miền riêng (không phải `*.supabase.co`), hãy thêm tên miền đó vào `connect-src` trong thẻ này.
  Nếu đổi phiên bản một thư viện CDN, phải đổi cả mã `integrity` của nó, nếu không trình duyệt sẽ chặn thư viện.

## Lưu theo phần thay đổi
Mỗi lần sửa, trang chỉ gửi những note đã đổi (và các mục nhỏ như liên kết ngang, thùng rác khi có đổi), không gửi cả cây.
Máy chủ ghép "bản vá" vào cây bằng hàm `patch_tree` trong `supabase.sql`, có kiểm tra phiên bản để chống ghi đè.
Thử với cây 800 note: đổi tên một note chỉ gửi khoảng 0,6 KB thay vì 475 KB.
- Với note đã có, trang chỉ gửi các trường đã đổi (hàm `patch_tree2`): kéo một note chỉ gửi toạ độ, không gửi lại nội dung trang.
  Nếu `patch_tree2` chưa được cài, trang tự dùng `patch_tree` (gửi cả note).
- Cứ sau 40 lần gửi bản vá, trang gửi lại cả cây một lần để đồng bộ cho chắc.
- Nếu hàm `patch_tree` chưa được cài (ví dụ bạn chỉ chạy bản SQL cũ), trang tự quay về gửi cả cây và vẫn chạy bình thường.
- Đã chạy bản SQL trước đó? Hãy chạy lại toàn bộ `supabase.sql` (file chạy lại nhiều lần được).

## Nhiều cây, chia sẻ, xoá tài khoản
- **Nhiều cây:** nút "Cây: … ▾" ở thanh trên mở danh sách. Tạo, mở, đổi tên (gõ tên vào ô phía trên rồi bấm Đổi tên) và xoá cây.
- **Chuyển nhánh:** chọn note, bấm "Chuyển nhánh…" (phím V) rồi chọn note cha mới; hoặc kéo note thả lên note khác.
- **Một note thuộc nhiều nhánh:** chọn note, bấm "Thêm vào nhánh…" (phím Shift+V) rồi chọn nhánh thứ hai. Note vẫn ở nhánh chính, có thêm đường nối liền tới nhánh mới và xuất hiện dưới cả hai nhánh trong danh sách bên trái. Khi xoá một nhánh, các note còn thuộc nhánh khác được giữ lại ở nhánh đó.
- **Vẽ tự do:** bấm "Vẽ" (phím D) rồi vẽ lên sơ đồ bằng chuột, ngón tay hoặc bút cảm ứng. Có bút, bút dạ quang, cục tẩy, 6 màu, 3 độ dày, hoàn tác / làm lại nhiều bước (Ctrl+Z / Ctrl+Y) và xoá hết. Trên màn hình cảm ứng: một ngón để vẽ, hai ngón để di chuyển và thu phóng; khi dùng bút cảm ứng thì ngón tay chỉ để di chuyển. Nét vẽ được lưu và đồng bộ cùng với cây (tối đa 3000 nét mỗi cây).
- **Vẽ tay trong trang note:** mở trang, bấm "✎ Vẽ tay" trên thanh công cụ rồi viết, vẽ đè lên trang bằng chuột, ngón tay hoặc bút cảm ứng (cùng bộ công cụ như khi vẽ trên sơ đồ; hai ngón để cuộn trang). Nét vẽ lưu theo từng note. Bấm "Xong" hoặc Esc để gõ chữ lại. Bản xuất .docx / .html chưa kèm nét vẽ tay.
- **Xếp lớp hình và nét vẽ so với chữ (trong trang note):** bấm vào hình hoặc sơ đồ rồi chọn trên thanh nhỏ phía trên nó: "Trái / Giữa / Phải" (hình đứng riêng, tách văn bản ra trên và dưới), "Cạnh chữ" (chữ bao quanh), "Sau chữ" hoặc "Trước chữ" (hình đặt tự do, dùng "⠿ Kéo" để di chuyển). Với nét vẽ tay, bật "Dưới chữ" trên thanh bút để nét mới nằm dưới chữ; tắt thì nét đè lên chữ. Muốn chọn một hình đang nằm sau chữ, bấm vào chỗ trống (không trúng chữ) trên hình.
- **Thu phóng bằng hai ngón** dùng được cả khi không vẽ.
- **Chia sẻ chỉ xem:** trong danh sách cây bấm "Chia sẻ" để tạo liên kết dạng `?share=<mã>`. Ai có liên kết đều xem được, không cần đăng nhập, nhưng không sửa được. Bấm "Tắt chia sẻ" để vô hiệu liên kết.
  Giới hạn: ảnh lưu trong kho riêng tư nên người xem sẽ không thấy các ảnh đó; chưa có chế độ nhiều người cùng sửa.
- **Xoá tài khoản:** nút "Xoá tài khoản…" ở cuối danh sách cây. Xoá ảnh, mọi cây và tài khoản; phải gõ DELETE để xác nhận.
- **Sao lưu:** file .json giờ nhúng sẵn ảnh (tải về từ kho riêng tư), nên khôi phục sang tài khoản khác vẫn có ảnh.
- Khi xoá note hoặc xoá một cây, ảnh của chúng vẫn nằm trong kho. Bấm "Dọn ảnh không dùng…" ở cuối danh sách cây để xoá các ảnh đã tải lên quá 1 ngày mà không note nào (kể cả trong thùng rác) còn dùng.
- Cập nhật `supabase.sql` đã đổi cấu trúc bảng `trees`; nếu đã chạy bản cũ, xem ghi chú ở đầu file SQL.

## Thanh menu
Thanh trên cùng gồm các nhóm nút thường dùng; Sao lưu, Khôi phục, Thùng rác, Phím tắt, Đăng xuất nằm trong "☰ Menu" ở góc phải.

## Bảng note
Bấm một note để mở bảng gọn: sửa tiêu đề/tóm tắt, "⋯ Thao tác" (nối, chuyển, tách…), "Kiểu" (màu, hình, cỡ). Nút "—" hoặc rê chuột ra ngoài sẽ thu bảng thành thanh tiêu đề.

## Cách hoạt động
- Mở trang: nếu chưa cấu hình URL/khoá, trang chạy chế độ chỉ lưu trên máy như trước.
- Đăng nhập: tải cây từ bảng `trees`. Tài khoản mới sẽ nhận cây đang có trên máy.
- Mất mạng hoặc lưu lỗi: trang tự thử lại, và giữ phần chưa lưu thành bản nháp trong trình duyệt. Lần mở sau (kể cả sau khi tắt trình duyệt), bản nháp được gộp lại vào cây; nếu không gộp được thì nó được tải về thành file .json.
- Nếu đã cấu hình Supabase mà thư viện không nạp được (mất mạng, CDN bị chặn), trang báo "Chưa kết nối — chỉ lưu trên máy này".
- Giới hạn trong `supabase.sql` (phần 7): mỗi cây tối đa 10 MB, mỗi người tối đa 100 cây.
- Ảnh nhúng sẵn trong note (từ cây trên máy hoặc từ file sao lưu) được đưa vào kho ảnh khi chuyển lên tài khoản.
- Sửa: tự lưu sau khoảng 1 giây. Cột `version` chống ghi đè: nếu cây đã được sửa ở thiết bị khác, trang tải bản mới về và tự gộp với phần bạn vừa sửa. Chỉ khi hai bên sửa cùng một chỗ theo cách khác nhau, trang mới báo "xung đột", tải bản của bạn về file .json và yêu cầu tải lại.

- **Tìm kiếm:** ô "Tìm trong note…" (phím `/` hoặc Ctrl+F) tìm trong tiêu đề, mô tả và cả nội dung trang, không phân biệt hoa/thường và dấu tiếng Việt (gõ `duong` tìm được "Đường"). Enter nhảy tới kết quả kế tiếp, Shift+Enter về kết quả trước.
- **Phân trang và bảng trong trang note:** nền là các tờ A4 tách nhau bởi khe xám; đoạn, tiêu đề, ảnh, mục danh sách và hàng bảng không còn vắt qua khe mà được đẩy xuống đầu tờ kế tiếp (không ghi vào nội dung note). Khối cao hơn một tờ, và một đoạn văn rất dài, chưa tách được giữa chừng. Bảng: rê tới đường viền ô rồi kéo để đổi độ rộng cột (cạnh phải) hoặc độ cao hàng (cạnh dưới); "Ngắt trang" đẩy nội dung xuống tờ mới.
- **Thanh công cụ chia tab:** Trang chủ (kiểu đoạn, phông, cỡ, in đậm/nghiêng, màu), Đoạn văn (căn lề, danh sách, thụt lề), Chèn (ảnh, sơ đồ, liên kết note, đường kẻ, việc cần làm, trích dẫn, ghi chú, ngắt trang), Bảng (thêm/xoá hàng, cột, xoá bảng) Bố cục, Vẽ và Xem. Hoàn tác / làm lại luôn hiện; trang nhớ tab bạn dùng lần cuối.
- **Thước kẻ và lưới (tab Xem):** thước có vạch và số theo cm, kéo mốc ▾ để đổi lề trái / phải của trang; "Lưới" phủ lưới ô 1 cm lên trang để căn chỉnh. Bật / tắt và lề được nhớ theo trình duyệt, áp cho mọi note (chưa lưu theo từng note, chưa vào bản .docx / .html).
- **Tô nổi bật, giãn dòng:** tab Trang chủ có nút "🖍 Tô" cùng 5 màu tô nhanh và ô chọn màu khác (bấm lại đúng màu đó để bỏ tô, hoặc "Bỏ tô"). Tab Đoạn văn có "Giãn dòng" (1 – 3) và "Cách đoạn" (0 – 24 pt), áp cho các đoạn đang chọn.
- **Bảng đầy đủ (tab Bảng):** chọn số hàng × cột khi tạo; kéo chuột qua nhiều ô (hoặc Shift+bấm) để chọn vùng; gộp / tách ô; thêm hàng trên / dưới, cột trái / phải; xoá hàng, cột, bảng; màu nền ô; viền (tất cả, ngoài, đậm, không); căn ngang / dọc trong ô; hàng tiêu đề; chia đều cột / hàng; vừa trang; căn bảng; Tab / Shift+Tab đi qua các ô (Tab ở ô cuối thêm hàng). Kéo viền ô để đổi độ rộng cột / độ cao hàng; độ rộng cột lưu trong `<colgroup>` và style của ô.
- **Bố cục trang (tab Bố cục):** khổ giấy A4 / A5 / A3 / Letter / Legal, giấy dọc hoặc ngang, lề trên / dưới / trái / phải (nhập bằng cm, chọn lề có sẵn Thường / Hẹp / Vừa / Rộng, hoặc kéo mốc trên thước), chữ đầu trang và chân trang, bật / tắt số trang, ngắt trang. Cài đặt lưu riêng cho từng note (trường `pl`) và đồng bộ cùng cây. Bản .html và .docx tải về dùng đúng lề và hướng giấy.
- **Thẻ Trang chủ kiểu Word:** Cắt / Chép / Dán, Cọ định dạng, Tìm & thay (Ctrl+H, có đếm kết quả, thay từng chỗ hoặc tất cả), Chọn tất cả; kiểu đoạn thêm Tiêu đề lớn, Phụ đề, Trích dẫn; tăng / giảm cỡ chữ (A▲ A▼), đổi chữ hoa / thường (Aa), chỉ số trên / dưới. Tab Đoạn văn thêm tô nền đoạn, viền đoạn, kiểu đánh số (1 / a / A / i / I), sắp xếp A→Z (bấm lại Z→A) và hiện dấu ¶.
- **Chữ viết tắt:** nút "Viết tắt" (tab Trang chủ) mở danh sách chữ viết tắt của bạn (ví dụ `ngkh` → `người khác`). Gõ chữ viết tắt rồi nhấn cách, dấu câu hoặc Enter thì tự thay; khi đang gõ có khung gợi ý. Muốn giữ nguyên `ngkh`: nhấn Esc lúc gợi ý đang hiện, hoặc nhấn Backspace ngay sau khi nó vừa được thay (trở lại đúng chữ gốc), hoặc Ctrl+Z. Có 3 chế độ: tự thay, chỉ gợi ý (Tab để thay), tắt. Gõ hoa chữ đầu thì cụm thay ra cũng hoa chữ đầu (`Ngkh` → `Người khác`). Bôi đen một cụm chữ rồi bấm "Viết tắt" để tạo viết tắt cho cụm đó. Có xuất / nhập file .json. Danh sách lưu trên trình duyệt này (chưa đồng bộ theo tài khoản).
- **Chế độ Tập trung:** chọn một note rồi bấm "Tập trung" (hoặc phím `F`, hoặc Ctrl+Shift+chuột phải vào một note). Note đó chạy vào giữa màn hình, các note con toả tròn quanh nó, phần còn lại của cây mờ đi và không bấm được. Thanh nhỏ ở dưới chọn số tầng con hiện ra (1, 2 hoặc 3). Bấm `F` khi đang chọn một note khác để chuyển tâm; `Esc`, nút "Thoát" hoặc `F` lên chính note tâm để thoát. Vị trí trong chế độ này chỉ là bố trí tạm: không lưu, không đồng bộ; thoát ra là mọi note về đúng chỗ cũ. Phím `F` trước đây thu gọn / mở nhánh, nay nhường cho Tập trung (thu gọn / mở nhánh vẫn có phím Space và nút trong bảng note).
- **Chế độ Tập trung:** chọn một note rồi bấm "Tập trung" (hoặc phím `F`, hoặc Ctrl+Shift+chuột phải vào một note). Note đó chạy vào giữa màn hình, các note con toả tròn quanh nó, phần còn lại của cây mờ đi và không bấm được. Thanh nhỏ ở dưới chọn số tầng con hiện ra (1, 2 hoặc 3). Bấm `F` khi đang chọn một note khác để chuyển tâm; `Esc`, nút "Thoát" hoặc `F` lên chính note tâm để thoát. Vị trí trong chế độ này chỉ là bố trí tạm: không lưu, không đồng bộ; thoát ra là mọi note về đúng chỗ cũ. Phím `F` trước đây thu gọn / mở nhánh, nay nhường cho Tập trung (thu gọn / mở nhánh vẫn có phím Space và nút trong bảng note).
- **Nhiều cửa sổ note:** mở tối đa 4 note cùng lúc dưới dạng cửa sổ nổi. Bấm đúp một note như thường thì mở (hoặc thay nội dung cửa sổ đang sửa); **Shift + bấm đúp**, nút "Cửa sổ mới" trong bảng note, hoặc nút "＋ Mở note…" trên thanh tác vụ thì mở note đó trong cửa sổ riêng. Mỗi cửa sổ có thanh tiêu đề: kéo để di chuyển, kéo cạnh / góc để đổi cỡ, nút ─ thu nhỏ xuống thanh tác vụ, ▢ phóng to / thu về (bấm đúp thanh tiêu đề cũng được), ✕ đóng. Hai cửa sổ trở lên tự xếp cạnh nhau. Mỗi lúc chỉ một cửa sổ đang sửa (có thanh công cụ); cửa sổ còn lại hiện bản xem để đối chiếu, bấm vào là chuyển sang sửa ngay tại chỗ bấm. "← Về cây tri thức" ẩn toàn bộ cửa sổ nhưng giữ lại trên thanh tác vụ nổi ở dưới màn hình; bấm tên một cửa sổ để gọi lại. Trong khung điện thoại / cửa sổ hẹp, trang tự thu nhỏ cho vừa. Bố cục cửa sổ không được lưu khi tải lại trang.

## Chưa có
Nhiều người cùng sửa một cây (hiện chỉ chia sẻ xem), hiển thị ảnh cho người xem bản chia sẻ, chia trang văn bản thành nhiều cột, khổ giấy trong file .docx (luôn A4, chỉ đổi được lề và hướng).

## Kiểm thử
`node tests/kiem-thu.js` chạy các kiểm thử cho phần làm sạch dữ liệu và phần gộp khi xung đột (cần Node.js).
