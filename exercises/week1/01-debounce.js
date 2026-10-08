// Tuần 1 · Bài 1/10 — debounce
//
// Viết hàm debounce(fn, delay):
// - Trả về một hàm mới (gọi nó là "debounced").
// - Mỗi lần debounced(...) được gọi, timer được reset.
// - fn gốc chỉ thực sự chạy sau khi KHÔNG còn lệnh gọi debounced nào trong "delay" ms,
//   và chạy với arguments của lần gọi CUỐI CÙNG.
// - Không dùng thư viện ngoài (lodash.debounce...). Tự viết bằng setTimeout/clearTimeout.
//
// Chạy để tự kiểm tra: node exercises/week1/01-debounce.js

function debounce(fn, delay) {
  let timer;
  function executedFunction(...args) {
    clearTimeout(timer);
    timer = setTimeout(()=>fn.apply(this, args), delay)
  }
  executedFunction.cancel = function() {
    clearTimeout(timer)
  }
  return executedFunction;
}

module.exports = debounce;

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
    const debounced = debounce((x) => { callCount++; lastArg = x; }, 50);

    debounced(1);
    debounced(2);
    debounced.cancel();
    debounced(3);

    setTimeout(() => {
      check('fn gốc chỉ chạy đúng 1 lần sau nhiều lệnh gọi liên tiếp', () =>
        assert.strictEqual(callCount, 1));
      check('fn gốc chạy với argument của lần gọi cuối cùng', () =>
        assert.strictEqual(lastArg, 3));
    }, 100);
  })();

  (function test2() {
    let callCount = 0;
    const debounced = debounce(() => { callCount++; }, 30);

    debounced();
    setTimeout(() => debounced(), 50);

    setTimeout(() => {
      check('nếu khoảng cách giữa 2 lần gọi >= delay, fn gốc chạy lại', () =>
        assert.strictEqual(callCount, 2));
    }, 120);
  })();

  (function test3() {
    let callCount = 0;
    const debounced = debounce(() => { callCount++; }, 30);

    debounced();
    debounced.cancel();

    setTimeout(() => {
      check('cancel() huỷ lần chạy đang chờ → fn gốc không chạy', () =>
        assert.strictEqual(callCount, 0));
    }, 80);
  })();

  (function test4() {
    let seenThis = null;
    const obj = { name: 'obj' };
    obj.run = debounce(function () { seenThis = this; }, 30);

    obj.run();

    setTimeout(() => {
      check('giữ đúng this của người gọi', () =>
        assert.strictEqual(seenThis, obj));
    }, 80);
  })();
}

// ============================================================================
// GHI CHÚ KIẾN THỨC (bổ sung sau khi hoàn thành bài)
// ============================================================================
//
// 1. Ý tưởng cốt lõi
//    - Mỗi lần gọi: clearTimeout(timer cũ) rồi setTimeout mới → chỉ lần gọi CUỐI CÙNG sống sót.
//    - `timer` nằm trong closure → mỗi hàm debounced có timer riêng, không dùng chung.
//    - Ứng dụng: ô search gõ xong mới gọi API, resize window, auto-save.
//
// 2. Giữ đúng `this`
//    - Hàm bọc NGOÀI phải là `function` thường (có `this` động theo người gọi).
//    - Callback bên trong setTimeout nên là arrow function → mượn `this` của hàm bọc ngoài,
//      nên `fn.apply(this, args)` trong arrow vẫn đúng.
//    - Quy tắc nhớ: "ngoài function, trong arrow".
//
// 3. Event loop: thứ tự sync → microtask → macrotask
//    - Code đồng bộ chạy hết trước.
//    - Microtask (Promise.then, queueMicrotask) chạy ngay khi call stack trống.
//    - Macrotask (setTimeout, setInterval, I/O) chạy sau khi hết microtask.
//    - → setTimeout(fn, 0) KHÔNG chạy ngay, luôn chạy sau mọi Promise.then đã xếp hàng.
//
// 4. Giá trị trả về
//    - debounced() trả về undefined: fn chạy SAU delay nên không thể trả kết quả đồng bộ.
//    - Nếu cần kết quả: cho debounced() trả về một Promise, resolve khi fn thực sự chạy.
//
// 5. cancel() và các biến thể (câu hỏi xoáy hay gặp)
//    - cancel(): clearTimeout(timer) → huỷ lần chạy đang chờ.
//    - flush(): chạy ngay lần đang chờ thay vì đợi hết delay.
//    - leading: chạy NGAY ở lần gọi đầu, rồi bỏ qua đến khi yên lặng đủ delay
//      (lodash có option { leading, trailing }).
//
// 6. Test cho cancel()
//    - test1 gọi cancel() rồi lại gọi debounced(3) ngay sau → vẫn pass dù cancel() rỗng,
//      nên không chứng minh được gì. test3 chỉ gọi cancel() rồi không gọi gì nữa → fn phải chạy 0 lần.
//    - Bài học: test phải FAIL được khi code sai; viết xong test nên thử phá code xem test có bắt được không.
