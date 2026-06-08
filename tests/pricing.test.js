const assert = require('node:assert/strict');

function normalize(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function csvParse(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (c === '"' && q && n === '"') {
      cell += '"';
      i++;
    } else if (c === '"') {
      q = !q;
    } else if (c === ',' && !q) {
      row.push(cell.trim());
      cell = '';
    } else if ((c === '\n' || c === '\r') && !q) {
      if (c === '\r' && n === '\n') i++;
      row.push(cell.trim());
      if (row.some(x => x !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += c;
    }
  }
  row.push(cell.trim());
  if (row.some(x => x !== '')) rows.push(row);
  return rows;
}

function validatePriceList(rows, expectedCode) {
  const bad = [];
  rows.forEach((row, i) => {
    if (row.length < 6 || normalize(row[0]) !== normalize(expectedCode)) bad.push(i + 1);
  });
  return bad;
}

function effectiveCtForPricing(ct, tenOn) {
  if (!tenOn && ct >= 5) return 5;
  if (tenOn && ct >= 10) return 10;
  if (ct >= 5) return 5;
  return ct;
}

function rowMatchesPricingRange(row, ct, tenOn) {
  const from = parseFloat(row[3]);
  const to = parseFloat(row[4]);
  if (Number.isNaN(from) || Number.isNaN(to)) return false;
  const pricingCt = effectiveCtForPricing(ct, tenOn);
  if (pricingCt >= from && pricingCt <= to) return true;
  if (pricingCt === 5 && from >= 5 && from < 6) return true;
  if (pricingCt === 10 && from >= 10 && from < 11) return true;
  return false;
}

const roundRows = csvParse('BR,VS2,H,1.00,1.49,5000.0,3/20/2026\nBR,SI1,G,5.00,5.99,9000.0,3/20/2026');
const otherRows = csvParse('PS,VS2,H,1.00,1.49,4200.0,3/20/2026');
const badRows = csvParse('PS,VS2,H,1.00,1.49,4200.0,3/20/2026\nBR,VS2,H,1.00,1.49,5000.0,3/20/2026');

assert.equal(roundRows.length, 2);
assert.deepEqual(validatePriceList(roundRows, 'BR'), []);
assert.deepEqual(validatePriceList(otherRows, 'PS'), []);
assert.deepEqual(validatePriceList(badRows, 'BR'), [1]);
assert.deepEqual(validatePriceList(badRows, 'PS'), [2]);
assert.equal(effectiveCtForPricing(4.99, false), 4.99);
assert.equal(effectiveCtForPricing(5.01, false), 5);
assert.equal(effectiveCtForPricing(10.4, false), 5);
assert.equal(effectiveCtForPricing(10.4, true), 10);
assert.equal(rowMatchesPricingRange(['BR', 'VS2', 'H', '5.00', '5.99', '9000'], 10.4, false), true);
assert.equal(rowMatchesPricingRange(['BR', 'VS2', 'H', '10.00', '10.99', '12000'], 10.4, true), true);

console.log('pricing tests passed');
