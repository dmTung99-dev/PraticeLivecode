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
  // TODO: implement
  let timer;
  function executedFunction(...args) {
    clearTimeout(timer);
    timer = setTimeout(()=>fn.apply(this, args), delay)
  }
  executedFunction.cancel = function() {
    console.log("Cancel debounce!!")
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
}
