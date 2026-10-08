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

// ============================================================================
// GHI CHÚ KIẾN THỨC (bổ sung sau khi hoàn thành bài)
// ============================================================================
//
// 1. Shallow copy vs deep copy
//    - Shallow ({...obj}, [...arr], Object.assign): chỉ copy cấp 1, object lồng bên trong
//      vẫn dùng chung reference.
//    - Deep: copy mọi cấp → sửa bản sao không ảnh hưởng bản gốc ở bất kỳ cấp nào.
//
// 2. Cấu trúc đệ quy
//    - Base case: nguyên thuỷ hoặc null → trả về luôn. Nhớ: typeof null === 'object'.
//    - Kiểm tra Array.isArray TRƯỚC, vì typeof [] cũng là 'object'.
//    - Khởi tạo `result` đúng kiểu ([] hoặc {}) SAU khi biết value là gì.
//    - Mỗi phần tử / mỗi value đều phải gọi deepClone đệ quy, không gán thẳng.
//
// 3. Lỗi đã gặp khi làm
//    - Gán nông `result[key] = value[key]` thay vì `deepClone(value[key])`.
//    - Khai báo cố định `result = {}` trước khi biết value là array hay object.
//
// 4. Vì sao Date/Map/Set/RegExp bị clone thành {} rỗng (câu hỏi xoáy)
//    - Dữ liệu của chúng nằm trong internal slot, không phải own enumerable property.
//    - Object.keys(new Date()) → [] → vòng lặp không copy được gì → ra {} rỗng, KHÔNG báo lỗi.
//    - Muốn hỗ trợ: kiểm tra `instanceof` từng loại và tạo lại (new Date(value), new Map(...)).
//
// 5. Circular reference (ngoài scope, hay bị hỏi)
//    - obj.self = obj → đệ quy vô hạn → RangeError (tràn stack).
//    - Cách xử lý: dùng WeakMap lưu "object gốc → bản sao đã tạo"; gặp lại object gốc
//      thì trả về bản sao đã có.
//
// 6. Các cách có sẵn và giới hạn của chúng
//    - JSON.parse(JSON.stringify(x)): mất undefined/function, Date thành string,
//      Map/Set thành {}, crash với circular reference.
//    - structuredClone(x): xử lý được Date/Map/Set và circular, nhưng KHÔNG clone được function.
//
// 7. Sparse array: `for...of` biến ô trống [1, , 3] thành undefined → bản sao không còn "lỗ".
