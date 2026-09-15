export type Role = 'mr4' | 'pm';
export type Framework = 'previous' | 'revised';
export type Bonuses = { performance: number; national: number };
export type GraphicMode = 'money' | 'rice' | 'household';
export const GRAPHICS = {
  money: {label:'Money',image:'money-stack.png',unitValue:100000,unitsPerIcon:1,legend:'Each bundle unit ≈ S$100,000'},
  rice: {label:'Chicken rice',image:'chicken-rice.png',unitValue:4,unitsPerIcon:25000,legend:'1 plate = S$4 · Each graphic = 25,000 plates'},
  household: {label:'Household income',image:'household.png',unitValue:12500,unitsPerIcon:10,legend:'1 month ≈ S$12,500 · Each house = 10 months of household income'},
} as const;
// Reference norms, not personal remuneration. 2026 report Table 1 and Annex E.
export const REFERENCES = {
  mr4: { previous: 1_100_000, revised: 1_800_000 },
  pm: { previous: 2_200_000, revised: 3_600_000 },
} as const;
export const SOURCES = {
  previous: 'https://www.psd.gov.sg/files/white-paper---salaries-for-a-capable-and-committed-government.pdf',
  revised: 'https://go.gov.sg/2026report',
  october: 'https://www.pmo.gov.sg/newsroom/media-release-on-building-a-strong-team-for-singapore/',
  avc: 'https://www.psd.gov.sg/newsroom/civil-service-year-end-payment-2025/',
  household: 'https://www.singstat.gov.sg/-/media/files/publications/households/pp-s32.ashx',
};
export function linkedBonuses(role: Role, months: number): Bonuses {
  return role === 'pm' ? { performance: 0, national: months } : { performance: months / 2, national: months / 2 };
}
export function calculate(role: Role, framework: Framework, bonus: Bonuses, avcMonths: number) {
  const monthly = REFERENCES[role][framework] / 20;
  const basic=monthly*12, thirteenth=monthly;
  const performance=role==='pm'?0:monthly*bonus.performance;
  const national=monthly*bonus.national, avc=monthly*avcMonths;
  return {monthly,basic,thirteenth,performance,national,avc,fixed:basic+thirteenth,
    variable:performance+national+avc,total:basic+thirteenth+performance+national+avc};
}
export function parseAvc(raw: string): number | null {
  const value=Number(raw);
  // Numerical safety bound, not a policy limit.
  return raw.trim()!==''&&Number.isFinite(value)&&value>=0&&(value+25)*180000<Number.MAX_SAFE_INTEGER?value:null;
}
export function moneyUnits(total: number): number {return total/100000;}
export function scaleComparison(total:number,mode:GraphicMode) {
  const config=GRAPHICS[mode];
  const exact=total/config.unitValue;
  return {quantity:mode==='rice'?Math.floor(exact):exact,icons:exact/config.unitsPerIcon};
}
export const currency=(value:number)=>'S$'+new Intl.NumberFormat('en-SG',{maximumFractionDigits:0}).format(value);



