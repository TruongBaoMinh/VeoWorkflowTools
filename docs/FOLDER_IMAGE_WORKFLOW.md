# Folder ảnh → AI Prompt → Flow

Đã bổ sung vào mã nguồn `full-source-app` và bản desktop `full-release`.

## Kết quả theo folder mẫu sản phẩm

Với chế độ `product-images` hoặc `subfolders`, kết quả được lưu theo cấu trúc `folder đầu ra / batch_<id> / tên folder sản phẩm_<mã> / các ảnh`. Mọi ảnh màu thuộc cùng folder sản phẩm nguồn lưu chung tại đây; khác folder nguồn thì tách folder kết quả, dù nằm cùng batch. Không tạo folder riêng cho từng job màu hoặc lần thử. Tên file riêng tránh ghi đè khi chạy đồng thời/chạy lại; prompt và manifest lưu cạnh ảnh.

Chế độ mỗi ảnh ngay tại folder lớn (`files`) vẫn lưu chung trực tiếp trong folder batch. Node Save Images độc lập không đổi. Áp dụng với kết quả tải sau khi khởi động lại; không di chuyển các ảnh đã lưu trước đây.

## Nhánh lỗi nội dung: Cần duyệt

Generate Image/Video bị từ chối nội dung sẽ dừng retry tự động, giữ lý do gốc và hiển thị **Cần duyệt** trên dòng sản phẩm. Các dòng khác tiếp tục. Đây là nhánh xử lý tích hợp trong engine, không cần thêm node IF/Else hoặc import lại workflow. Về lưu trữ, dòng vẫn là lỗi kết thúc (`ERROR`) kèm nhãn review, nên vẫn được tính trong tổng lỗi của batch.

Lỗi mạng/quá tải giữ cơ chế retry có giới hạn hiện tại (mặc định tối đa 3 lần retry node, khoảng nghỉ tăng dần). Không có nhánh tự sửa câu chữ của prompt bị từ chối để gửi lại. Riêng Generate Image có tùy chọn phương án nội dung khác: ảnh chỉ sản phẩm trên ma-nơ-canh, bỏ ảnh người mẫu, đổi nền và góc máy; thử tối đa một lần rồi chuyển Cần duyệt nếu thất bại. Xem `docs/workflows/ETSY-FOLDER-MODEL.md`.

Đối với dòng cần duyệt: mở Chi tiết để xem lý do, chờ batch kết thúc hoặc huỷ batch; sửa và lưu workflow/ảnh tham chiếu nếu cần. Có thể chọn phương án chỉ sản phẩm (bỏ ảnh model khỏi cả AI và Generate Image, sửa yêu cầu thành giữ nguyên sản phẩm không thêm người) hoặc ảnh model catalog trung tính nếu phù hợp. Giữ đúng thiết kế thật. Bấm chạy lại dòng và xác nhận đã duyệt trước khi gửi. Backend cũng yêu cầu xác nhận và không nhận retry dòng nội dung trong lúc batch vẫn đang chạy. Workflow đã sửa sẽ được nạp ở lượt chạy sau; lỗi review không gây chạy lại các dòng đã thành công.

Không tự đóng ứng dụng đang chạy batch để cập nhật. Lưu công việc và khởi động lại khi batch đã kết thúc hoặc đã huỷ.

## Master Etsy và định dạng prompt cho Flow

`ETSY-FOLDER-INPUT.json` dùng nguyên văn master mới trong `docs/workflows/ETSY-MASTER-PROMPT.md`. Node AI Gen Prompt bật **Etsy → Flow** (`outputFormat: etsy-flow-v1`), Max tokens 6000. Chọn model có khả năng đọc ảnh thực sự trên tài khoản của bạn. Với workflow đã lưu trước đây, chọn định dạng này trong node hoặc import lại mẫu và cấu hình folder/model; không tự thay nội dung workflow đang lưu của bạn.

AI trả một đối tượng JSON nội bộ. Backend kiểm tra cấu trúc, đủ mục, danh sách/vai trò ảnh và số cột bảng size, rồi chỉ đưa prompt tiếng Anh đã biên soạn vào cổng text của Generate Image. Prompt gồm REFERENCE, MODEL, GARMENT – HIGHEST PRIORITY, POSE, COMPOSITION, BACKGROUND, LIGHTING, BRANDING, NEGATIVE PROMPT, FINAL CHECK; size chart thêm FINAL DATA CHECK với dữ liệu dạng chuỗi, không chuyển đổi số/đơn vị. Không gửi phần chào hỏi, code fence hoặc lớp JSON điều khiển tới Flow.

Đặt yêu cầu cụ thể trong node Yêu cầu chung: ví dụ “Chỉ thay nền thành studio trắng, giữ nguyên người mẫu, tư thế và trang phục”. Ảnh garment quyết định sản phẩm; ảnh model/pose/background phải đặt đúng vai trò và nối vào cả AI Gen Prompt lẫn Generate Image. Các mô tả tham chiếu dùng đặc điểm nhìn thấy, không phụ thuộc thứ tự ảnh đến Flow. Count 4 vẫn là bốn biến thể của một prompt, không tự tạo bốn góc chụp khác nhau.

Chế độ tự động dừng nếu AI báo thiếu mặt sau thật, ảnh mâu thuẫn hoặc số liệu không rõ; lỗi chỉ áp dụng sản phẩm tương ứng. Đây là lựa chọn bảo thủ hơn nhánh suy đoán back view trong master, nhằm tránh mô tả sai hàng bán. Sửa ảnh/yêu cầu và chạy lại dòng đó. Không tự thêm model blonde, logo, quần hay phụ kiện. Nếu cần cùng một model giữa các sản phẩm, cung cấp ảnh model reference; không dựa vào lịch sử chat.

Kiểm tra cấu trúc không phải kiểm chứng thị giác độc lập. Dữ liệu bảng size được giữ nguyên từ bản AI đọc ra, nhưng AI vẫn có thể đọc nhầm; cần đối chiếu với ảnh gốc, đặc biệt trước khi đăng listing. Flow cũng có thể dựng sai chi tiết hoặc chữ. Các test dùng dữ liệu mô phỏng, không xác nhận chất lượng một model AI hoặc một lần tạo ảnh thật.

## Chạy hai sản phẩm đồng thời với Folder Input

Dùng `docs/workflows/ETSY-FOLDER-INPUT.json`, chọn thư mục trong node Folder Input rồi bấm **Chuẩn bị chạy folder**. Màn hình Batch mặc định chọn **2 sản phẩm/profile**; có thể giảm xuống 1. Bật **Tự tải ảnh / video** và chọn thư mục đầu ra.

Hai sản phẩm có thể upload ảnh và tạo prompt đồng thời. Mỗi lần gọi Generate Image gửi 1–4 ảnh theo Count của node (không tự tăng Count). Bộ điều phối chung cho các workflow trên cùng profile chỉ nhận tối đa 2 nhóm / 8 ảnh đang tạo; nhóm tiếp theo chờ ngẫu nhiên 7–10 giây kể từ lần gửi trước. Nếu chưa đủ chỗ hoặc token chưa sẵn sàng, thời gian thực tế dài hơn. Profile khác có hàng đợi độc lập. Hủy run sẽ loại công việc chưa gửi; yêu cầu đã gửi vẫn giữ chỗ tới khi kết thúc.

Ảnh và prompt vẫn được lưu riêng theo sản phẩm. Giới hạn này áp dụng cho Generate Image của Workflow; không phải giới hạn dùng chung với màn hình GenNormal. Không nên cộng tải từ hai màn hình trên cùng profile khi đánh giá tốc độ. Retry một node có lỗi vẫn theo cơ chế retry hiện có; chưa có bảo đảm giữ kết quả thành công riêng lẻ trong một nhóm bị lỗi một phần.

## Bắt đầu

1. Mở lại `full-release/Veo Workflow Tools-win32-x64/Veo Workflow Tools.exe`.
2. Trong Workflow, chọn Import và mở `docs/workflows/etsy-folder-images.json`.
3. Node AI Gen Prompt đã có master prompt Etsy được cung cấp. Chọn đúng ID model hỗ trợ đọc ảnh trên tài khoản Beeknoee; cấu hình API key nếu chưa có. Model không được tự chọn vì danh sách khả dụng tùy tài khoản.
4. Sửa mục Yêu cầu, tỷ lệ và số ảnh ở Generate Image. Giữ chế độ Image → Image.
5. Lưu workflow, mở Batch, chọn Nhập folder ảnh:
   - Mỗi ảnh = một sản phẩm: đọc các ảnh trực tiếp trong folder.
   - Mỗi folder con = một sản phẩm: đọc các ảnh trực tiếp trong từng folder con.
6. Chọn profile Flow, folder đầu ra, bật tự tải kết quả và chạy Batch.

Nhập folder chỉ đọc và lập danh sách; ảnh được gửi sang dịch vụ khi chạy. Nhập tiếp folder sẽ thêm sản phẩm vào danh sách hiện tại, bỏ các dòng trống. Các dòng khác có dữ liệu được giữ lại. Có thể xóa dòng trước khi chạy. Không tự quét đệ quy các cấp sâu hơn.

Giới hạn: JPEG/PNG/WebP, 20 MB mỗi ảnh, tối đa 8 ảnh mỗi nhóm và 1.000 sản phẩm mỗi lần nhập. AI Gen Prompt và Image Review nhận tối đa 8 ảnh tổng cộng, tính cả ảnh mẫu/pose/kết quả. Nếu dùng ảnh mẫu cố định, hãy dành chỗ trong giới hạn này.

## Node và chức năng mới

- **Nhập folder trong Batch:** chọn cột ảnh đích, hai chế độ nhóm; mỗi nhóm tạo một dòng độc lập.
- **Save Images:** nối ảnh đầu ra và prompt vào node, chọn folder lưu. Lưu ảnh, `prompts.txt`, `manifest.json` vào thư mục sản phẩm và thư mục riêng cho từng lần lưu. Batch đã tự lưu nên không cần thêm node này vào template Batch.
- **Image Review:** nối Upload Image vào cổng ảnh sản phẩm gốc, Generate Image vào cổng ảnh đã tạo, rồi nối đầu ra Image Review đến Result. Chọn model đọc ảnh. Mặc định dừng nhánh nếu phát hiện khác biệt hoặc chưa chắc chắn; ảnh gốc và ảnh tạo vẫn xem được tại các node phía trước. Có thể bỏ chọn “Dừng nếu cần duyệt ảnh” để lưu kèm báo cáo. Đây là kiểm tra hỗ trợ bằng AI, không bảo đảm sản phẩm chính xác tuyệt đối. Không tự gọi tạo ảnh lại.

## Node được cải thiện

- **AI Gen Prompt:** nhận ảnh thực tế, nhãn vai trò tham chiếu, mặc định 4.000 token cho node mới; báo lỗi nếu model trả prompt bị cắt. System message và yêu cầu lưu trong workflow; preset lưu riêng trong ứng dụng, không chứa API key.
- **Upload Image:** hỗ trợ nhóm ảnh được truyền từ Batch, giữ nhãn sản phẩm/người mẫu/pose/nền/size chart; kiểm tra ảnh trước khi upload.
- **Generate Image:** chặn prompt rỗng hoặc chế độ tham chiếu thiếu ảnh hợp lệ. Có nút đánh dấu Batch output trực tiếp.
- **Batch:** cho phép đầu ra ảnh; xem ảnh thay vì luôn mở video; lưu prompt, nguồn ảnh và cấu hình AI cùng ảnh kết quả. Lỗi lưu file được báo thành lỗi dòng, không còn bị bỏ qua.
- **Chạy lại dòng lỗi:** giữ liên kết lần chạy cũ. Nếu template, input, thông tin file nguồn và profile không thay đổi, dùng lại node đã hoàn thành; nếu chỉ lưu file lỗi thì chỉ lưu lại. Nếu đổi profile/input/template, chạy mới để tránh dùng nhầm kết quả. Một số thay đổi file giữ nguyên cả kích thước và thời gian sửa không được phát hiện bằng metadata.

## Ảnh người mẫu cố định

Thêm Upload Image thứ hai, chọn ảnh mẫu thật và vai trò “Ảnh người mẫu”. Nối node này vào cả AI Gen Prompt và Generate Image. Không đánh dấu node ảnh mẫu là Batch input nếu muốn dùng chung cho mọi sản phẩm. Đặt vai trò “Ảnh tư thế” tương tự cho ảnh pose. Câu mô tả “mẫu ảnh 1” không thay thế ảnh tham chiếu thực tế.

## Kiểm chứng và giới hạn

- 30 kiểm thử architecture đạt, gồm nhóm folder, truyền ảnh/nhãn sang AI, lưu không ghi đè, chặn prompt bị cắt, chạy lại và kiểm tra ảnh.
- Backend biên dịch thành công; renderer qua kiểm tra cú pháp và kiểm tra giao diện bằng trình duyệt trên trang thử riêng, gồm lưu preset.
- Chưa gọi dịch vụ AI/Flow trả phí để xác nhận ảnh thật. Cần model hỗ trợ thị giác, API key và profile Flow hoạt động.
- Phục hồi tự động sau khi ứng dụng bị tắt vẫn theo cơ chế Batch hiện có; không cam kết xử lý đúng-một-lần đối với yêu cầu bên ngoài đã gửi mà chưa nhận kết quả.
- Renderer của dự án hiện chỉ có bundle đã build, nên các thay đổi giao diện được áp dụng vào bundle ở cả renderer và Electron renderer. Nếu khôi phục source frontend và build lại, cần chuyển các thay đổi này vào source đó.
- Bản sao trước khi sửa: `backups/folder-image-workflow-20260921-120141`.
