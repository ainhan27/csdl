# MIS2001 · Ôn tập Cơ sở dữ liệu

Website tiếng Việt gồm 5 chương, ngân hàng 289 câu trắc nghiệm và 6 câu tự luận từ tài liệu **ÔN TẬP CSDL.docx**. Lý thuyết, thuật ngữ và bài tập bổ sung của chương 1–4 được ghi nhãn riêng trong giao diện. Tiến độ, kết quả đã nộp và bản nháp tự luận lưu trên trình duyệt bằng localStorage.

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

- Thêm mục lý thuyết vào `theory` với `title` và `text`.
- Thêm thuật ngữ vào `terms` với `term`, `english` và `definition`.
- Thêm câu hỏi vào `questions` với `id` duy nhất, `number`, `text`, bốn `options`, `answer` và `explanation`.
- Với đáp án đã đối chiếu, dùng chỉ số từ `0` đến `3` tương ứng A đến D và ghi lời giải vào `explanation`. Khi chưa xác minh, đặt `answer: null` và `explanation: null`. Các câu đó hiện “Cần kiểm chứng” và nằm ngoài điểm số và danh sách câu sai.
- Thêm bài tự luận hoặc tình huống vào `cases` với `id` duy nhất, `title` và danh sách `paragraphs`. Dùng `supplemental: true` cho bài tự biên soạn.

Chương 5 hiện có câu tự luận theo tài liệu. Mục Trắc nghiệm của chương này dẫn tới Case Study.

## GitHub Pages

Trong **Settings → Pages → Build and deployment**, chọn **GitHub Actions**. Workflow `.github/workflows/pages.yml` chạy kiểm thử, build và triển khai khi có cập nhật lên `main`. Có thể chạy thủ công từ tab Actions. Vite lấy tên repo từ `GITHUB_REPOSITORY` để đặt base path, và các trang con dùng định tuyến hash để mở trực tiếp trên Pages.

Để kiểm tra bản build với base path của repo hiện tại, chạy:

```bash
GITHUB_REPOSITORY=ainhan27/csdl npm run build
GITHUB_REPOSITORY=ainhan27/csdl npm run preview
```
