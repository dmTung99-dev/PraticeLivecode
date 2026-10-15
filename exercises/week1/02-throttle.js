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
// Lý thuyết, bản chuẩn đầy đủ, lỗi đã gặp: xem docs/notes/throttle.md

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
