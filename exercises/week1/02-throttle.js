// Tuần 1 · Bài 2/10 — throttle
//
// Viết hàm throttle(fn, interval):
// - Trả về một hàm mới (gọi nó là "throttled").
// - Lần gọi throttled(...) ĐẦU TIÊN sẽ chạy fn gốc NGAY LẬP TỨC.
// - Trong "interval" ms tiếp theo kể từ lần chạy đó, mọi lệnh gọi throttled(...) khác
//   đều bị BỎ QUA (fn gốc không chạy thêm lần nào trong khoảng này).
// - Sau khi hết "interval" ms, lệnh gọi throttled(...) tiếp theo lại chạy ngay lập tức,
//   và một cửa sổ "interval" mới lại bắt đầu từ thời điểm đó.
// - KHÔNG cần xử lý trailing call (không cần đảm bảo lần gọi cuối cùng bị bỏ qua sẽ được
//   chạy lại tự động sau khi hết interval — chỉ cần bỏ qua là đủ).
// - Không dùng thư viện ngoài. Gợi ý tự tìm cách: lưu lại thời điểm (timestamp) lần chạy gần nhất.
//
// Chạy để tự kiểm tra: node exercises/week1/02-throttle.js

function throttle(fn, interval) {
  let inThrottle;
  return function (...args) {
    if(!inThrottle) {
      inThrottle = true
      setTimeout(()=> inThrottle = false, interval)
      fn.apply(this, args) 
    }
  } 
}

module.exports = throttle;

if (require.main === module) {
  const assert = require('node:assert');

  function check(name, fn) {
    try {
      fn();
      console.log(`PASS - ${name}`);
    } catch (err) {
      console.log(`FAIL - ${name}`);
      console.error('  ' + err.message);
      process.exitCode = 1;
    }
  }

  (function test1() {
    let callCount = 0;
    let lastArg = null;
    const throttled = throttle((x) => { callCount++; lastArg = x; }, 50);

    throttled(1);
    throttled(2);
    throttled(3);

    check('fn gốc chạy ngay ở lần gọi đầu tiên', () =>
      assert.strictEqual(callCount, 1));
    check('fn gốc chạy với argument của lần gọi ĐẦU TIÊN (các lệnh gọi sau trong cùng interval bị bỏ qua)', () =>
      assert.strictEqual(lastArg, 1));
  })();

  (function test2() {
    let callCount = 0;
    const throttled = throttle(() => { callCount++; }, 50);

    throttled(); // t=0 -> chạy, callCount=1

    setTimeout(() => {
      throttled(); // t=30, vẫn trong interval -> bị bỏ qua
      check('lệnh gọi trong cùng interval bị bỏ qua', () =>
        assert.strictEqual(callCount, 1));
    }, 30);

    setTimeout(() => {
      throttled(); // t=70, đã hết interval -> chạy lại
      check('sau khi hết interval, lệnh gọi tiếp theo chạy lại', () =>
        assert.strictEqual(callCount, 2));
    }, 70);
  })();

  (function test3() {
    const obj = { name: 'obj' };
    let seenThis = null;
    obj.run = throttle(function () { seenThis = this; }, 50);

    obj.run();
    check('giữ đúng this của người gọi', () =>
      assert.strictEqual(seenThis, obj));
  })();

  (function test4() {
    let callCount = 0;
    const throttled = throttle(() => {
      callCount++;
      if (callCount === 1) throw new Error('boom');
    }, 30);

    check('fn throw → lỗi được ném ra cho người gọi', () =>
      assert.throws(() => throttled(), /boom/));
    throttled(); // vẫn trong interval -> bị bỏ qua
    check('sau khi fn throw, lệnh gọi trong cùng interval vẫn bị bỏ qua', () =>
      assert.strictEqual(callCount, 1));

    setTimeout(() => {
      throttled();
      check('fn throw không khoá throttle: hết interval thì chạy lại được', () =>
        assert.strictEqual(callCount, 2));
    }, 80);
  })();
}

// ============================================================================
// GHI CHÚ KIẾN THỨC (bổ sung sau khi hoàn thành bài)
// ============================================================================
//
// 1. Throttle vs debounce
//    - Debounce: đợi YÊN LẶNG đủ delay rồi mới chạy (lấy lần gọi CUỐI).
//    - Throttle: chạy tối đa 1 lần mỗi interval (lấy lần gọi ĐẦU, bỏ qua phần còn lại).
//    - Ứng dụng throttle: scroll, kéo thả, chặn bấm nút liên tục.
//
// 2. Hai cách hiện thực
//    | Cờ + setTimeout (cách đã làm)          | Timestamp (Date.now())                  |
//    | Mỗi cửa sổ tạo 1 timer                 | Không tạo timer                         |
//    | Timer có thể trễ khi event loop bận    | Tính theo thời gian thực                |
//    | Timer đang chờ giữ Node process sống   | Không giữ process                       |
//    | Dễ mở rộng thêm trailing call          | Muốn trailing phải thêm timer           |
//
// 3. Khi event loop bị block (vd. tác vụ đồng bộ 200ms, interval 50ms)
//    - Cách timer: callback mở cờ không chạy được khi call stack bận → bỏ qua suốt thời gian block.
//      Cửa sổ thực tế ≈ max(interval, thời gian block) — tức ~200ms, KHÔNG phải 250ms
//      (timer đã đến hạn ở t=50, chỉ chờ stack trống).
//    - Cách timestamp: Date.now() vẫn tăng → cứ đủ 50ms là cho chạy lại.
//    - Chỉ áp dụng khi chính code đồng bộ đó gọi throttled(); event bên ngoài (click, scroll)
//      phải xếp hàng, không chen vào giữa được.
//
// 4. Thứ tự lệnh khi fn có thể throw
//    - Sai 1: fn() rồi mới bật cờ → fn throw thì cờ không bật → throttle mất tác dụng.
//    - Sai 2: bật cờ → fn() → setTimeout → fn throw thì setTimeout không chạy → KHOÁ VĨNH VIỄN.
//    - Đúng: bật cờ + hẹn giờ mở cờ TRƯỚC, rồi mới gọi fn (hoặc dùng try/finally).
//
// 5. Arrow function và implicit return
//    - `(x) => expr`     → tự trả về giá trị expr.
//    - `(x) => { ... }`  → có {} thì phải viết return, không thì trả về undefined.
//    - `if` là câu lệnh (statement), không phải biểu thức → không viết được dạng không {}.
//    - Lần gọi bị bỏ qua vẫn trả undefined; lodash lưu kết quả lần chạy gần nhất để trả về.
