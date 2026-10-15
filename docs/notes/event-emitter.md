# Event Emitter đơn giản trong JavaScript

> Ghi chú tham khảo cho Bài 6/10 (`exercises/week1/06-event-emitter.js`). Bài đã hoàn
> thành (pass 9/9) — tài liệu này gồm cả lý thuyết, bản chuẩn, và một lỗ hổng tiềm ẩn
> chưa được test hiện tại bắt được.

## Vì sao cần hiểu EventEmitter?

Đây là cách hiện thực một pattern cực phổ biến: **Observer / Publish-Subscribe**. Một nơi
trung tâm đăng ký "ai quan tâm đến event nào", khi event xảy ra thì báo cho tất cả người đã
đăng ký đúng event đó. DOM events, Node.js `events` module, state management trong nhiều UI
framework đều dựa trên ý tưởng này.

## Khối 1 — Cấu trúc dữ liệu: "từ điển của các danh sách"

Khác với memoize (mỗi key ứng với 1 giá trị), mỗi event ở đây có thể có NHIỀU listener —
cần một bảng tra cứu mà mỗi "ô" chứa một DANH SÁCH, không phải 1 giá trị.

```js
on(event, listener) {
  if (!this.listeners[event]) {
    this.listeners[event] = []; // "get-or-create": tạo danh sách nếu chưa có
  }
  this.listeners[event].push(listener); // rồi thêm vào — áp dụng cho CẢ 2 trường hợp
}
```

"Get-or-create" là một motif rất chung, không riêng gì EventEmitter — gặp lại ở: nhóm dữ
liệu theo danh mục, danh sách kề (adjacency list) trong đồ thị, đếm tần suất kèm vị trí...

## Khối 2 — `off()`: xoá theo reference, không theo nội dung

```js
off(event, listener) {
  const list = this.listeners[event];
  if (!list) return;
  const index = list.indexOf(listener); // so sánh === — CÙNG 1 function reference
  if (index !== -1) list.splice(index, 1);
}
```
Hai hàm viết giống nhau 100% về nội dung nhưng khai báo riêng vẫn là 2 giá trị khác nhau
theo `===` — `off` chỉ gỡ đúng listener đã đăng ký bằng chính reference đó.

## Khối 3 — `once()`: không cần logic riêng trong `emit`

Insight quan trọng: `once` được xây dựa trên chính `on` + `off` đã có, bằng kỹ thuật
"self-unregistering wrapper":

```js
once(event, listener) {
  const wrapper = (...args) => {
    this.off(event, wrapper);        // tự gỡ CHÍNH NÓ trước
    listener.apply(this, args);      // rồi mới gọi listener gốc
  };
  this.on(event, wrapper);           // đăng ký WRAPPER, không phải listener gốc
}
```
Vì `off` so sánh theo reference, phải gỡ đúng `wrapper` (thứ thực sự nằm trong danh sách),
không thể gỡ bằng `listener` gốc — nó chưa từng được đăng ký trực tiếp. Gọi `off` TRƯỚC khi
gọi `listener` cũng an toàn hơn: nếu `listener` throw, việc tự gỡ đăng ký vẫn đã xảy ra.

## Bản chuẩn đầy đủ

```js
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event, listener) {
    const list = this.listeners[event];
    if (!list) return;
    const index = list.indexOf(listener);
    if (index !== -1) list.splice(index, 1);
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener.apply(this, args);
    };
    this.on(event, wrapper);
  }

  emit(event, ...args) {
    const list = this.listeners[event];
    if (!list) return;
    for (const listener of list.slice()) { // bản SAO — xem "lỗ hổng" bên dưới
      listener.apply(this, args);
    }
  }
}
```

## Lỗ hổng tiềm ẩn: lặp trên array sống trong `emit()`

Bài nộp dùng `this.events[event].forEach(...)` — lặp trực tiếp trên array **sống**. Bản
chuẩn lặp trên `list.slice()` — một **bản sao**.

**Vì sao cần bản sao:** nếu một listener đang được gọi giữa lúc `forEach` chạy mà chính nó
gọi `off()` (đúng điều `once()` làm — wrapper tự `off()` chính nó) và listener đó **không
phải phần tử cuối cùng** trong danh sách, `splice()` làm các phần tử phía sau **trượt lên
một vị trí** — `forEach`/`for...of` đang lặp theo index sẽ **bỏ qua** đúng 1 listener kế
tiếp (nó vừa trượt vào đúng vị trí đã được xử lý).

Bộ test hiện tại KHÔNG bắt được bug này vì thứ tự đăng ký trong test là `[on, once]` →
mảng là `[A, wrapper]` — `wrapper` nằm CUỐI, splice phần tử cuối không làm gì trượt. Nếu
đổi thứ tự thành `once()` TRƯỚC rồi `on()` SAU (mảng `[wrapper, A]`), splice `wrapper` ở
vị trí 0 sẽ làm `A` trượt về vị trí 0 — `forEach` đã đi qua "vị trí 0" rồi, sẽ bỏ qua `A`.

## Lỗi đã gặp khi làm

- `on()`: một phiên bản ban đầu luôn gán đè `this.events[event] = [listener]` ở cuối hàm
  (nằm ngoài, hoặc sau, nhánh `if`) — mất listener đã đăng ký trước đó mỗi lần `on()` được
  gọi lại cho cùng event.
- `off()`: `indexOf` tìm sai tầng (`this.events.indexOf(...)` thay vì
  `this.events[event].indexOf(...)`), và một phiên bản còn gọi `this.events(...)` như một
  hàm — `this.events` là dữ liệu, không phải function.
- Một lỗi gọi thiếu biến (`ReferenceError`) trong `off()` làm **crash toàn bộ script** —
  lỗi nằm NGOÀI `try/catch` của helper `check()` (chỉ bọc phần assertion, không bọc các dòng
  setup trước đó), nên 1 lỗi làm dừng mọi test phía sau, không chỉ test đang chạy bị FAIL.

## Đọc thêm (ngoài phạm vi bài gốc)

Node.js built-in `EventEmitter` có thêm: xử lý đặc biệt cho event tên `'error'` (nếu không
có listener nào cho `'error'`, Node sẽ throw/crash process thay vì âm thầm bỏ qua), cảnh báo
khi một event có quá nhiều listener (`maxListeners`, mặc định 10 — thường là dấu hiệu
memory leak do quên gỡ listener), và `emit()` trả về `boolean` cho biết có listener nào
được gọi hay không.
