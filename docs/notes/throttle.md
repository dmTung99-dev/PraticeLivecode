# Throttle trong JavaScript

> Ghi chú tham khảo cho Bài 2/10 (`exercises/week1/02-throttle.js`). Bài đã hoàn thành
> (pass 8/8) — tài liệu này gồm cả lý thuyết và bản chuẩn đầy đủ để đối chiếu.

## Vì sao cần throttle, và khác debounce ở đâu?

Debounce và throttle đều giảm tần suất xử lý một sự kiện bắn liên tục, nhưng theo 2 hướng
ngược nhau:

- **Debounce**: đợi YÊN LẶNG đủ lâu rồi mới chạy — lấy lần gọi **CUỐI**. Dùng cho search-as-you-type.
- **Throttle**: chạy tối đa 1 lần mỗi khoảng thời gian cố định — lấy lần gọi **ĐẦU** của mỗi
  cửa sổ, bỏ qua phần còn lại. Dùng cho scroll, kéo thả, chặn bấm nút liên tục — những
  trường hợp bạn vẫn muốn có phản hồi **đều đặn**, không phải chỉ một lần ở cuối.

## Khối 1 — Hai cách hiện thực

| | Cờ (flag) + `setTimeout` | Timestamp (`Date.now()`) |
|---|---|---|
| Cách hoạt động | Mỗi cửa sổ tạo 1 timer, cờ chặn gọi lại | So thời gian hiện tại với lần chạy gần nhất |
| Khi event loop bị block | Timer có thể trễ, chờ call stack trống | Tính theo thời gian thực, không bị ảnh hưởng |
| Giữ Node process sống | Timer đang chờ giữ process | Không giữ process |
| Mở rộng thêm trailing call | Dễ (đã có sẵn timer) | Phải thêm timer riêng |

```js
// Cách cờ + setTimeout
function throttle(fn, interval) {
  let isThrottled = false;
  function throttled(...args) {
    if (isThrottled) return;
    isThrottled = true;
    setTimeout(() => { isThrottled = false; }, interval);
    fn.apply(this, args);
  }
  return throttled;
}
```

## Khối 2 — Thứ tự lệnh quan trọng khi `fn` có thể throw

Có 2 cách viết SAI dễ mắc:

- **Sai 1**: gọi `fn()` rồi mới bật cờ → nếu `fn` throw, dòng bật cờ không bao giờ chạy tới
  → throttle mất tác dụng (cờ không bao giờ được bật).
- **Sai 2**: bật cờ → gọi `fn()` → rồi mới `setTimeout` → nếu `fn` throw, dòng `setTimeout`
  không chạy tới → cờ bật vĩnh viễn, **throttle bị khoá chết, không bao giờ mở lại được**.

**Đúng**: bật cờ + hẹn giờ mở cờ **TRƯỚC**, rồi mới gọi `fn` (như code ở Khối 1) — hoặc
dùng `try/finally` nếu muốn tách rõ phần "dọn dẹp" ra khỏi luồng chính.

## Khối 3 — Khi event loop bị block (câu hỏi xoáy hay gặp)

Giả sử một tác vụ đồng bộ chạy 200ms, trong khi `interval` throttle là 50ms:

- **Cách timer**: callback mở cờ đã đến hạn ở mốc 50ms, nhưng không chạy được vì call stack
  đang bận chạy tác vụ đồng bộ — nó chỉ chạy được khi call stack trống (~200ms). Cửa sổ thực
  tế ≈ `max(interval, thời gian block)` ≈ 200ms, **không phải** 250ms.
- **Cách timestamp**: `Date.now()` vẫn tăng đều trong lúc đó — ngay khi code đồng bộ gọi
  `throttled()` tiếp (sau 200ms), nó thấy đã đủ 50ms từ lần chạy trước và cho chạy lại ngay,
  không cần chờ thêm.
- Lưu ý: điều này chỉ áp dụng khi CHÍNH đoạn code đồng bộ đó gọi `throttled()`. Một event từ
  bên ngoài (click, scroll) luôn phải xếp hàng chờ call stack trống, không thể chen ngang.

## Bản chuẩn đầy đủ

```js
function throttle(fn, interval) {
  let isThrottled = false;
  function throttled(...args) {
    if (isThrottled) return;
    isThrottled = true;
    setTimeout(() => { isThrottled = false; }, interval);
    fn.apply(this, args);
  }
  return throttled;
}
```

Code tự viết trong bài đã khớp đúng bản chuẩn này — không có lỗ hổng theo đúng phạm vi đề
(không yêu cầu trailing call).

## Đọc thêm / biến thể (ngoài phạm vi bài gốc)

- **Trailing call**: tự động chạy lại lần gọi cuối bị bỏ qua, ngay sau khi hết `interval`
  (lodash hỗ trợ cả `{ leading, trailing }`).
- `(x) => expr` (không có `{}`) tự trả về `expr`; `(x) => { ... }` (có `{}`) phải viết
  `return` rõ ràng — `if` là câu lệnh (statement), không phải biểu thức, nên không viết được
  dạng arrow không `{}` quanh một `if`.
