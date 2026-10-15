# Retry với Exponential Backoff trong JavaScript

> Ghi chú tham khảo cho Bài 7/10 (`exercises/week1/07-retry-backoff.js`). Bài viết giải
> thích các khối kỹ thuật cần dùng — phần ráp thành `retryWithBackoff(fn, maxAttempts, baseDelay)`
> hoàn chỉnh vẫn là việc của người luyện, không có ở đây.

## Vì sao cần retry?

Một lệnh gọi mạng (API, DB, bất kỳ I/O nào) có thể thất bại vì lý do **tạm thời** — mất
gói, server quá tải một nhịp, timeout ngắn hạn. Thử lại ngay sau khi fail thường giải quyết
được phần lớn các lỗi tạm thời đó. Nhưng thử lại NGAY LẬP TỨC và LIÊN TỤC lại tạo ra vấn đề
mới: nếu server đang quá tải, hàng nghìn client cùng retry ngay lập tức sẽ làm tình hình
tệ hơn. **Exponential backoff** — tăng dần thời gian chờ giữa các lần thử — là cách giảm áp
lực đó: chờ ít ở lần đầu, chờ lâu hơn nếu vẫn tiếp tục fail.

## Khối 1 — Promise, async/await: ngôn ngữ cần biết trước

Một hàm `async function` luôn trả về Promise. Bên trong nó, `await somePromise` tạm dừng
cho đến khi Promise đó xong, và **ném lỗi tại đúng chỗ `await`** nếu Promise bị reject —
nghĩa là bạn bắt lỗi bằng `try/catch` bình thường, không cần `.catch()`:

```js
async function example() {
  try {
    const value = await somePromiseReturningFn();
    console.log('thành công:', value);
  } catch (err) {
    console.log('thất bại:', err.message);
  }
}
```

## Khối 2 — Một `try/catch` xử lý được cả throw đồng bộ và reject bất đồng bộ

Đây là điểm hay bị bỏ sót: nếu hàm bạn gọi có thể **throw ngay lúc gọi** (đồng bộ) HOẶC
**trả về Promise rồi Promise đó reject sau** (bất đồng bộ), bạn không cần viết 2 đường xử
lý khác nhau. `await fn()` đặt trong `try` sẽ bắt được cả hai:

```js
try {
  const result = await fn();
  // tới đây: fn() chắc chắn đã thành công
} catch (err) {
  // tới đây: fn() thất bại — không quan trọng là throw ngay hay reject sau,
  // cả 2 trường hợp đều rơi vào catch này
}
```

Lý do: nếu `fn()` throw ngay lúc đang được gọi (trước khi kịp trả Promise), lỗi đó nằm
trong phạm vi `try` nên bị bắt như throw thường. Nếu `fn()` trả Promise rồi Promise reject
sau, `await` ném lỗi đó ra đúng tại vị trí `await` — cũng nằm trong `try`.

## Khối 3 — "Sleep": tạm dừng N ms bên trong hàm async

Không có `sleep()` built-in trong JS. Cách tạo ra nó: một Promise mà việc cần hoàn thành
chính là chờ hết thời gian rồi `resolve()`:

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// dùng trong một async function:
await wait(200); // tạm dừng đúng 200ms rồi mới chạy dòng tiếp theo
```

Đây là một helper rất chung, không riêng gì retry — xuất hiện ở mọi nơi cần "chờ X ms rồi
làm tiếp" theo phong cách async/await thay vì nested callback.

## Khối 4 — Công thức exponential backoff

Độ trễ trước lần thử thứ *k* (k ≥ 2, vì lần đầu không cần chờ) tính theo:

```
delay(k) = baseDelay × 2^(k - 2)
```

Với `baseDelay = 100`:

| Lần thử | Có chờ trước không? | Độ trễ |
|---|---|---|
| 1 | Không | — |
| 2 | Có | 100 × 2⁰ = 100ms |
| 3 | Có | 100 × 2¹ = 200ms |
| 4 | Có | 100 × 2² = 400ms |
| 5 | Có | 100 × 2³ = 800ms |

Nhận xét: độ trễ **gấp đôi** sau mỗi lần fail liên tiếp — đây là lý do gọi là "exponential"
(theo cấp số nhân), khác với **fixed backoff** (delay cố định mỗi lần) hay **linear backoff**
(`delay = baseDelay × k`, tăng đều, không gấp đôi).

## Khung thuật toán tổng quát (pseudocode, không phải code chạy được)

```
lặp lần thử k từ 1 đến maxAttempts:
    thử gọi fn() (trong try, dùng await — xem Khối 2)
    nếu thành công:
        trả kết quả ngay, DỪNG LUÔN — không lặp tiếp
    nếu thất bại:
        nếu k là lần thử CUỐI CÙNG (k === maxAttempts):
            ném lại lỗi vừa bắt được cho người gọi
        ngược lại:
            chờ delay(k + 1) ms (xem Khối 3 + Khối 4)
            lặp tiếp (k + 1)
```

Việc ráp 4 khối trên theo đúng khung này, đúng tên tham số `(fn, maxAttempts, baseDelay)`
và đúng hành vi đã ghi trong comment đầu file `07-retry-backoff.js`, là phần tự làm.

## Đọc thêm (khái niệm liên quan, ngoài phạm vi bài này)

- **Jitter**: cộng thêm một khoảng ngẫu nhiên nhỏ vào delay, để tránh nhiều client cùng
  retry đúng cùng một thời điểm (tránh "thundering herd").
- **Circuit breaker**: sau quá nhiều lần fail liên tiếp, tạm ngừng gọi hoàn toàn một thời
  gian thay vì cứ retry — khác hẳn về mục đích so với backoff đơn thuần.
- **Idempotency**: retry chỉ an toàn khi hành động gọi lại nhiều lần không gây tác dụng phụ
  khác lần gọi 1 lần (ví dụ: gọi lại một API tạo đơn hàng có thể tạo trùng đơn nếu không có
  idempotency key).
