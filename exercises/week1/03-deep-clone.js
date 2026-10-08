// Tuần 1 · Bài 3/10 — deep clone object
//
// Viết hàm deepClone(value):
// - Trả về một bản sao SÂU (deep copy) của value — object/array lồng nhau bao nhiêu cấp
//   cũng phải được sao chép hoàn toàn, không dùng chung reference với bản gốc ở bất kỳ cấp nào.
// - Hỗ trợ: plain object ({ ... }), array ([...]), và các giá trị nguyên thủy
//   (number/string/boolean/null/undefined) — nguyên thủy trả về nguyên giá trị.
// - Sau khi clone, sửa một field lồng sâu trong bản sao KHÔNG được ảnh hưởng đến bản gốc.
// - KHÔNG dùng `JSON.parse(JSON.stringify(value))` hoặc `structuredClone(value)` —
//   tự viết bằng đệ quy (recursion).
// - Không cần xử lý: Date, Map, Set, Function, hoặc circular reference (ngoài phạm vi bài này).
//
// Chạy để tự kiểm tra: node exercises/week1/03-deep-clone.js

function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value
  }
  // let children = Array.isArray(value) ? value : Object.keys(value)
  let result
  if (Array.isArray(value)) {
    result = []
    for(const item of value) {
      result.push(deepClone(item))
    }
  } else {
    result = {}
    for(const key of Object.keys(value)) {
      result[key] = deepClone(value[key])
    }
  }
  return result
}

module.exports = deepClone;

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

  const original = { a: 1, b: { c: 2, d: [1, 2, { e: 3 }] } };
  const clone = deepClone(original);

  check('clone có giá trị bằng bản gốc (deep equal)', () =>
    assert.deepStrictEqual(clone, original));
  check('clone không cùng reference với bản gốc (object gốc)', () =>
    assert.notStrictEqual(clone, original));
  check('object lồng bên trong cũng không cùng reference', () =>
    assert.notStrictEqual(clone.b, original.b));
  check('array lồng bên trong cũng không cùng reference', () =>
    assert.notStrictEqual(clone.b.d, original.b.d));
  check('object lồng trong array cũng không cùng reference', () =>
    assert.notStrictEqual(clone.b.d[2], original.b.d[2]));

  clone.b.c = 999;
  clone.b.d[2].e = 999;

  check('sửa field lồng sâu trong clone không ảnh hưởng bản gốc', () =>
    assert.strictEqual(original.b.c, 2));
  check('sửa object trong array lồng ở clone không ảnh hưởng bản gốc', () =>
    assert.strictEqual(original.b.d[2].e, 3));

  check('giá trị nguyên thủy (number) được trả về đúng', () =>
    assert.strictEqual(deepClone(5), 5));
  check('giá trị null được trả về đúng', () =>
    assert.strictEqual(deepClone(null), null));
}
