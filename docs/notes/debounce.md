# Debounce trong JavaScript

> Ghi chú tham khảo cho Bài 1/10 (`exercises/week1/01-debounce.js`). Bài đã hoàn thành
> (pass 5/5) — tài liệu này gồm cả lý thuyết và bản chuẩn đầy đủ để đối chiếu.

## Vì sao cần debounce?

Một số sự kiện bắn ra liên tục và rất nhanh — gõ phím trong ô search, resize cửa sổ, scroll.
Nếu xử lý (gọi API, tính toán nặng) ngay mỗi lần sự kiện bắn ra, bạn làm công việc đó hàng
chục lần một cách lãng phí trong khi người dùng còn đang gõ/kéo. Debounce giải quyết bằng
cách: **chỉ xử lý sau khi mọi thứ đã yên lặng đủ lâu** — gõ xong rồi mới gọi API, resize xong
rồi mới tính lại layout.

## Khối 1 — Closure giữ timer qua nhiều lần gọi

```js
function debounce(fn, delay) {
  let timer; // sống trong closure, không bị tạo lại mỗi lần hàm trả về được gọi
  return function (...args) {
    clearTimeout(timer); // huỷ lần hẹn giờ TRƯỚC (nếu có)
    timer = setTimeout(() => fn(...args), delay); // đặt lại từ đầu
  };
}
```

Insight cốt lõi: mỗi lần gọi, bạn **huỷ hẹn giờ cũ rồi đặt hẹn giờ mới**. Chỉ lệnh gọi
**cuối cùng** trong một chuỗi gọi liên tiếp sống sót đủ lâu để hẹn giờ của nó thực sự chạy.

## Khối 2 — Giữ đúng `this` của người gọi

Nếu `debounce` được gán làm method của một object (`obj.search = debounce(fn, 300)`),
`this` bên trong `fn` phải là `obj`, không phải `undefined`/global object.

```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {        // "ngoài function" — this động theo cách gọi
    clearTimeout(timer);
    timer = setTimeout(() => {       // "trong arrow" — mượn this của function bọc ngoài
      fn.apply(this, args);
    }, delay);
  };
}
```

Quy tắc nhớ: **ngoài function, trong arrow**. Hàm bọc ngoài phải là `function` thường để
`this` được bind đúng theo cách người gọi gọi nó; callback trong `setTimeout` nên là arrow
để tự động mượn lại đúng `this` đó (arrow không có `this` riêng).

## Khối 3 — Event loop: vì sao `setTimeout(fn, 0)` không chạy "ngay"

- Code đồng bộ luôn chạy hết trước.
- Microtask (`Promise.then`, `queueMicrotask`) chạy ngay khi call stack trống — trước mọi macrotask.
- Macrotask (`setTimeout`, `setInterval`, I/O) chạy sau khi hết microtask.

Vì vậy một `console.log` đặt trong `setTimeout(fn, 0)` LUÔN in ra sau mọi `Promise.then` đã
được xếp hàng trước đó, dù `setTimeout` được viết ở dòng code nào.

## Bản chuẩn đầy đủ (kèm `cancel()`)

```js
function debounce(fn, delay) {
  let timerId;
  function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }
  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}
```

## Lỗi đã gặp khi làm bài này

- Bài học về **tự kiểm tra chất lượng test**, không phải lỗi code: test `cancel()` đầu tiên
  gọi `cancel()` rồi gọi lại `debounced(3)` ngay sau đó — test này **pass dù `cancel()` để
  rỗng**, vì không chứng minh được gì. Chỉ khi viết thêm một test gọi `cancel()` rồi **không
  gọi gì nữa**, lỗi (nếu `cancel()` sai) mới lộ ra. Sau khi viết code, nên tự hỏi: "nếu tôi
  cố tình làm sai chỗ này, test có bắt được không?"

## Đọc thêm / biến thể (ngoài phạm vi bài gốc)

- **leading edge**: chạy NGAY ở lần gọi đầu tiên, rồi mới debounce các lần sau (lodash gọi
  là option `{ leading: true }`).
- **flush()**: chạy ngay lần đang chờ, thay vì đợi hết `delay`.
- `debounced()` hiện tại trả về `undefined` vì `fn` chạy sau `delay` — muốn lấy được kết
  quả của `fn`, `debounced()` cần trả về một Promise, resolve khi `fn` thực sự chạy xong.
