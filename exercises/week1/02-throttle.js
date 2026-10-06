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
  // TODO: implement
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
}
