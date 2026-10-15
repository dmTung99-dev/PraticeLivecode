# Memoize trong JavaScript

> Ghi chú tham khảo cho Bài 5/10 (`exercises/week1/05-memoize.js`). Bài đã hoàn thành
> (pass 8/8) — tài liệu này gồm cả lý thuyết và bản chuẩn đầy đủ để đối chiếu.

## Vì sao cần memoize?

Nếu một hàm **thuần** (pure — cùng input luôn ra cùng output, không side effect) tốn kém
để tính và thường được gọi lại với cùng input, tính lại mỗi lần là lãng phí. Memoize cache
kết quả theo input: gặp lại đúng input đã thấy, trả ngay kết quả cũ, không chạy lại hàm gốc.

## Khối 1 — Closure giữ cache qua nhiều lần gọi

```js
function memoize(fn) {
  const cache = new Map(); // sống trong closure, dùng chung cho mọi lần gọi
  return function (...args) {
    // ... tra cache, nếu chưa có thì tính và lưu lại (xem Khối 2-4)
  };
}
```
Giống `timer` ở debounce hay `inThrottle` ở throttle — biến khai báo ngoài hàm trả về,
nằm trong scope của `memoize`, sống suốt đời hàm đã memoize, không bị tạo lại mỗi lần gọi.

## Khối 2 — Biến nhiều argument thành 1 key (phần khó nhất)

Cách SAI phổ biến — nối argument bằng `join`:
```js
['a,b'].join(',')     // "a,b"
['a', 'b'].join(',')  // "a,b"   <-- TRÙNG key, dù là 2 bộ argument khác nhau!
```

`JSON.stringify` giữ được cả cấu trúc (mảng) và kiểu dữ liệu:
```js
JSON.stringify(['a,b'])     // '["a,b"]'
JSON.stringify(['a', 'b'])  // '["a","b"]'   <-- khác nhau, đúng
JSON.stringify([1])         // '[1]'
JSON.stringify(['1'])       // '["1"]'       <-- phân biệt đúng 1 vs '1'
```

## Khối 3 — Kiểm tra cache đúng cách với giá trị falsy

```js
if (cache.has(key)) { ... }   // ĐÚNG — kiểm tra "đã tồn tại key", bất kể giá trị gì
if (cache.get(key)) { ... }   // SAI — nếu giá trị cache là 0/''/false/undefined,
                               // check này coi như "chưa có", tính lại nhầm
```
(Với object thường thay vì Map: `key in cache` đúng, `if (cache[key])` sai — cùng lý do.)

## Khối 4 — Thứ tự lệnh khi `fn` có thể throw

Gọi `fn` TRƯỚC, lưu cache SAU khi `fn` trả về thành công — không cần `try/catch` đặc biệt,
cứ để lỗi tự bay lên cho người gọi; dòng lưu cache đơn giản không chạy tới nếu `fn` throw.
Lần gọi sau với cùng argument sẽ tự động thử lại `fn` (vì chưa từng được cache).

## Khối 5 — Giữ đúng `this`

```js
return function (...args) {           // nhận đúng args của CHÍNH hàm trả về
  const value = fn.apply(this, args);  // áp this + args thật cho fn, không gọi fn(this)
  ...
};
```

## Bản chuẩn đầy đủ

```js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const value = fn.apply(this, args);
    cache.set(key, value);
    return value;
  };
}
```

## Lỗi đã gặp khi làm

- Dùng `fn.args` làm key — `fn` là hàm gốc, không có property `.args` (luôn là
  `undefined`). Mọi lệnh gọi ra cùng 1 key `undefined`, toàn bộ cache collapse về 1 ô
  duy nhất bất kể argument thật.
- Gọi `fn(this)` thay vì `fn.apply(this, args)` — vừa truyền sai argument (đưa object
  `this` vào làm value thay vì argument thật) vừa không áp đúng `this` làm context cho `fn`.

## Đọc thêm / giới hạn ngoài phạm vi bài gốc

- **Cache không giới hạn kích thước** → phình vô hạn nếu gọi với rất nhiều argument khác
  nhau. Bài LRU cache (Bài 9/10) giải quyết đúng vấn đề này bằng cách giới hạn kích thước
  và loại bỏ entry ít dùng nhất.
- **Argument là object/array**: `JSON.stringify` không đảm bảo thứ tự key ổn định giữa các
  object "giống nhau" về nội dung nhưng khai báo khác thứ tự field, và không serialize được
  function — memoize theo object cần chiến lược key khác (ví dụ dùng `WeakMap` với chính
  object làm key, nếu chỉ có 1 argument duy nhất).
- `Map` so với object thường + `in`: **không phải lỗ hổng thật** cho bài này, vì key luôn có
  dạng `JSON.stringify` của một ARRAY (luôn bắt đầu bằng `[`), không bao giờ trùng tên
  property kế thừa từ `Object.prototype`. `Map` chỉ là thói quen phổ biến hơn trong code
  thực tế, đặc biệt khi key có thể là chuỗi bất kỳ không được bọc trong `[...]`.
