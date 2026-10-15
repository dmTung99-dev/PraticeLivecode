# Flatten Nested Array trong JavaScript

> Ghi chú tham khảo cho Bài 4/10 (`exercises/week1/04-flatten.js`). Bài đã hoàn thành
> (pass 8/8) — tài liệu này gồm cả lý thuyết và bản chuẩn đầy đủ để đối chiếu.

## Vì sao cần tự viết flatten?

`Array.prototype.flat()` đã làm sẵn việc này — nhưng bài tập cấm dùng nó có chủ đích: viết
tay buộc bạn hiểu rõ 2 thứ thường bị giấu đi bởi hàm có sẵn — **đệ quy theo độ sâu (depth)**
và **cách tránh một lỗi hiệu năng/crash kinh điển** (xem phần "Lỗi đã gặp" bên dưới).

## Khối 1 — Mảng lồng nhau là một cái cây

- Lá: giá trị không phải array.
- Nhánh: các array lồng bên trong ("hộp" chứa hộp khác hoặc lá).
- Flatten = duyệt theo chiều sâu (DFS) từ trái sang phải, nhặt lá theo đúng thứ tự gặp.

## Khối 2 — Tham số `depth`

`depth` là "số lần còn được phép chui vào hộp". Mỗi cấp sâu hơn giảm 1. Hết lượt
(`depth === 0`) thì đưa nguyên hộp vào kết quả, không bóc tiếp.

```js
function flatten(arr, depth = Infinity) {
  const result = [];
  for (const item of arr) {
    if (depth > 0 && Array.isArray(item)) {
      const flattenedChild = flatten(item, depth - 1);
      for (const x of flattenedChild) {
        result.push(x); // push TỪNG phần tử — xem vì sao ở Khối 3
      }
    } else {
      result.push(item);
    }
  }
  return result;
}
```

Hai điểm tinh tế: mặc định `depth = Infinity` thì `Infinity - 1` vẫn là `Infinity` — một
nhánh code xử lý được cả 2 trường hợp "có truyền depth" và "không truyền". Default parameter
chỉ áp dụng khi argument là `undefined`, **không** áp dụng cho `null`.

## Khối 3 — Lỗ hổng call-stack kinh điển: `push(...x)` vs push từng phần tử

Cách viết trực quan nhưng có bug ẩn:
```js
result.push(...flatten(arr[i], depth - 1)); // spread cả mảng con đã làm phẳng
```
Spread (`...`) biến **mỗi phần tử** của mảng con thành **1 argument riêng** của `push()`.
Các argument đó đều phải nằm trên call stack cùng lúc khi function được gọi. Nếu mảng con
có ~500.000 phần tử, bạn đang cố truyền 500.000 argument cho một lệnh gọi hàm duy nhất →
`RangeError: Maximum call stack size exceeded` — **dù đệ quy chỉ sâu 2 tầng**, không liên
quan gì đến độ sâu lồng nhau.

Cách an toàn: push từng phần tử bằng vòng lặp (như Khối 2) — không còn giới hạn bởi **số
lượng** phần tử trong mảng con (vẫn có thể tràn stack nếu **lồng quá sâu** — vài chục nghìn
cấp — nhưng đó là giới hạn khác, về độ sâu đệ quy, không phải độ rộng).

## Khối 4 — Độ phức tạp

Lý tưởng là O(n) với n là tổng số phần tử ở mọi cấp. Cách viết `result = [...result, ...x]`
mỗi lần gặp một "hộp" sẽ copy lại TOÀN BỘ `result` từ đầu mỗi lần — có thể lên tới O(n²) với
dữ liệu lồng sâu. Dùng `push` vào một `result` duy nhất (không tạo mảng mới mỗi lần) tránh
được vấn đề này.

## Bản chuẩn đầy đủ

Giống Khối 2 + Khối 3 ở trên.

## Lỗi đã gặp khi làm

- Vòng lặp theo `depth` thay vì theo `arr.length` (nhầm 2 khái niệm: số phần tử cần lặp
  qua, và số cấp còn được bóc).
- `result.push[x]` (truy cập thuộc tính bằng `[]`, KHÔNG gọi hàm bằng `()`) — JS không báo
  lỗi gì, chỉ lặng lẽ không làm gì cả. Loại lỗi im lặng này bắt nhanh nhất bằng breakpoint,
  khó phát hiện chỉ bằng đọc code.
- Quên spread/lặp kết quả đệ quy — bóc hộp ra rồi vô tình bỏ nguyên "hộp kết quả" đó vào một
  hộp mới, thay vì lấy từng phần tử bên trong ra.
- Off-by-one: `i <= arr.length` thay vì `i < arr.length` → `arr[arr.length]` là `undefined`
  → mỗi mảng con bị thừa đúng 1 giá trị `undefined`.
- **Bug call-stack ở Khối 3 — chủ động giữ nguyên để nhớ**, chưa sửa trong bản nộp bài, vì
  mục đích luyện tập là nhận diện đúng lỗ hổng hơn là vá ngay lập tức.

## Đọc thêm (ngoài phạm vi bài gốc)

Lồng quá sâu (~20.000 cấp) vẫn tràn stack dù đã sửa lỗi ở Khối 3, vì mỗi cấp lồng tốn đúng
1 tầng gọi đệ quy. Cách xử lý triệt để: bỏ đệ quy, tự quản lý một stack (array) thủ công để
duyệt theo chiều sâu mà không cần gọi hàm lồng nhau — bài luyện mở rộng, chưa code ở đây.
