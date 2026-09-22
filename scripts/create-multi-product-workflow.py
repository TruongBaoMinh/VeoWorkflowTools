import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
folder = root / 'docs/workflows'
workflow = json.loads((folder / 'ETSY-FOLDER-AUTO.json').read_text(encoding='utf-8'))
workflow['name'] = 'ETSY - Tạo ảnh nhiều sản phẩm từ folder'
workflow['description'] = (
    'Chạy bằng Workflow Batch. Mỗi dòng là một sản phẩm độc lập. '
    'Nhập folder theo chế độ mỗi ảnh hoặc mỗi folder con là một sản phẩm. '
    'Chỉ cột Ảnh sản phẩm là Batch input; Yêu cầu chung và Master prompt dùng lại cho mọi dòng. '
    'Chọn model AI hỗ trợ đọc ảnh, profile Flow và folder lưu trước khi chạy. '
    'Mặc định tạo 1 ảnh vuông cho mỗi sản phẩm; bật tự tải kết quả trong Batch.'
)
nodes = {node['id']: node for node in workflow['nodes']}
nodes['product']['data'].update({
    'batchRole': 'input', 'batchKey': 'san-pham',
    'batchLabel': 'Ảnh sản phẩm - mỗi dòng một sản phẩm',
    'batchOrder': 1, 'referenceRole': 'garment',
})
nodes['product']['label'] = '01 - Ảnh sản phẩm từ Batch'
nodes['brief']['label'] = '02 - Yêu cầu chung cho tất cả sản phẩm'
nodes['brief']['data']['prompt'] = (
    'Tạo prompt tiếng Anh cho một ảnh listing Etsy chuyên nghiệp của sản phẩm hiện tại. '
    'Giữ nguyên thiết kế, màu sắc, chất liệu, phom dáng, tỷ lệ, chiều dài và các chi tiết nhìn thấy. '
    'Sử dụng nền nội thất trung tính cao cấp và ánh sáng mềm, giữ sản phẩm rõ ràng. '
    'Giữ kiểu trình bày sản phẩm và tư thế trong ảnh nếu không có yêu cầu thay đổi. '
    'Không tự thêm trang phục, phụ kiện hoặc logo. '
    'Nếu đầu vào là bảng size, tạo prompt bảng size tiếng Anh, giữ chính xác số liệu và đơn vị, không thêm người mẫu.'
)
nodes['ai']['label'] = '03 - AI đọc ảnh và áp dụng Master prompt'
nodes['ai']['data']['prompt'] = (
    'Xử lý riêng sản phẩm trong lần chạy này, không suy đoán có lịch sử hội thoại hoặc ảnh của sản phẩm khác. '
    'Kết hợp master prompt với yêu cầu chung được nối vào và các ảnh tham chiếu hiện có. '
    'Nếu có nhiều ảnh GARMENT, đó là các góc hoặc chi tiết của CÙNG MỘT sản phẩm. '
    'Trả về đúng MỘT prompt tiếng Anh hoàn chỉnh cho Flow, không lời dẫn, không code fence. '
    'Không nhắc danh tính người mẫu hoặc ảnh tham chiếu không được cung cấp. '
    'Không bịa thiết kế ở mặt chưa nhìn thấy. Giữ nguyên số liệu nếu là size chart.'
)
nodes['image']['label'] = '04 - Flow tạo ảnh theo ảnh gốc'
nodes['image']['data'].update({'imageMode':'image-to-image', 'count':1, 'ratio':'1:1'})
nodes['result']['label'] = '05 - Kết quả riêng cho từng sản phẩm'
nodes['result']['data'].update({
    'batchRole':'output','batchKey':'anh-san-pham',
    'batchLabel':'Ảnh thành phẩm','batchOrder':1,
})
for node in workflow['nodes']:
    for key in ['results','runStatus','previewUrl','prompts','error']:
        node['data'].pop(key, None)
    if node['id'] not in ['product','result']:
        for key in ['batchRole','batchKey','batchLabel','batchOrder']:
            node['data'].pop(key, None)

out = folder / 'ETSY-NHIEU-SAN-PHAM.json'
out.write_text(json.dumps(workflow, ensure_ascii=False, indent=2), encoding='utf-8')
print(out)
