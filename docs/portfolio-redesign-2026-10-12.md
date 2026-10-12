# Portfolio Chung Hy: trang chủ và hai cảnh chuyển động

Mục tiêu: khôi phục cảnh mở đầu, tạo cảnh kết thúc, đưa công việc lên trước các phần giới thiệu và viết hồ sơ bằng phần việc cụ thể. Tham khảo Huyml cho cách chào mở đầu; Cartooneast cho trình tự công việc, quá trình cá nhân và liên hệ. Nội dung nghiên cứu chi tiết giữ nguyên trong các trang hiện có.

Font ưu tiên: Calibri. Thiết kế dùng nền giấy, chữ đậm, nhân vật hiện có, khoảng trống và các khối nền để phân nhóm; không dùng đường viền trang trí.

## Nguồn nội dung

Đối chiếu trang chủ hiện có, hồ sơ `consulting_profile_hy.md`, hồ sơ công bố trong `portfolio/assets/data/claims-registry.json`, mẫu CV The Trainee Club và phần viết CV của `BUOI-1_RTMT.pptx`. Tài liệu mẫu được dùng làm hướng dẫn viết, không dùng thành tích ví dụ làm thành tích của Hy. Ngày FPT theo trang chủ hiện có: 03–05/2025; không dùng ngày 2023–2024 trong bản CV cũ.

1Office: phân tích yêu cầu, đề xuất quy trình và đào tạo nội bộ. FPT: đề xuất nghiên cứu và cấu trúc thông tin. Không bổ sung tỷ lệ cải thiện hay mô tả đề xuất như một hệ thống đã triển khai. Chương Springer giữ DOI 10.1007/978-981-96-4116-1_9; bài dinh dưỡng giữ bối cảnh hồ sơ hội nghị FCBEM 2025. Các năng lực tự đánh giá được thay bằng công việc, công cụ và đầu ra cụ thể.

## Tệp chính

- `portfolio/index.html`, `portfolio/styles/home-v2.css`: trang chủ, nội dung VI/EN và bố cục trên điện thoại.
- `portfolio/js/opening-motion.js`: mở đầu toàn màn hình, bỏ qua, phát lại, dự phòng khi ảnh hoặc JavaScript gặp lỗi.
- `portfolio/js/mascot-motion.js`: chuyển động bàn tay và thân nhân vật.
- `portfolio/js/closing-motion.js`: bước vào, cúi chào nhẹ và vẫy tay; dùng chung cho trang và video.
- `portfolio/js/portfolio-home.js`: ngôn ngữ, mục lục, điều khiển cảnh kết thúc.
- `portfolio/motion-review.html`: xem và tải hai video.
- `portfolio/assets/video/chung-hy-opening-v2.mp4`: H.264, 1280 × 720, 30 fps, 8,7 giây.
- `portfolio/assets/video/chung-hy-closing-v2.mp4`: H.264, 1280 × 720, 30 fps, 6,2 giây.
- `scripts/export-portfolio-films.mjs`: xuất khung hình từ cùng các cảnh, sau đó mã hóa MP4 bằng FFmpeg. Chạy khi bản xem trước đang mở. Playwright và Chrome là công cụ xuất, không phải thành phần chạy trên website. Có thể đặt `PORTFOLIO_PLAYWRIGHT_MODULE`, `PORTFOLIO_CHROME`, `PORTFOLIO_FFMPEG` và `PORTFOLIO_PREVIEW_URL` theo máy chạy.

Mở đầu chạy khi truy cập trang mới; liên kết đến một mục cụ thể mở thẳng mục đó. Người dùng bật giảm chuyển động thấy hình tĩnh và đọc nội dung ngay. Trang vẫn đọc được khi JavaScript bị tắt.

## Nhân vật kết thúc

Được tạo qua công cụ imagegen tích hợp, bởi agent GPT 6 Luna theo yêu cầu của Hy. Công cụ tạo ảnh không trả metadata model của bộ sinh ảnh. Nguồn tham chiếu: `portfolio/assets/chung-hy-mascot-greeting-v1.png`. Tệp mới: `portfolio/assets/chung-hy-mascot-closing-v2.png` và `.webp`, 1024 × 1536, có alpha. Các nhân vật và video cũ được giữ nguyên.

Prompt đã dùng:

```text
Use case: stylized-concept
Asset type: transparent full-body mascot illustration for the closing scene of a professional portfolio
Primary request: Create a full-body standing goodbye pose of the same recognizable character shown in Image 1, which is a visual identity reference. Preserve his Vietnamese young-man identity, short black textured hair, round thin glasses, friendly proportionate face, navy suit, and white shirt. He stands relaxed with one hand waving goodbye and the other holding one slim plain cream folder. Both feet are grounded and fully visible.
Input images: Image 1: visual reference for the mascot's exact felt 3D character identity and materials; do not copy its background.
Scene/backdrop: actual transparent background, isolated character only
Style/medium: high-quality 3D chibi figure made from tactile soft felt, consistent with Image 1
Composition/framing: centered full-body portrait with comfortable transparent margin; show the entire figure and both shoes, no cropping
Lighting/mood: clean soft studio lighting, warm and professional, friendly farewell
Materials/textures: visible soft felt fibers and stitched fabric details consistent with Image 1
Text (verbatim): none
Constraints: preserve the character identity and outfit from Image 1; natural relaxed proportions; one waving hand; other hand holding one slim plain cream folder; grounded feet; transparent alpha background
Avoid: any text, logos, brands, extra objects, scenery, floor, shadow backdrop, board, screenshot, additional characters, cropped limbs or feet.
```

## Kiểm tra

Bản dựng và kiểm tra liên kết nội bộ đã đạt. Kiểm tra trên trình duyệt gồm mở đầu tự chạy, bỏ qua, chuyển VI/EN, phát lại và tạm dừng kết thúc, mục lục điện thoại, ảnh, tràn ngang ở 390/320px, giảm chuyển động và trang không JavaScript. Bằng chứng cục bộ trong `.audit/portfolio-redesign-evidence/`; bản trước sửa và danh sách thay đổi có sẵn trong `.audit/portfolio-redesign-before/`.

Lệnh audit external mặc định chỉ quét HTML ở gốc và không bao phủ trang chủ đang hoạt động. Đã kiểm tra riêng các liên kết ngoài của `portfolio/index.html`. Trạng thái công khai phải được xác nhận sau khi GitHub Pages triển khai.

## Thay đổi có sẵn ngoài phạm vi

Giữ nguyên, không đưa vào commit này: `.github/workflows/deploy-pages.yml`, `package.json`, `package-lock.json`, `404.html`, `portfolio/404.html`, `portfolio/research-arts-workshop.html`, `portfolio/research-buffet.html`, `portfolio/research-motorbike-ban.html`, `scripts/build-images.mjs`, `scripts/check-site-local.mjs` và `styles/research-ev-immersive.css`. Các bản render/video cũ, thư mục font, ảnh nghiên cứu chưa được theo dõi và tệp tạm cũng được giữ lại.
