# Folder quần áo → người mẫu riêng

Import `ETSY-FOLDER-MODEL.json` vào Workflow.

## Phương án ma-nơ-canh khi ảnh người mẫu bị từ chối

Mẫu mới bật **Nếu ảnh mẫu bị từ chối: thử 1 lần ma-nơ-canh, nền và góc máy mới** trong Generate Image. Với workflow đang lưu, bật checkbox này rồi lưu. Không áp dụng tự động cho các dòng lỗi cũ; muốn chạy lại dòng cũ vẫn phải duyệt theo quy trình Cần duyệt.

Khi Flow trả lỗi nội dung tình dục hoặc unsafe generation, node thử một yêu cầu catalog khác: chỉ ảnh GARMENT, ma-nơ-canh trơn rõ ràng là vật trưng bày, không người thật. Nền chuyển sang studio xám ấm (sage nếu nguồn đã tương tự); góc máy lệch nhẹ 10–15 độ hoặc đổi khoảng cách/framing nếu thiếu bằng chứng về cấu trúc mặt khác. Không tự dựng mặt sau, thêm lớp lót hoặc sửa thiết kế. Prompt này độc lập với prompt người mẫu đã bị từ chối, được lưu trong kết quả node và prompts.txt khi tải Batch.

Nhánh thay thế giữ Count và tỷ lệ đang chọn, dùng chung giới hạn 8 ảnh/profile và khoảng chờ giữa nhóm. Chỉ thử một lần; nếu thất bại thì Cần duyệt, không lặp lại nhánh người mẫu. Các lỗi khác như mạng/quota hoặc lỗi liên quan trẻ vị thành niên không kích hoạt phương án này. Có thể tốn thêm lượt tạo theo Count. Chưa kiểm chứng bằng ảnh thật; nền/góc/chi tiết còn phụ thuộc dịch vụ tạo ảnh.

1. Chọn folder lớn và thư mục lưu ở Folder Input. Chế độ mặc định mới **Folder con = mẫu; mỗi ảnh màu = 1 job**: mỗi folder con là một mẫu; từng ảnh trong đó được gửi riêng để tạo listing đúng màu. Ví dụ 3 mẫu × 5 ảnh màu = 15 job. Không gộp các màu thành ảnh tham chiếu chung. Folder con có thể chứa hơn 8 ảnh vì mỗi job chỉ dùng 1 ảnh sản phẩm; vẫn giới hạn 1.000 job/lần quét. Chỉ đọc ảnh trực tiếp trong folder con cấp một, không đọc ảnh nằm ngay folder lớn hoặc cấp sâu hơn.
2. Chọn ảnh của một người mẫu trưởng thành trong Upload Image mang nhãn “Ảnh người mẫu riêng”. Vai trò phải là **Ảnh người mẫu**. Node này dùng chung cho mọi sản phẩm, không đánh dấu làm input theo dòng.
3. Chọn model đọc ảnh ở AI Gen Prompt. Giữ định dạng Etsy → Flow.
4. Generate Image đã dùng Image → Image. Count mặc định 1; có thể chọn 4 để tạo bốn biến thể. Đây chưa phải bốn pose được chỉ định riêng.
5. Lưu, bấm Chuẩn bị chạy folder, chọn profile và chạy. Cơ chế hai sản phẩm/profile và tự lưu kết quả của Folder Input tiếp tục áp dụng.

Ảnh sản phẩm và ảnh người mẫu đều đã nối tới cả AI Gen Prompt và Generate Image. Ảnh sản phẩm quyết định trang phục; ảnh mẫu quyết định diện mạo. Prompt đã cho phép thay mannequin/flat lay/người mặc gốc thành người mẫu riêng và pose tự nhiên. Không lấy trang phục từ ảnh người mẫu. Phong cách ảnh: studio kem–beige, ánh sáng mềm trung tính, pose đứng catalog phía trước hoặc ba phần tư khi có đủ bằng chứng về sản phẩm. Không ép mọi người mẫu có tóc vàng và không sao chép váy satin trong ảnh ví dụ.

Master có mục 26 cho đồ ngủ/lingerie: người mẫu rõ ràng trưởng thành, pose trung tính, không bối cảnh giường hoặc thân mật; không làm sai thiết kế bằng cách tự thêm lớp lót hoặc tăng độ đục của vải. Nếu không thể trình bày trên người theo cách không phô bày vùng riêng tư mà vẫn đúng sản phẩm, AI được yêu cầu trả needs_review để người dùng chọn phương án khác. Đây là điều chỉnh nội dung theo hướng catalog, không bảo đảm dịch vụ sẽ chấp nhận mọi ảnh. Ảnh tham chiếu vẫn được dịch vụ đánh giá.

Mỗi kết quả là một ảnh riêng, không phải collage sáu ô. Mẫu này dành cho quần áo; bảng size dùng workflow Etsy tổng quát. Khi chỉ có một phần trang phục, ưu tiên crop vào món đồ đó thay vì tự thêm món khác.

Nếu muốn pose chính xác từ một ảnh riêng, thêm Upload Image vai trò **Ảnh tư thế**, nối cổng ảnh của nó vào cả AI Gen Prompt và Generate Image. Ưu tiên một ảnh pose đơn thay vì một bảng gồm nhiều pose. Giới hạn tổng là 8 ảnh tham chiếu: với 1 ảnh model còn tối đa 7 ảnh sản phẩm; nếu thêm 1 ảnh pose còn tối đa 6 ảnh sản phẩm.

Ảnh mẫu chưa được cung cấp nên template để trống node model. Chất lượng giữ gương mặt và chi tiết trang phục phụ thuộc model tạo ảnh; cần kiểm tra kết quả. Template không thay các workflow đã lưu, không thực hiện lượt tạo ảnh khi import.

Count quyết định số ảnh kết quả cho từng ảnh nguồn. Count 4 với 15 ảnh nguồn yêu cầu 60 ảnh đầu ra nếu mọi job thành công. Hai ảnh cùng màu vẫn tạo hai job riêng; chưa tự phân nhóm hay suy đoán màu từ tên file. Trong thư mục batch, mỗi folder mẫu sản phẩm nguồn có một folder kết quả riêng; toàn bộ ảnh màu của cùng mẫu lưu chung ở đó. Không tách folder theo ảnh màu/job. Tên file riêng giúp tránh ghi đè. Muốn gom nhiều góc của cùng một biến thể thành một job, dùng chế độ **Mỗi folder con = 1 bộ ảnh tham chiếu** riêng.
