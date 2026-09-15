export type Role = 'mr4' | 'pm';
export type Framework = 'previous' | 'revised';
export type Bonuses = { performance: number; national: number };
export type GraphicMode = 'money' | 'rice' | 'household';
export const GRAPHICS = {
  money: {label:'Money',image:'money-stack-thousand-note.png',unitValue:100000,unitsPerIcon:1,legend:'Each bundle ≈ S$100,000'},
  rice: {label:'Chicken rice',image:'chicken-rice.png',unitValue:4,unitsPerIcon:25000,legend:'1 plate = S$4 · Each graphic = 25,000 plates'},
  household: {label:'HDB block',image:'household.png',unitValue:149352,unitsPerIcon:1,legend:'Each HDB block = annual median household income, S$149,352'},
} as const;
// Reference norms, not personal remuneration. 2026 report Table 1 and Annex E.
export const REFERENCES = {
  mr4: { previous: 1_100_000, revised: 1_800_000 },
  pm: { previous: 2_200_000, revised: 3_600_000 },
} as const;
export const SOURCES = {
  framework: 'https://ask.gov.sg/psd/questions/cmf0m1w3u012ced2hcc0baz0v?from=agencyhomepage',
  previous: 'https://isomer-user-content.by.gov.sg/147/18da1d6a-96b2-4520-acc4-dea09aa6e324/press-release-2011-national-bonus-for-political-appointment-holders.pdf',
  revised: 'https://isomer-user-content.by.gov.sg/147/dbb342e3-14a4-4949-80d4-7e410110e3d1/Committee%20Report%20-%202026%20Review%20of%20Salaries%20for%20Political%20Appointment%20Holders%20and%20Members%20of%20Parl.pdf',
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
export function calculatePersonal(monthly:number, bonusMonths:number, avcMonths:number) {
  const basic=monthly*12, thirteenth=monthly, avc=monthly*avcMonths, bonus=monthly*bonusMonths;
  return {monthly,basic,thirteenth,performance:bonus,national:0,avc,fixed:basic+thirteenth,
    variable:bonus+avc,total:basic+thirteenth+bonus+avc};
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



