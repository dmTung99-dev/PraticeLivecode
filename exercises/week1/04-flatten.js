// Tuần 1 · Bài 4/10 — flatten nested array
//
// Viết hàm flatten(arr, depth):
// - Trả về một array MỚI, "làm phẳng" các array lồng bên trong arr.
// - depth: số cấp lồng tối đa được làm phẳng.
//   + Không truyền depth → làm phẳng hoàn toàn (mọi cấp).
//   + depth = 1 → chỉ bóc 1 lớp; depth = 0 → trả về bản sao nông, không bóc lớp nào.
// - Chỉ làm phẳng phần tử là array. Các giá trị khác (number, string, object, null, undefined...)
//   giữ nguyên làm 1 phần tử — string KHÔNG bị tách thành ký tự, object KHÔNG bị bóc.
// - Giữ đúng thứ tự phần tử.
// - KHÔNG được sửa (mutate) arr gốc hoặc các array con của nó.
// - KHÔNG dùng `Array.prototype.flat`, `flatMap`, hoặc mẹo chuyển qua string
//   (`toString`, `join`, `JSON.stringify`...).
//
// Chạy để tự kiểm tra: node exercises/week1/04-flatten.js

function flatten(arr, depth = Infinity) {
  let result = []
  if (depth == 0) {
    result = [...arr]
  } else {
    for (let i = 0; i < arr.length; i++) {
      if (Array.isArray(arr[i])) {
          result.push(...flatten(arr[i], depth - 1))
      } else {
        result.push(arr[i])
      }
    }
  }
  return result;
}

module.exports = flatten;

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
  check('làm phẳng hoàn toàn khi không truyền depth', () =>
    assert.deepStrictEqual(flatten([1, [2, [3, [4, [5]]]], 6]), [1, 2, 3, 4, 5, 6]));

  check('depth = 1 chỉ bóc 1 lớp', () =>
    assert.deepStrictEqual(flatten([1, [2, [3, [4]]]], 1), [1, 2, [3, [4]]]));

  check('depth = 2 bóc 2 lớp', () =>
    assert.deepStrictEqual(flatten([1, [2, [3, [4]]]], 2), [1, 2, 3, [4]]));

  check('depth = 0 trả về bản sao nông, không bóc lớp nào', () => {
    const input = [1, [2]];
    const out = flatten(input, 0);
    assert.deepStrictEqual(out, [1, [2]]);
    assert.notStrictEqual(out, input);
  });

  check('array rỗng lồng nhau biến mất, array rỗng ngoài cùng trả về []', () => {
    assert.deepStrictEqual(flatten([[], [[]], [1, []]]), [1]);
    assert.deepStrictEqual(flatten([]), []);
  });

  check('string/object/null/undefined giữ nguyên làm 1 phần tử', () => {
    const obj = { a: [1, 2] };
    const out = flatten(['ab', [obj, [null, [undefined]]]]);
    assert.deepStrictEqual(out, ['ab', obj, null, undefined]);
    assert.strictEqual(out[1], obj);
  });

  check('không mutate array gốc và các array con', () => {
    const inner = [2, [3]];
    const input = [1, inner];
    flatten(input);
    assert.deepStrictEqual(input, [1, [2, [3]]]);
    assert.strictEqual(input[1], inner);
    assert.deepStrictEqual(inner, [2, [3]]);
  });

  check('trả về array mới, không phải chính arr gốc', () => {
    const input = [1, 2, 3];
    const out = flatten(input);
    assert.deepStrictEqual(out, [1, 2, 3]);
    assert.notStrictEqual(out, input);
  });
}
