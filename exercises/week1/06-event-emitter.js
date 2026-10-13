// Tuần 1 · Bài 6/10 — event emitter đơn giản
//
// Viết class EventEmitter với các method:
// - on(event, listener): đăng ký listener cho "event" (một chuỗi tên event). Có thể đăng ký
//   nhiều listener khác nhau cho CÙNG một event — tất cả đều phải được gọi khi emit, theo
//   đúng thứ tự đã đăng ký.
// - emit(event, ...args): gọi tất cả listener đã đăng ký cho "event" đó, truyền đúng args
//   cho từng listener. Nếu event chưa có listener nào (hoặc chưa từng được on), emit không
//   làm gì cả — KHÔNG throw.
// - off(event, listener): hủy đăng ký ĐÚNG listener đó khỏi event (so sánh theo reference
//   hàm, không theo nội dung). Gọi off với một listener chưa từng đăng ký thì không throw,
//   không ảnh hưởng gì.
// - once(event, listener): đăng ký listener chỉ chạy đúng 1 lần — sau khi được gọi lần đầu
//   (do một lần emit), các lần emit sau của cùng event KHÔNG gọi listener đó nữa. Các
//   listener khác đăng ký bằng on() trên cùng event vẫn chạy bình thường mỗi lần emit.
// - Mỗi instance EventEmitter (mỗi lần new EventEmitter()) phải độc lập — không dùng chung
//   state (danh sách listener) giữa các instance khác nhau.
// - Không dùng module `events` có sẵn của Node.js (require('events')) — tự viết tay.
//
// Chạy để tự kiểm tra: node exercises/week1/06-event-emitter.js

class EventEmitter {
  on(event, listener) {
    // TODO: implement
  }

  off(event, listener) {
    // TODO: implement
  }

  once(event, listener) {
    // TODO: implement
  }

  emit(event, ...args) {
    // TODO: implement
  }
}

module.exports = EventEmitter;

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
    const emitter = new EventEmitter();
    const calls = [];
    emitter.on('greet', (name) => calls.push(`hi ${name}`));
    emitter.on('greet', (name) => calls.push(`hello ${name}`));
    emitter.emit('greet', 'A');

    check('emit gọi tất cả listener theo đúng thứ tự đăng ký, đúng argument', () =>
      assert.deepStrictEqual(calls, ['hi A', 'hello A']));
  })();

  (function test2() {
    const emitter = new EventEmitter();
    check('emit một event chưa có listener nào không throw', () =>
      assert.doesNotThrow(() => emitter.emit('nothing', 1, 2)));
  })();

  (function test3() {
    const emitter = new EventEmitter();
    let count = 0;
    const listener = () => count++;
    emitter.on('x', listener);
    emitter.off('x', listener);
    emitter.emit('x');

    check('off huỷ đúng listener, emit sau đó không gọi nữa', () =>
      assert.strictEqual(count, 0));
  })();

  (function test4() {
    const emitter = new EventEmitter();
    check('off một listener chưa từng đăng ký không throw', () =>
      assert.doesNotThrow(() => emitter.off('x', () => {})));
  })();

  (function test5() {
    const emitter = new EventEmitter();
    let count = 0;
    emitter.once('x', () => count++);
    emitter.emit('x');
    emitter.emit('x');
    emitter.emit('x');

    check('once chỉ chạy đúng 1 lần dù emit nhiều lần', () =>
      assert.strictEqual(count, 1));
  })();

  (function test6() {
    const a = new EventEmitter();
    const b = new EventEmitter();
    let aCount = 0;
    let bCount = 0;
    a.on('x', () => aCount++);
    b.on('x', () => bCount++);
    a.emit('x');

    check('mỗi instance EventEmitter độc lập, không dùng chung state', () => {
      assert.strictEqual(aCount, 1);
      assert.strictEqual(bCount, 0);
    });
  })();

  (function test7() {
    const emitter = new EventEmitter();
    let received = null;
    emitter.on('data', (a, b, c) => { received = [a, b, c]; });
    emitter.emit('data', 1, 'two', true);

    check('emit truyền đúng nhiều argument cho listener', () =>
      assert.deepStrictEqual(received, [1, 'two', true]));
  })();

  (function test8() {
    const emitter = new EventEmitter();
    let onCount = 0;
    let onceCount = 0;
    emitter.on('x', () => onCount++);
    emitter.once('x', () => onceCount++);
    emitter.emit('x');
    emitter.emit('x');

    check('listener on() vẫn chạy mỗi lần emit, không bị ảnh hưởng bởi once trên cùng event', () =>
      assert.strictEqual(onCount, 2));
    check('listener once() chỉ chạy đúng 1 lần dù on() cùng event vẫn tiếp tục chạy', () =>
      assert.strictEqual(onceCount, 1));
  })();
}
