# Batch folder: nhiều profile

Trong màn hình Batch Flow, mở **Chọn profile (N)** trước khi bắt đầu. Tích các profile muốn dùng, hoặc chọn tất cả profile đang bật. Có thể tìm theo tên và bỏ chọn. Trạng thái đang bật không xác nhận cookies/token còn hiệu lực.

Chọn 2 job/profile để chạy tối đa N × 2 job. Job giữ vị trí trong suốt workflow và tải kết quả. Danh sách profile được khóa khi bắt đầu Batch. Mỗi dòng kết quả hiển thị profile thực hiện; bảng tổng hợp hiển thị số đang chạy, xong và lỗi.

## Điều phối

- Dùng hàng đợi chung, nhận dòng bằng thao tác có điều kiện trong database.
- Giới hạn chung tối đa 2 job/profile cho các Batch trong cùng tiến trình server, kể cả nhiều Batch dùng chung profile. Không điều phối giữa nhiều server độc lập hoặc các chức năng tạo ảnh ngoài Batch.
- Giữ giới hạn hàng đợi Flow: tối đa 2 nhóm/8 ảnh mỗi profile, gửi nhóm cách 7–10 giây.
- Profile có lỗi Flow xác định rõ về quota hoặc xác thực sẽ ngừng nhận dòng mới trong Batch đó. Những dòng đã nhận được phép kết thúc; không tự chuyển chúng qua profile khác.
- Profile còn hoạt động tiếp tục nhận dòng chưa chạy. Nếu toàn bộ profile bị dừng, dòng chưa chạy được đánh dấu lỗi cần kiểm tra tài khoản, tránh chờ vô hạn.
- Lỗi nội dung, lỗi OpenAI và lỗi traffic tạm thời không bị coi là profile Flow hết quota.
- Giữ nguyên nhóm folder sản phẩm, chống ghi đè và cơ chế thử tải lại hiện có. Không sửa workflow JSON hoặc prompt.

## Kiểm tra đã thực hiện

27 kiểm thử: điều phối nhiều profile/cùng profile giữa các Batch, hủy chờ, giải phóng vị trí khi lỗi, profile hết quota, hàng đợi ảnh và lưu theo folder sản phẩm. Kiểm tra component giao diện bằng harness: chọn nhiều, chọn tất cả đang bật, bỏ chọn, tìm kiếm, khóa lựa chọn và thống kê profile. Backend build thành công.

Đây là kiểm thử tự động/mô phỏng, chưa phải xác nhận chạy Flow/OpenAI thực tế. Chưa chạy API trả phí. Bản cập nhật cần khởi động lại ứng dụng; chờ Batch hiện tại kết thúc trước khi đóng app.
