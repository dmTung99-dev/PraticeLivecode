// Tuần 1 · Bài 5/10 — memoize
//
// Viết hàm memoize(fn):
// - Trả về một hàm mới (gọi nó là "memoized").
// - Lần đầu memoized(...args) được gọi với một bộ arguments → gọi fn gốc, lưu kết quả lại, trả về kết quả.
// - Những lần sau gọi lại với CÙNG bộ arguments → trả về kết quả đã lưu, KHÔNG gọi fn gốc nữa.
// - Arguments chỉ gồm giá trị nguyên thủy (number, string, boolean, null, undefined), có thể nhiều argument.
//   Hai bộ arguments được coi là "cùng" khi có cùng số lượng và từng cặp giống nhau theo `===`.
//   Lưu ý: 1 và '1' là KHÁC nhau; ('a,b') và ('a', 'b') là KHÁC nhau.
// - Kết quả là falsy (0, '', false, null, undefined) cũng phải được cache.
// - Nếu fn gốc throw → lỗi được ném ra cho người gọi và KHÔNG cache gì; lần gọi sau với cùng
//   arguments sẽ gọi lại fn gốc.
// - Giữ đúng `this` của người gọi khi gọi fn gốc.
// - Không cần xử lý: argument là object/array/function, giới hạn kích thước cache (đó là bài LRU sau).
// - Không dùng thư viện ngoài.
//
// Chạy để tự kiểm tra: node exercises/week1/05-memoize.js

function memoize(fn) {
  const cache = {}
  return function (...args) {
    const key = JSON.stringify(args)
    if (key in cache) {
      return cache[key]
    }
    const value = fn.apply(this, args)
    cache[key] = value
    return value
  }
}

module.exports = memoize;

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

  check('gọi lại cùng argument → fn gốc chỉ chạy 1 lần, trả về đúng kết quả', () => {
    let calls = 0;
    const square = memoize((x) => { calls++; return x * x; });
    assert.strictEqual(square(4), 16);
    assert.strictEqual(square(4), 16);
    assert.strictEqual(square(4), 16);
    assert.strictEqual(calls, 1);
  });

  check('argument khác → fn gốc chạy lại', () => {
    let calls = 0;
    const square = memoize((x) => { calls++; return x * x; });
    square(2);
    square(3);
    square(2);
    assert.strictEqual(calls, 2);
  });

  check('nhiều argument: (1, 2) và (2, 1) là khác nhau, (1, 2) gọi lại thì dùng cache', () => {
    let calls = 0;
    const sub = memoize((a, b) => { calls++; return a - b; });
    assert.strictEqual(sub(1, 2), -1);
    assert.strictEqual(sub(2, 1), 1);
    assert.strictEqual(sub(1, 2), -1);
    assert.strictEqual(calls, 2);
  });

  check("1 và '1' là 2 argument khác nhau", () => {
    let calls = 0;
    const type = memoize((x) => { calls++; return typeof x; });
    assert.strictEqual(type(1), 'number');
    assert.strictEqual(type('1'), 'string');
    assert.strictEqual(calls, 2);
  });

  check("('a,b') và ('a', 'b') là 2 bộ argument khác nhau", () => {
    let calls = 0;
    const count = memoize((...args) => { calls++; return args.length; });
    assert.strictEqual(count('a,b'), 1);
    assert.strictEqual(count('a', 'b'), 2);
    assert.strictEqual(calls, 2);
  });

  check('kết quả falsy (0, undefined) vẫn được cache', () => {
    let calls = 0;
    const zero = memoize(() => { calls++; return 0; });
    zero(); zero();
    let calls2 = 0;
    const nothing = memoize(() => { calls2++; return undefined; });
    nothing(); nothing();
    assert.strictEqual(calls, 1);
    assert.strictEqual(calls2, 1);
  });

  check('fn throw → lỗi được ném ra, không cache, lần sau gọi lại fn gốc', () => {
    let calls = 0;
    const flaky = memoize((x) => {
      calls++;
      if (calls === 1) throw new Error('boom');
      return x;
    });
    assert.throws(() => flaky(7), /boom/);
    assert.strictEqual(flaky(7), 7);
    assert.strictEqual(flaky(7), 7);
    assert.strictEqual(calls, 2);
  });

  check('giữ đúng this của người gọi', () => {
    const obj = {
      factor: 10,
      scale: memoize(function (x) { return x * this.factor; }),
    };
    assert.strictEqual(obj.scale(3), 30);
  });
}

// ============================================================================
// GHI CHÚ KIẾN THỨC (bổ sung sau khi hoàn thành bài)
// ============================================================================
//
// 1. Ý tưởng cốt lõi
//    - Cache theo argument: cùng bộ argument → trả kết quả cũ, không gọi lại fn gốc.
//    - `cache` nằm trong closure của `memoize` → sống suốt đời hàm đã memoize, không bị tạo lại
//      mỗi lần gọi (giống `timer`/`inThrottle` ở debounce/throttle).
//
// 2. Biến nhiều argument thành 1 key
//    - `args.join(',')` bị COLLISION: ['a,b'].join(',') === ['a','b'].join(',') === "a,b".
//    - `JSON.stringify(args)` giữ được cấu trúc (mảng) và kiểu dữ liệu → phân biệt đúng
//      1 vs '1', ('a,b') vs ('a','b').
//
// 3. Kiểm tra cache đúng cách với giá trị falsy
//    - `if (cache[key])` SAI khi kết quả là 0/''/false/undefined — falsy nên tưởng chưa có cache.
//    - `key in cache` kiểm tra đúng "đã tồn tại key" bất kể giá trị là gì.
//
// 4. Thứ tự lệnh khi fn có thể throw
//    - Gọi fn TRƯỚC, lưu cache SAU khi fn trả về thành công — không cần try/catch,
//      cứ để lỗi tự bay lên; dòng lưu cache đơn giản không chạy tới nếu fn throw.
//
// 5. Giữ đúng `this`
//    - Hàm bọc ngoài phải nhận đúng `(...args)` của chính nó (KHÔNG lấy từ `fn.args` —
//      function không có property này, luôn là undefined).
//    - Gọi `fn.apply(this, args)`, không gọi `fn(this)` — `fn(this)` vừa truyền sai
//      argument (đưa object `this` vào làm value) vừa không áp `this` làm context cho fn.
//
// 6. Lỗi đã gặp khi làm
//    - Dùng `fn.args` (không tồn tại) làm key → mọi lệnh gọi ra cùng 1 key `undefined`,
//      toàn bộ cache collapse về 1 ô duy nhất bất kể argument thật.
//    - Gọi `fn(this)` thay vì `fn.apply(this, args)` → sai cả argument truyền vào
//      lẫn context `this` bên trong fn.
//
// 7. Giới hạn/mở rộng (ngoài scope bài này)
//    - Cache không giới hạn kích thước → phình vô hạn nếu gọi với rất nhiều argument khác nhau
//      (bài LRU cache ở Bài 9 giải quyết đúng vấn đề này).
//    - Argument là object/array: `JSON.stringify` không đảm bảo thứ tự key ổn định giữa
//      các object "giống nhau" về nội dung nhưng khai báo khác thứ tự field, và không
//      serialize được function — memoize theo object cần chiến lược key khác (vd WeakMap).
