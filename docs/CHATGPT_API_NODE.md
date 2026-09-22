# ChatGPT API node

Thêm node **ChatGPT API** từ nhóm Generate. Node gọi `https://api.openai.com/v1/responses` trực tiếp từ backend, không sử dụng phiên đăng nhập ChatGPT trên trình duyệt.

1. Nhập OpenAI API key ở node và bấm Lưu key. Key được lưu trong app settings của backend, không nằm trong data node hay file JSON workflow. API trả về trạng thái đã cấu hình và giá trị che bớt. Cơ chế lưu hiện tại là database ứng dụng, không phải kho bí mật mã hóa. Có thể dùng biến môi trường OPENAI_API_KEY (ưu tiên hơn key lưu); nhãn UI phản ánh key trong database.
2. Nhập ID model OpenAI mà tài khoản có quyền gọi. Nếu nối ảnh, chọn model hỗ trợ đầu vào ảnh. Không tự chọn model hoặc tự thay model khi lỗi.
3. Nhập System / Master prompt và Yêu cầu; nối Prompt vào cổng text, Upload Image / Folder Input vào cổng ảnh. Giới hạn tham chiếu hiện tại là 8 ảnh; file cục bộ được chuyển thành data URL ở backend.
4. Nối cổng văn bản của ChatGPT API vào Generate Image. Nếu dùng Etsy, chọn Etsy → Flow để áp dụng kiểm tra cấu trúc giống node AI Gen Prompt. Giữ ảnh sản phẩm/model nối vào Generate Image.

Responses chạy không streaming, store=false, không giữ lịch sử giữa các sản phẩm. Max output tokens được gửi theo lựa chọn trong node. Node không tự tạo ảnh, không có web search hay tool calls. Refusal, đầu ra bị cắt, lỗi key/quota hoặc không có text sẽ dừng; lỗi mạng, 429 tốc độ và 5xx được giao cho giới hạn retry của workflow. Cần kiểm tra tài khoản/billing API riêng trước khi chạy.

Ví dụ import sẵn: `docs/workflows/ETSY-FOLDER-CHATGPT.json`. Chọn lại folder, model reference, OpenAI model ID và lưu key trước khi chạy. Các test dùng API giả lập; chưa gọi trả phí để xác nhận quyền model trên tài khoản của bạn.

Tài liệu: https://developers.openai.com/api/docs/guides/text và https://developers.openai.com/api/docs/guides/images-vision
