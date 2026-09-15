import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, linkedBonuses, parseAvc, moneyUnits, scaleComparison } from './salary.ts';

test('published norms across both roles and frameworks', () => {
  for (const [role, old, revised] of [['mr4',1100000,1800000],['pm',2200000,3600000]] as const) {
    assert.equal(calculate(role,'previous',linkedBonuses(role,6),1).total, old);
    assert.equal(calculate(role,'revised',linkedBonuses(role,6),1).total, revised);
  }
});
test('fixed-only and maximum performance/national scenarios', () => {
  assert.equal(calculate('mr4','previous',linkedBonuses('mr4',0),0).total,715000);
  assert.equal(calculate('mr4','revised',linkedBonuses('mr4',0),0).total,1170000);
  assert.equal(calculate('mr4','previous',linkedBonuses('mr4',12),1).total,1430000);
  assert.equal(calculate('mr4','revised',linkedBonuses('mr4',12),1).total,2340000);
  assert.equal(calculate('pm','revised',linkedBonuses('pm',12),1).total,4680000);
});
test('PM has no performance bonus and supports 12-month national bonus', () => {
  assert.deepEqual(linkedBonuses('pm',6),{performance:0,national:6});
  const pay=calculate('pm','previous',{performance:6,national:12},1);
  assert.equal(pay.performance,0);
  assert.equal(pay.national,1320000);
});
test('independent components and decimal AVC retain precision', () => {
  const pay=calculate('mr4','previous',{performance:4.25,national:2.5},1.7);
  assert.equal(pay.total,1179750);
  assert.equal(pay.total,pay.basic+pay.thirteenth+pay.avc+pay.performance+pay.national);
});
test('AVC boundary validation', () => {
  for(const raw of ['', ' ', '-1','NaN','Infinity','1e308','abc']) assert.equal(parseAvc(raw),null);
  assert.equal(parseAvc('0'),0);
  assert.equal(parseAvc('1.7'),1.7);
  assert.equal(parseAvc('3'),3);
});
test('absolute money scale is monotonic', () => {
  let prev=0;
  for(let m=0;m<=12;m+=.25){const units=moneyUnits(calculate('mr4','previous',linkedBonuses('mr4',m),1).total);assert.ok(units>=prev);prev=units;}
  assert.equal(moneyUnits(1000000),10);
  assert.equal(moneyUnits(2000000),20);
});

test('chicken rice uses S$4 whole plates and groups 25,000 plates per icon', () => {
  assert.equal(scaleComparison(1100000,'rice').quantity,275000);
  assert.equal(scaleComparison(1100000,'rice').icons,11);
  assert.equal(scaleComparison(11,'rice').quantity,2);
  assert.equal(scaleComparison(0,'rice').quantity,0);
});
test('one house represents a rounded annual household income, not property price', () => {
  assert.equal(scaleComparison(150000,'household').quantity,1);
  assert.equal(scaleComparison(1800000,'household').quantity,12);
  assert.equal(scaleComparison(4680000,'household').icons,31.2);
});
test('all graphic scales remain proportional across roles and frameworks', () => {
  for(const mode of ['money','rice','household'] as const){
    assert.equal(scaleComparison(2200000,mode).icons,2*scaleComparison(1100000,mode).icons);
    assert.ok(scaleComparison(6000000,mode).icons>scaleComparison(4800000,mode).icons);
  }
});
