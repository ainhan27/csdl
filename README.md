# CSDL · Ôn tập Cơ sở dữ liệu

Website tiếng Việt gồm 5 chương. Phần lý thuyết tổng hợp từ các PDF bài giảng và ghi số trang theo từng mục. Ngân hàng giữ nguyên đề của 289 câu trắc nghiệm và 6 câu tự luận trong **ÔN TẬP CSDL.docx**.

- **Làm bài thi** lấy ngẫu nhiên 45 câu đã đối chiếu trong chương ở mỗi lượt. Trả lời đủ 45 câu và nộp bài để xem điểm, đáp án và lời giải.
- **Luyện tập** xáo trộn toàn bộ câu hỏi trong chương ở mỗi lượt. Chọn đáp án để xem lời giải ngay.
- **Luyện câu sai** lấy các câu đã xác minh mà lần trả lời gần nhất bị sai. Chương 5 có 6 câu tự luận và lưu bản nháp. Tiến độ, các câu luyện tập đã chọn và bài thi đã nộp và bản nháp được lưu bằng localStorage trên trình duyệt.

## Chạy trên máy

Dùng Node.js 22 trở lên.

```bash
npm ci
npm run dev
npm test
npm run build
```

## Cập nhật nội dung

Mỗi chương có một tệp `src/content/chapter-N.json`. Giữ nguyên `id` của các câu hiện có để tiến độ trên thiết bị vẫn khớp.

- Trong `theory`, dùng `title`, `text` và `source` cho tiêu đề, nội dung và số trang bài giảng. Dùng ký tự xuống dòng để chia đoạn và trường `example` để hiện mã hoặc công thức trong khối riêng. Trường tùy chọn `diagram` gồm `title`, `steps` (cặp nhãn và mô tả), `note` và `flow` để hiện sơ đồ hoặc các khối so sánh.
- Trong `questions`, dùng `id` duy nhất, `number`, `text`, bốn `options`, `answer` và `explanation`.
- Với đáp án đã đối chiếu, dùng chỉ số từ `0` đến `3` tương ứng A đến D và ghi lời giải vào `explanation`. Khi chưa thể chốt đáp án, đặt `answer: null` và ghi lý do kiểm chứng vào `explanation` nếu có. Câu này xuất hiện trong Luyện tập với nhãn “Cần kiểm chứng” và nằm ngoài điểm số.
- Trong `cases` của Chương 5, dùng `id` duy nhất, `number`, `title` và danh sách `paragraphs`.

## GitHub Pages

Trong **Settings → Pages → Build and deployment**, chọn **GitHub Actions**. Workflow `.github/workflows/pages.yml` chạy kiểm thử, build và triển khai khi có cập nhật lên `main`. Có thể chạy thủ công từ tab Actions. Vite lấy tên repo từ `GITHUB_REPOSITORY` để đặt đường dẫn gốc. Các trang con dùng định tuyến hash.

Để kiểm tra bản build với đường dẫn của repo hiện tại, chạy các lệnh sau.

```bash
GITHUB_REPOSITORY=ainhan27/csdl npm run build
GITHUB_REPOSITORY=ainhan27/csdl npm run preview
```
