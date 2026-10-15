# Deep Clone trong JavaScript

> Ghi chú tham khảo cho Bài 3/10 (`exercises/week1/03-deep-clone.js`). Bài đã hoàn thành
> (pass 9/9) — tài liệu này gồm cả lý thuyết và bản chuẩn đầy đủ để đối chiếu.

## Vì sao cần deep clone?

Gán `const b = a` hay copy nông (`{...a}`, `[...a]`, `Object.assign({}, a)`) chỉ sao chép
**cấp ngoài cùng** — mọi object/array lồng bên trong vẫn là **cùng một reference** với bản
gốc. Sửa một field lồng sâu trong bản "sao chép" sẽ vô tình sửa luôn bản gốc — nguồn bug rất
phổ biến khi quản lý state (ví dụ: copy một object state trong React rồi sửa trực tiếp một
field lồng bên trong, tưởng đã tạo state mới nhưng thực ra vẫn mutate state cũ).

## Khối 1 — Nhìn object/array lồng nhau như một cái cây

```
{ a: 1, b: { c: 2, d: [1, 2, { e: 3 }] } }
```
- Lá: giá trị không phải object/array (`1`, `2`, `3`...).
- Nhánh: các object/array — có thể chứa nhánh khác hoặc lá bên trong.

Đệ quy rất hợp để xử lý cấu trúc này: ở mỗi node, chỉ cần biết "đây là lá hay nhánh", xử lý
tương ứng, và với nhánh thì gọi lại chính hàm đó cho từng con.

## Khối 2 — Cấu trúc đệ quy cho deep clone

```js
function deepClone(value) {
  // Base case: nguyên thuỷ hoặc null -> trả về luôn (không cần sao chép gì)
  if (value === null || typeof value !== 'object') {
    return value;
  }
  // QUAN TRỌNG: kiểm tra Array.isArray TRƯỚC — typeof [] cũng là 'object'
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }
  const result = {};
  for (const key of Object.keys(value)) {
    result[key] = deepClone(value[key]); // đệ quy — KHÔNG gán thẳng value[key]
  }
  return result;
}
```

Hai điểm dễ sai nhất: (1) gán nông `result[key] = value[key]` thay vì gọi đệ quy
`deepClone(value[key])`, và (2) khởi tạo `result` SAU khi biết `value` là array hay object
(không khai báo cố định một kiểu trước).

## Bản chuẩn đầy đủ

Giống Khối 2 ở trên — code tự viết trong bài đã khớp đúng logic này (chỉ khác `value.map`
so với vòng lặp `for...of` + `push`, hai cách tương đương).

## Lỗi đã gặp khi làm

- Gán nông `result[key] = value[key]` thay vì `deepClone(value[key])` — mọi object/array
  lồng bên trong vẫn dùng chung reference với bản gốc dù cấp ngoài đã là object mới.
- Khai báo cố định `result = {}` trước khi biết `value` là array hay object — gây crash
  tiềm ẩn (`{}.push` không tồn tại) nếu gọi `deepClone([...])` trực tiếp ở top-level.

## Đọc thêm / giới hạn ngoài phạm vi bài gốc

**Vì sao Date/Map/Set/RegExp bị clone thành `{}` rỗng (câu hỏi xoáy hay gặp):** dữ liệu
thật của các kiểu này nằm trong *internal slot*, không phải *own enumerable property*.
`Object.keys(new Date())` trả về `[]` → vòng lặp không copy được gì → ra `{}` rỗng, **không
báo lỗi gì cả** — mất hoàn toàn dữ liệu một cách âm thầm. Muốn hỗ trợ đúng: kiểm tra
`instanceof` từng loại và tạo lại tương ứng (`new Date(value)`, `new Map(value)`...).

**Circular reference:** `obj.self = obj` → đệ quy vô hạn → `RangeError` (tràn stack). Cách
xử lý chuẩn: dùng `WeakMap` lưu "object gốc → bản sao đã tạo"; gặp lại đúng object gốc đó
thì trả về bản sao đã có sẵn, không đệ quy lại.

**So sánh với các cách có sẵn:**

| Cách | Date | Map/Set | Circular | Function |
|---|---|---|---|---|
| `JSON.parse(JSON.stringify(x))` | → thành string | → thành `{}` | Crash | Mất hẳn (bị bỏ qua) |
| `structuredClone(x)` | ✅ Giữ đúng | ✅ Giữ đúng | ✅ Xử lý được | ❌ Throw lỗi |

**Sparse array**: `for...of` biến ô trống (`[1, , 3]`) thành `undefined` khi lặp — bản sao
không còn giữ được "lỗ trống" như mảng gốc.
