# Spec: Hệ thống luyện phỏng vấn Mobile Developer (RN & Flutter)

## 1. Mục tiêu & bối cảnh

Chuẩn bị cho các buổi phỏng vấn vị trí Mobile Developer (React Native & Flutter), dựa trên hồ sơ thực tế: 4 năm kinh nghiệm tại TMA Innovation Park (Quy Nhơn), từng chủ trì migration React Native v0.67 → v0.77.3, tích hợp WebRTC (Perso AI SDK + signaling client tự viết cho AWS Kinesis), xây dựng app kiosk nhận diện khuôn mặt on-device (TFLite/MobileFaceNet) cho viện dưỡng lão, và dự án cá nhân LexiCore (Flutter + React/Next.js, backend AI-assisted).

Lỗ hổng gốc cần xử lý (tự nhận diện): quen dùng AI autocomplete từ 2024 nên phản xạ code tay yếu, chưa thạo breakpoint debugging, công ty cũ chỉ yêu cầu "build chạy" chứ chưa ép viết logic thật.

Hai mảng luyện tập bổ trợ cho nhau:
- **Kỹ năng tay** (code logic + debug) — lộ trình 4 tuần.
- **Kỹ năng trả lời/bảo vệ narrative** — 7 kịch bản phỏng vấn mô phỏng các phong cách interviewer khác nhau.

## 2. Kho tài liệu nguồn (artifacts)

Toàn bộ nội dung chi tiết hiện sống dưới dạng Claude Artifact (private, owned by user). Spec này là **index + đánh giá**, không copy toàn văn — xem trực tiếp artifact để lấy nội dung đầy đủ.

| # | Tên | Link | Vai trò |
|---|-----|------|---------|
| 0 | 🔧 Lộ trình luyện Live Coding 4 tuần (RN & Flutter) | [artifact](https://claude.ai/artifact/Mc6uMDswNQASJu1ugNu54B) | Luyện tay: code logic + breakpoint debug |
| 1 | 🛠️ Kịch bản 1 — Technical Deep-Dive (Tech Lead/Senior) | [artifact](https://claude.ai/artifact/EoX3ih6itBntgLkaw6cKay) | Phỏng vấn kỹ thuật sâu, hỏi dồn từng lớp |
| 2 | 🤝 Kịch bản 2 — HR/Recruiter Screening Call | [artifact](https://claude.ai/artifact/SMCwTPq9rbKHYnTm61rwkB) | Vòng sàng lọc, câu hỏi con người/lương/motivation |
| 3 | 💡 Kịch bản 3 — Panel tại công ty Product | [artifact](https://claude.ai/artifact/4fymTShc64c1cGUBHeh4E9) | Pha trộn tư duy kỹ thuật + sản phẩm/người dùng |
| 4 | 🌐 Kịch bản 4 — Formal English Interview (STAR) | [artifact](https://claude.ai/artifact/GEg3fTbutdXc7jowD4E93U) | Phỏng vấn tiếng Anh, công ty nước ngoài, cấu trúc STAR |
| 5 | 🔥 Kịch bản 5 — Stress/Skeptical Interview | [artifact](https://claude.ai/artifact/N6QpobGDjYswf9DVntWDoi) | Hoài nghi, khiêu khích, tra vấn CV/số liệu |
| 6 | 📘 Kịch bản 6 — Fundamentals Check: Flutter & Dart | [artifact](https://claude.ai/artifact/HnXiCW1D7sNoMognqTKTYS) | Kiến thức nền không gắn CV (lifecycle, Isolate, keys...) |
| 7 | 📗 Kịch bản 7 — Fundamentals Check: RN & JS/TS | [artifact](https://claude.ai/artifact/PVX7L1DgZ9Hrrb2AVb5QCf) | Kiến thức nền RN/JS/TS (hooks, reconciliation, DI...) |

## 3. Đánh giá nội dung

### Điểm mạnh

- **Cơ chế "xoáy tiếp" (follow-up drill-down) là giá trị cốt lõi**, không phải các câu trả lời mẫu. Mỗi câu hỏi chính có 3 hướng trả lời (an toàn/đào sâu kỹ thuật/đóng khung kinh doanh) cộng một câu hỏi xoáy nhằm đúng điểm yếu của câu trả lời đó — ví dụ ranh giới code-tay-vs-AI-viết ở LexiCore, liệu PM có xác nhận đúng câu chuyện, "chủ trì" migration nghĩa là gì khi chỉ làm một mình. Đây gần như một cơ chế tự kiểm chứng (self-red-team) cho narrative, hiếm thấy trong tài liệu luyện phỏng vấn thông thường.
- **Narrative nhất quán xuyên suốt 7 kịch bản khác nhau** — không lệch số liệu/câu chuyện giữa các ngữ cảnh (deep-dive, HR, product panel, STAR tiếng Anh, stress interview).
- **Thành thật có chủ đích**: nhiều câu trả lời xoáy chọn phương án nhận giới hạn thật (chưa validate threshold bằng số liệu lớn, từng ước tính sai lần nữa sau bài học đầu, không có công nhận chính thức khi mentor) — tài liệu luyện survive-under-scrutiny, không chỉ luyện để "nghe hay".
- **2 bài fundamentals check khớp đúng lỗ hổng đã tự nhận diện** trong lộ trình 4 tuần (Isolate, Widget/Element/RenderObject, stale closure, JSI/Fabric/TurboModules) — kiến thức lý thuyết và luyện tay nhắm cùng một điểm yếu, không trùng lặp vô ích.

### Lỗ hổng / điểm cần quyết định thêm

1. **Lộ trình 4 tuần và 7 kịch bản đang tách biệt.** Tuần 4 ngày 3 ("mock có người quan sát") không trỏ cụ thể vào kịch bản nào — nên map rõ: kịch bản nào luyện ở ngày nào.
2. **Không có "facts sheet" trung tâm.** Các số liệu (timeline migration 2-3 tháng, ~1700 test ở LexiCore, mức lương kỳ vọng...) lặp lại rải rác ở nhiều kịch bản. Nếu một số liệu cần sửa, phải sửa ở nhiều nơi — rủi ro lệch dữ liệu giữa các file.
3. **Chưa có kịch bản System Design** — 7 kịch bản hiện có nghiêng về behavioral + kiến thức nền + bảo vệ narrative CV, chưa có dạng "thiết kế hệ thống quy mô lớn" (vd. thiết kế offline-first sync, thiết kế hệ thống chat/realtime từ đầu) thường gặp ở vòng phỏng vấn senior.
4. **Nội dung chỉ sống trên claude.ai artifact**, chưa có bản local trong git. Người dùng có làm việc cả ở máy Windows tại nhà (chỉ có lexi-core, TrailLog) — nếu máy đó không mở được các link này, nội dung luyện tập không portable. (Theo quyết định ở mục 6, spec này chỉ index + link, chưa giải quyết triệt để điểm này — xem "Known gaps".)
5. **Không có time-budget rõ ràng** cho lộ trình 4 tuần (giờ/ngày), khó đánh giá tính khả thi song song với công việc chính.
6. **Thiếu bài luyện riêng cho "hỏi lại yêu cầu trước khi code"** — kỹ năng này chỉ xuất hiện gián tiếp, chưa có bài tập timed riêng.

## 4. Cấu trúc luyện tập đề xuất (map roadmap ↔ kịch bản)

| Tuần | Trọng tâm | Kịch bản liên quan nên ôn song song |
|------|-----------|--------------------------------------|
| 1 | Code tay + breakpoint | — (thuần kỹ năng tay) |
| 2 | RN logic patterns | Kịch bản 7 (Fundamentals RN/JS-TS) — ôn sau mỗi buổi code để nối lý thuyết với tay |
| 3 | Flutter logic patterns | Kịch bản 6 (Fundamentals Flutter/Dart) |
| 4 Ngày 1-2 | Mock machine coding 45p | — |
| 4 Ngày 3 | Mock có người quan sát | Kịch bản 1 (Tech Deep-Dive) hoặc Kịch bản 5 (Stress) — chọn 1, luân phiên nếu có nhiều buổi mock |
| 4 Ngày 4 | Debug codebase lạ | — |
| 4 Ngày 5 | Ôn kiến thức nền + ghép logic | Kịch bản 6 & 7, cộng thêm Kịch bản 2/3/4 nếu buổi phỏng vấn thật có vòng HR/Product/English |

Gợi ý thứ tự ôn 7 kịch bản nếu có lịch phỏng vấn thật sắp tới: **Kịch bản 2 (HR) → Kịch bản 6/7 (fundamentals) → Kịch bản 1 (Tech deep-dive) → Kịch bản 3 (Product panel) → Kịch bản 5 (Stress) → Kịch bản 4 (English STAR)** — từ nhẹ đến nặng, kỹ thuật thuần trước, English/stress sau cùng vì đòi hỏi tổng hợp cả hai.

## 5. Checklist hoàn thành (từ lộ trình 4 tuần)

- [ ] Viết được cả 10 hàm JS/TS thuần ở Tuần 1 mà không cần nhìn lại đáp án cũ
- [ ] Tự tin đặt breakpoint, step qua code, xem biến trong cả 2 IDE (RN & Flutter) không cần nghĩ lâu
- [ ] Làm xong ít nhất 8/10 bài logic nút ở Tuần 2-3 trong đúng giới hạn thời gian đặt ra
- [ ] Tự sửa được 1 codebase lạ hoàn toàn chưa từng thấy (Tuần 4 Ngày 4) trong 30 phút
- [ ] Xem lại video narrate của chính mình mà không thấy ngắc ngứ quá nhiều, không im lặng kéo dài >10s
- [ ] Trả lời được câu hỏi kiến thức nền (Kịch bản 6/7) ngay cả khi bị hỏi xoáy tiếp theo
- [ ] Trả lời được câu hỏi xoáy ở Kịch bản 1/3/4/5 mà không mâu thuẫn với câu trả lời chính (narrative nhất quán)

## 6. Known gaps / Explicitly out of scope

- **Chưa transcribe toàn văn 7 kịch bản vào markdown local** — quyết định có chủ đích để giữ spec gọn nhẹ; nội dung đầy đủ vẫn chỉ truy cập được qua link claude.ai ở mục 2. Nếu cần làm việc offline hoặc từ máy không mở được các link này, cần một task riêng để copy nội dung.
- **Không có facts sheet trung tâm cho số liệu CV** (timeline, số liệu test, mức lương) — nên tách riêng nếu số liệu cần cập nhật đồng bộ.
- **Không có kịch bản System Design.**
- **Không có time-budget (giờ/ngày) cho lộ trình 4 tuần.**
- **Không kiểm tra riêng TypeScript generics/async typing** ngoài phần đã có ở Kịch bản 7 câu 9.
- **Không có bài luyện riêng "hỏi lại yêu cầu trước khi code"** như một exercise timed độc lập.

## 7. Resources

- Dự án thực hành dùng để luyện breakpoint/sửa bug (theo lộ trình 4 tuần): **LexiCore** (`Desktop/lexi-core`), **cPlat** (`/Users/dmtung/Desktop/cPlat`), **TrailLog** (`Desktop/TrailLog`).
- Ghi chú môi trường: máy Mac công ty có sẵn cPlat/seniorcare và các dự án công ty khác; máy Windows ở nhà chỉ có lexi-core và TrailLog — cân nhắc khi lên lịch luyện tập cần truy cập một dự án cụ thể.

## 8. Vòng lặp luyện tập tương tác (exercises/)

Bài tập Tuần 1 (10 hàm JS/TS thuần) được hiện thực hóa thành file chạy được thật, không chỉ mô tả trong tài liệu:

- Vị trí: `exercises/week1/NN-ten-bai.js` — mỗi file có stub hàm cần implement + một bộ self-test chạy ngay khi gọi `node exercises/week1/NN-ten-bai.js` (dùng `node:assert`, không cần cài thêm gì).
- Quy trình mỗi bài: Claude ra đề (mô tả yêu cầu, không gợi ý cách làm) → người luyện tự code vào stub → tự chạy file để xem pass/fail → báo đã xong → Claude đọc code, tự chạy lại để xác nhận, rồi chấm (đúng/sai, edge case bị sót, cách tốt hơn nếu có) → sửa hoặc chuyển bài tiếp theo.
- Sau khi hoàn thành mỗi bài: kiến thức lý thuyết, lỗi đã gặp, phần trả lời câu xoáy và việc còn dọn được ghi thành block `GHI CHÚ KIẾN THỨC` ở **cuối chính file bài tập**. Mục 9 của spec chỉ giữ trạng thái ngắn gọn, không chứa kiến thức.
- Nguyên tắc: không đưa gợi ý/hint ở lần làm đầu tiên của mỗi bài; gợi ý/refactor chỉ xuất hiện ở bước chấm sau khi đã có lời giải.
- Nguồn tra cứu khi bị kẹt: tài liệu chính thức (MDN, Node.js docs...) được phép dùng để tra cú pháp/API quên; **không** dùng bất kỳ AI model nào (ChatGPT, Claude khác, Copilot/Cursor autocomplete, hoặc hỏi xin lời giải) và không tìm "cách giải bài X" trên Google/StackOverflow — cả hai đều tương đương với việc được mách lời giải, phá mất mục đích luyện phản xạ tay.

## 9. Tiến độ Tuần 1 (cập nhật liên tục)

Bảng theo dõi để tiếp tục đúng chỗ khi đổi máy (công ty ⇄ nhà) — cập nhật mỗi khi hoàn thành một bài.

| # | Bài | File | Trạng thái |
|---|-----|------|-----------|
| 1 | debounce | `exercises/week1/01-debounce.js` | ✅ Done — pass 5/5 test |
| 2 | throttle | `exercises/week1/02-throttle.js` | ✅ Done — pass 8/8 test |
| 3 | deep clone object | `exercises/week1/03-deep-clone.js` | ✅ Done — pass 9/9 test |
| 4 | flatten nested array | `exercises/week1/04-flatten.js` | ✅ Done — pass 8/8 test |
| 5 | memoize | `exercises/week1/05-memoize.js` | 🟡 Đang làm — file đã tạo, chưa implement |
| 6 | event emitter đơn giản | `exercises/week1/06-event-emitter.js` | ⬜ Chưa tạo |
| 7 | retry-with-backoff cho 1 Promise | `exercises/week1/07-retry-backoff.js` | ⬜ Chưa tạo |
| 8 | giới hạn số Promise chạy đồng thời | `exercises/week1/08-concurrency-limit.js` | ⬜ Chưa tạo |
| 9 | LRU cache đơn giản | `exercises/week1/09-lru-cache.js` | ⬜ Chưa tạo |
| 10 | parse query string → object | `exercises/week1/10-parse-query-string.js` | ⬜ Chưa tạo |

**Lưu ý khi đổi máy:** đã tách thành git repo độc lập, remote `https://github.com/dmTung99-dev/PraticeLivecode` (tên repo/thư mục là `PraticeLivecode`). Máy Windows ở nhà: `D:\Flutter\PraticeLivecode`. Đổi máy thì `git pull` trước khi làm, `git push` sau mỗi bài. Không push thư mục này qua remote công ty.
