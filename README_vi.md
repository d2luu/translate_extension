# Tiện ích mở rộng Chrome Dịch Văn bản

## Tổng quan

Dịch Văn bản là một tiện ích mở rộng Chrome cho phép người dùng dịch văn bản đã chọn trên trang web hoặc nhập văn bản trực tiếp vào cửa sổ popup của tiện ích. Nó sử dụng API Gemini để cung cấp bản dịch chính xác giữa nhiều ngôn ngữ.

## Tính năng

- Dịch văn bản đã chọn trên bất kỳ trang web nào
- Dịch văn bản nhập qua cửa sổ popup của tiện ích
- Hỗ trợ nhiều ngôn ngữ: Tiếng Việt, Tiếng Anh, Tiếng Nhật và Tiếng Trung
- Tự động phát hiện ngôn ngữ nguồn
- Giao diện dễ sử dụng với tooltip cho dịch thuật trên trang
- Lựa chọn ngôn ngữ đích tùy chỉnh

## Cài đặt

1. Clone repository này hoặc tải xuống mã nguồn.
2. Mở Chrome và điều hướng đến `chrome://extensions/`.
3. Bật "Chế độ nhà phát triển" ở góc trên bên phải.
4. Nhấp vào "Tải tiện ích đã giải nén" và chọn thư mục chứa các tệp tiện ích mở rộng.

## Sử dụng

### Dịch Văn bản Đã chọn trên Trang Web

1. Chọn văn bản trên bất kỳ trang web nào.
2. Đối với từ đơn, bản dịch sẽ tự động xuất hiện trong một tooltip.
3. Đối với nhiều từ, nhấn phím 'T' để kích hoạt bản dịch.

### Dịch Văn bản qua Cửa sổ Popup của Tiện ích

1. Nhấp vào biểu tượng tiện ích trên thanh công cụ Chrome để mở cửa sổ popup.
2. Chọn ngôn ngữ đích mong muốn từ menu thả xuống.
3. Nhập văn bản bạn muốn dịch vào vùng văn bản.
4. Nhấp vào nút "Dịch" để xem kết quả dịch.

## Cấu hình

- Để thay đổi ngôn ngữ đích mặc định, mở cửa sổ popup của tiện ích và chọn ngôn ngữ mới từ menu thả xuống. Lựa chọn của bạn sẽ được lưu để sử dụng trong tương lai.

## Phát triển

Tiện ích mở rộng này được xây dựng bằng:

- HTML, CSS và JavaScript cho giao diện người dùng
- API Tiện ích mở rộng Chrome cho tích hợp trình duyệt
- API Gemini cho dịch vụ dịch thuật

Để sửa đổi hoặc mở rộng tiện ích:

1. Chỉnh sửa các tệp liên quan:
   - `popup.html` và `popup.css` cho giao diện người dùng popup
   - `popup.js` cho chức năng popup
   - `content.js` cho tính năng dịch trên trang
   - `background.js` cho quy trình nền và gọi API
2. Cập nhật tệp `manifest.json` nếu bạn thêm quyền hoặc script mới.
3. Tải lại tiện ích trong Chrome để xem các thay đổi của bạn.

## Credits

Tiện ích mở rộng này được phát triển bởi AI với sự cộng tác của [@d2luu](https://www.facebook.com/d2luu).

## License
