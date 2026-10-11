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

## Cách hoạt động
- Mở trang: nếu chưa cấu hình URL/khoá, trang chạy chế độ chỉ lưu trên máy như trước.
- Đăng nhập: tải cây từ bảng `trees`. Tài khoản mới sẽ nhận cây đang có trên máy.
- Mất mạng hoặc lưu lỗi: trang tự thử lại, và giữ phần chưa lưu thành bản nháp trong trình duyệt. Lần mở sau (kể cả sau khi tắt trình duyệt), bản nháp được gộp lại vào cây; nếu không gộp được thì nó được tải về thành file .json.
- Nếu đã cấu hình Supabase mà thư viện không nạp được (mất mạng, CDN bị chặn), trang báo "Chưa kết nối — chỉ lưu trên máy này".
- Giới hạn trong `supabase.sql` (phần 7): mỗi cây tối đa 10 MB, mỗi người tối đa 100 cây.
- Ảnh nhúng sẵn trong note (từ cây trên máy hoặc từ file sao lưu) được đưa vào kho ảnh khi chuyển lên tài khoản.
- Sửa: tự lưu sau khoảng 1 giây. Cột `version` chống ghi đè: nếu cây đã được sửa ở thiết bị khác, trang tải bản mới về và tự gộp với phần bạn vừa sửa. Chỉ khi hai bên sửa cùng một chỗ theo cách khác nhau, trang mới báo "xung đột", tải bản của bạn về file .json và yêu cầu tải lại.

## Chưa có
Nhiều người cùng sửa một cây (hiện chỉ chia sẻ xem), hiển thị ảnh cho người xem bản chia sẻ.

## Kiểm thử
`node tests/kiem-thu.js` chạy các kiểm thử cho phần làm sạch dữ liệu và phần gộp khi xung đột (cần Node.js).
