# Portfolio: thẻ nhân vật chuyển động cạnh hồ sơ

Yêu cầu điều chỉnh của Hy: giữ phần mở đầu đã chọn, bỏ footer và nút bỏ qua, tăng hoạt họa, đặt ảnh chuyển động cạnh hồ sơ theo mẫu Cartooneast.

Trang chủ dùng một thẻ video lớn bên trái; thông tin hồ sơ và danh sách công việc nằm bên phải. Thẻ nhân vật giữ vị trí khi người xem cuộn qua hai phần này. Trên điện thoại, hai phần xếp dọc. Footer, cảnh liên hệ lớn cuối trang, nút bỏ qua và nút xem lại mở đầu đã được gỡ khỏi trang chủ. Liên hệ được đặt trong phần hồ sơ. Video mở đầu đã xuất trước đó được giữ nguyên.

## Chuyển động và tệp

- `portfolio/assets/video/chung-hy-profile-loop-v3.mp4`: vòng lặp im lặng 9 giây, H.264, 720 × 900, 30 fps. Nhân vật vẫy tay, nghiêng đầu và đổi sang tư thế chỉ vào hồ sơ qua một lớp giấy chuyển cảnh.
- `portfolio/assets/chung-hy-profile-film-v3-poster.webp`: hình tĩnh dự phòng, dùng khi giảm chuyển động hoặc trình duyệt không phát video.
- `portfolio/assets/chung-hy-mascot-profile-point-v3.png` và `.webp`: tư thế nhân vật mới, có alpha, 1024 × 1536.
- `portfolio/js/profile-film.js`: dựng chuyển động bàn tay, đầu và vai bằng WebGL; kết hợp hai tư thế trên Canvas.
- `scripts/export-profile-film.mjs`: xuất khung hình và mã hóa MP4 bằng FFmpeg. Dùng cùng các biến môi trường runtime như script xuất video trước đó.
- `portfolio/js/portfolio-home.js`: phát video khi thẻ đang xuất hiện, dừng khi ra khỏi vùng nhìn; điều khiển thẻ quy trình, hội thoại, hiệu ứng cuộn và chuyển ngôn ngữ.

Các thẻ quy trình thay đổi thứ tự hiển thị; hội thoại hiện câu trả lời theo từng nhịp; hình nghiên cứu xoay nhẹ và nhấc lên khi trỏ vào. Nội dung hiện lần đầu khi cuộn tới. Người bật giảm chuyển động thấy poster và nội dung tĩnh. Font ưu tiên Calibri; không thêm đường viền trang trí.

## Ảnh bổ sung

Một agent GPT 6 Luna tạo tư thế chỉ tay qua công cụ imagegen tích hợp. Công cụ tạo ảnh không trả metadata về model sinh ảnh. Nguồn tham chiếu là nhân vật chào hỏi đã có trong dự án. Đã kiểm tra alpha và ảnh trên nền sáng.

Prompt đã dùng:

```text
Use case: stylized-concept
Asset type: transparent full-body character illustration for a website profile card animation frame.
Input image: Image 1 is the strict identity, style, proportions, wardrobe, and camera framing reference.
Scene/backdrop: genuinely transparent background with clean natural alpha, no floor or visible ground plane.
Subject: the same Vietnamese young man depicted as a friendly felt chibi, short black hair, thin round glasses, navy suit, white shirt. Match the reference character's face, head-to-body proportions, outfit details, material texture, soft studio lighting, and scale.
Composition/framing: vertical full-body portrait, camera and subject position/crop as close as possible to the reference; show the entire head, both legs, both shoes, and both feet fully with comfortable transparent margin. Standing upright on level invisible ground. His right hand, on the viewer's right, points outward to the right toward profile text outside the frame with a clear index finger gesture; other arm relaxed naturally at his side. Friendly welcoming expression.
Style/medium: finely detailed soft felt and stitched fabric chibi character, same tactile look as reference, polished studio character render.
Lighting/mood: soft warm studio light consistent with reference.
Text (verbatim): none.
Constraints: preserve the exact mascot identity from Image 1, including youthful Vietnamese features, hairstyle, thin round glasses, navy suit, white shirt, overall body proportions, and soft felt construction. Keep full body and both feet inside frame. Actual transparent background.
Avoid: text, letters, symbols, props, platform, ground shadow, border, watermark, extra people, cropped limbs, waving gesture, leftward pointing.
```

Bản trước sửa trong `.audit/motion-v3-before/`; ảnh kiểm tra và kết quả runtime trong `.audit/motion-v3-evidence/`. Các thay đổi có sẵn ở cấu hình, công cụ build và trang nghiên cứu được giữ riêng, không nằm trong lần cập nhật này.
