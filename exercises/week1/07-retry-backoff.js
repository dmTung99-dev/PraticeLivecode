// Tuần 1 · Bài 7/10 — retry-with-backoff cho 1 Promise
//
// Viết hàm retryWithBackoff(fn, maxAttempts, baseDelay):
// - fn: một hàm KHÔNG nhận argument, trả về một Promise (hoặc có thể throw ĐỒNG BỘ —
//   trường hợp này phải được coi như một lần thất bại, không được để lỗi đó làm crash
//   chương trình hoặc thoát ra ngoài retryWithBackoff một cách không kiểm soát).
// - maxAttempts: TỔNG số lần được thử (bao gồm lần thử đầu tiên, không phải số lần
//   "retry thêm"). Ví dụ maxAttempts = 3 nghĩa là: thử lần 1, nếu fail thì thử lần 2,
//   nếu vẫn fail thì thử lần 3 — không còn lần nào sau đó.
// - baseDelay: số ms cơ sở cho exponential backoff. Trước lần thử thứ k (k = 2, 3, ...,
//   tức là mỗi lần RETRY sau một lần thất bại), phải chờ baseDelay * 2^(k-2) ms rồi mới
//   thử lại (lần thử thứ 2 chờ baseDelay * 2^0 = baseDelay ms, lần thử thứ 3 chờ
//   baseDelay * 2^1 = 2*baseDelay ms, v.v.).
// - retryWithBackoff(...) trả về một Promise:
//   + Resolve NGAY với kết quả của lần thử đầu tiên THÀNH CÔNG — không cần chờ thêm,
//     không cần thử các lần còn lại.
//   + Nếu TẤT CẢ các lần thử (đủ maxAttempts lần) đều thất bại, reject với lỗi của
//     LẦN THỬ CUỐI CÙNG (không phải lần đầu tiên, không phải một lỗi tổng hợp).
// - Không dùng thư viện ngoài (không axios-retry, p-retry, bluebird...).
// - Không cần xử lý: jitter (độ trễ ngẫu nhiên thêm vào), hủy retry giữa đường
//   (cancellation) — ngoài phạm vi bài này.
//
// Chạy để tự kiểm tra: node exercises/week1/07-retry-backoff.js

function retryWithBackoff(fn, maxAttempts, baseDelay) {
  // TODO: implement
}

module.exports = retryWithBackoff;

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

  async function test1() {
    let calls = 0;
    const fn = () => { calls++; return Promise.resolve('ok'); };
    const result = await retryWithBackoff(fn, 3, 20);

    check('thành công ngay lần đầu: trả đúng kết quả, fn chỉ gọi 1 lần', () => {
      assert.strictEqual(result, 'ok');
      assert.strictEqual(calls, 1);
    });
  }

  async function test2() {
    let calls = 0;
    const fn = () => {
      calls++;
      if (calls < 3) return Promise.reject(new Error('fail ' + calls));
      return Promise.resolve('recovered');
    };
    const result = await retryWithBackoff(fn, 5, 20);

    check('thất bại 2 lần rồi thành công: resolve đúng kết quả, gọi đúng số lần', () => {
      assert.strictEqual(result, 'recovered');
      assert.strictEqual(calls, 3);
    });
  }

  async function test3() {
    let calls = 0;
    const fn = () => {
      calls++;
      return Promise.reject(new Error('always fails ' + calls));
    };
    let caughtMessage = null;
    try {
      await retryWithBackoff(fn, 3, 20);
    } catch (err) {
      caughtMessage = err.message;
    }

    check('luôn thất bại: reject với lỗi của lần thử CUỐI, gọi đúng maxAttempts lần', () => {
      assert.strictEqual(calls, 3);
      assert.strictEqual(caughtMessage, 'always fails 3');
    });
  }

  async function test4() {
    const timestamps = [];
    const fn = () => {
      timestamps.push(Date.now());
      return Promise.reject(new Error('fail'));
    };
    try {
      await retryWithBackoff(fn, 3, 20);
    } catch (err) {
      // thất bại cả 3 lần là đúng dự kiến ở test này
    }
    const gap1 = timestamps[1] - timestamps[0];
    const gap2 = timestamps[2] - timestamps[1];

    check('khoảng chờ giữa các lần retry tăng dần (exponential backoff)', () => {
      assert.ok(gap1 >= 15, `gap1 quá ngắn: ${gap1}ms`);
      assert.ok(gap2 >= gap1 * 1.5, `gap2 (${gap2}ms) không đủ lớn hơn gap1 (${gap1}ms)`);
    });
  }

  async function test5() {
    let calls = 0;
    const fn = () => {
      calls++;
      if (calls < 2) {
        throw new Error('sync throw ' + calls); // throw ĐỒNG BỘ, không phải reject
      }
      return Promise.resolve('ok after sync throw');
    };
    const result = await retryWithBackoff(fn, 3, 20);

    check('fn throw đồng bộ (không trả Promise) vẫn được coi là thất bại và retry, không crash', () => {
      assert.strictEqual(result, 'ok after sync throw');
      assert.strictEqual(calls, 2);
    });
  }

  async function main() {
    await test1();
    await test2();
    await test3();
    await test4();
    await test5();
  }

  main();
}
