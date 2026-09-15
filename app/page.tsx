'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSalaryTool } from '@/lib/use-salary-tool';
import { ArrowDown, ArrowUpRight, RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { calculate, currency, linkedBonuses, moneyUnits, parseAvc, SOURCES, type Role, type Framework } from '@/lib/salary';

export default function Home() {
  const [role,setRole]=useState<Role>('mr4');
  const [framework,setFramework]=useState<Framework>('previous');
  const [bonus,setBonus]=useState(linkedBonuses('mr4',6));
  const [avc,setAvc]=useState(1);
  const [avcText,setAvcText]=useState('1');
  const [custom,setCustom]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [announcement,setAnnouncement]=useState('');
  useSalaryTool(useCallback(s=>{setRole(s.role);setFramework(s.framework);setBonus(s.bonus);setAvc(s.avc);setAvcText(String(s.avc));setCustom(true);},[]));
  const pay=calculate(role,framework,bonus,avc);
  const other=calculate(role,framework==='previous'?'revised':'previous',bonus,avc);
  const months=bonus.performance+bonus.national;
  const avcError=parseAvc(avcText)===null;
  const level=custom?'Custom':months===6?'Norm bonuses':months===0?'Minimum bonuses':months===12?'Maximum bonuses':'Your scenario';
  useEffect(()=>{const timer=setTimeout(()=>setAnnouncement('Total annual pay '+currency(pay.total)),350);return()=>clearTimeout(timer);},[pay.total]);
  function changeRole(value: Role) {setRole(value);setBonus(linkedBonuses(value,months));setCustom(false);}
  function reset(){setBonus(linkedBonuses(role,6));setAvc(1);setAvcText('1');setCustom(false);}
  const parts=[
    {name:'Basic salary',months:12,value:pay.basic,colour:'basic'},
    {name:'13th-month payment',months:1,value:pay.thirteenth,colour:'thirteenth'},
    {name:'Annual Variable Component',months:avc,value:pay.avc,colour:'avc'},
    ...(role==='mr4'?[{name:'Performance bonus',months:bonus.performance,value:pay.performance,colour:'performance'}]:[]),
    {name:'National bonus',months:bonus.national,value:pay.national,colour:'national'},
  ];
  return <main>
    <header className="masthead"><a href="#" className="wordmark"><span className="brand-dot"/> THE PAY PACKET</a><a href="#sources" className="source-link">Follow the numbers <ArrowUpRight size={15}/></a></header>
    <div className="page-heading"><p className="eyebrow">SINGAPORE · MINISTERIAL SALARIES</p><h1>What's in the <span>pay packet?</span></h1><p>Pick a role. Move the bonus. See what adds up.</p></div>
    <section className="calculator" aria-label="Ministerial salary calculator">
      <div className="choices">
        <div><p className="control-label" id="role-label"><span>01</span> Choose a role</p>
          <RadioGroup value={role} onValueChange={v=>changeRole(v as Role)} aria-labelledby="role-label" className="segmented">
            <label><RadioGroupItem value="mr4"/><span>MR4 minister</span></label><label><RadioGroupItem value="pm"/><span>Prime Minister</span></label>
          </RadioGroup>
        </div>
        <div><p className="control-label" id="framework-label"><span>02</span> Choose a framework</p>
          <RadioGroup value={framework} onValueChange={v=>setFramework(v as Framework)} aria-labelledby="framework-label" className="segmented framework">
            <label><RadioGroupItem value="previous"/><span>Previous</span></label><label><RadioGroupItem value="revised"/><span>2026 benchmark</span></label>
          </RadioGroup>
        </div>
      </div>
      <div className="stage">
        <div className="stage-top"><span className="pill">{role==='mr4'?'MR4 · ENTRY-LEVEL MINISTER':'PRIME MINISTER'}</span><span className="stage-index">{framework==='previous'?'2012 FRAMEWORK':'2026 BENCHMARK'}</span></div>
        <div className="character-scene" aria-hidden="true">
          <span className="scene-circle"/><span className="scene-note">A little perspective<br/>on a big number.</span>
          <img className="character" src={'/art/'+(role==='mr4'?'chan-chun-sing':'lawrence-wong')+'.png'} alt="" width="1024" height="1536"/>
          <div className="money-field">{Array.from({length:48},(_,i)=>{
            const opacity=Math.max(0,Math.min(1,moneyUnits(pay.total)-i));
            return <div key={i} className="money-bundle" style={{left:((i%6)*14+1)+'%',bottom:(Math.floor(i/6)*14)+'px',opacity,transform:'translateY('+(opacity?0:12)+'px) rotate('+(i%2?4:-4)+'deg)'}}><img src="/art/money-stack.png" width="1536" height="1024" alt=""/></div>;
          })}</div>
        </div>
        <div className="art-caption">Illustrative framework calculation, not this person's disclosed salary.<span>{role==='mr4'?'Chan Chun Sing illustrates the role; his salary grade is not asserted.':'Lawrence Wong illustrates the Prime Minister role.'}</span></div>
      </div>
      <div className="working-panel">
        <div className="total-label"><span>TOTAL ANNUAL PAY</span><span className="scenario-tag">{level}</span></div>
        <div className="total" data-testid="total">{currency(pay.total)}</div>
        <div className="total-meta"><span><i className="dot basic"/>{currency(pay.fixed)} fixed</span><span><i className="dot national"/>{currency(pay.variable)} variable</span></div>
        <div className="bonus-control"><div className="bonus-heading"><label id="bonus-label">{role==='pm'?'National bonus':'Performance + national bonuses'}</label><strong>{months.toLocaleString('en-SG',{maximumFractionDigits:2})}<small> months</small></strong></div>
          <Slider aria-labelledby="bonus-label" aria-describedby="bonus-assumption" value={[months]} min={0} max={12} step={0.25} onValueChange={v=>{setBonus(linkedBonuses(role,Array.isArray(v)?v[0]:v));setCustom(false);}} className="bonus-slider"/>
          <div className="slider-ticks"><span>Min · 0</span><span>Norm · 6</span><span>Max · 12</span></div>
          <p id="bonus-assumption" className="assumption">Plus {avc} month{avc===1?'':'s'} AVC. {months===12?(role==='pm'?'Maximum national bonus; AVC is a separate assumption.':'Maximum performance + national bonuses; AVC is a separate assumption.'):'AVC is a separate variable payment.'}</p>
        </div>
        <div className="control-actions"><button onClick={()=>setExpanded(!expanded)} aria-expanded={expanded} aria-controls={expanded?'components':undefined}><SlidersHorizontal size={15}/> Adjust components <ChevronDown size={14} className={expanded?'rotated':''}/></button><button onClick={reset} aria-label="Reset to norm"><RotateCcw size={14}/><span>Reset to norm</span></button></div>
        {expanded&&<div id="components" className="advanced">
          {role==='mr4'&&<div><div className="bonus-heading"><label id="pb-label">Performance bonus</label><strong>{bonus.performance} months</strong></div><Slider aria-labelledby="pb-label" value={[bonus.performance]} min={0} max={6} step={0.25} onValueChange={v=>{setBonus({...bonus,performance:Array.isArray(v)?v[0]:v});setCustom(true);}}/></div>}
          <div><div className="bonus-heading"><label id="nb-label">National bonus</label><strong>{bonus.national} months</strong></div><Slider aria-labelledby="nb-label" value={[bonus.national]} min={0} max={role==='pm'?12:6} step={0.25} onValueChange={v=>{setBonus({...bonus,national:Array.isArray(v)?v[0]:v});setCustom(true);}}/></div>
          {role==='pm'&&<p>The PM has no individual performance bonus. The national bonus is doubled.</p>}
          <div className="avc-row"><label htmlFor="avc">Annual Variable Component<small>Assumption, in months</small></label><input id="avc" type="number" inputMode="decimal" min="0" step="any" value={avcText} aria-invalid={avcError} aria-describedby={avcError?'avc-error':'avc-help'} onChange={e=>{setAvcText(e.target.value);const next=parseAvc(e.target.value);if(next!==null){setAvc(next);setCustom(true);}}}/></div>
          {avcError?<p id="avc-error" role="alert" className="error">Enter a valid non-negative number. The total keeps the last valid AVC.</p>:<p id="avc-help">The norm assumes 1 month. This field does not set a policy maximum.</p>}
        </div>}
        <div className="comparison"><div><span>{framework==='previous'?'AT THE 2026 BENCHMARK':'UNDER THE PREVIOUS FRAMEWORK'}</span><strong>{currency(other.total)}</strong></div><div className="difference">{other.total>pay.total?'+':'−'}{currency(Math.abs(other.total-pay.total))}<small>Same bonus assumptions</small></div></div>
        <a href="#breakdown" className="breakdown-link">See every component <ArrowDown size={15}/></a>
      </div>
    </section>
    <section id="breakdown" className="lower-grid">
      <div className="breakdown"><p className="eyebrow">THE SUM OF THE PARTS</p><h2>Your pay packet, opened.</h2><div className="stacked-bar" aria-hidden="true">{parts.map(p=><span key={p.name} className={p.colour} style={{width:(p.value/pay.total*100)+'%'}}/>)}</div>
        <div className="table-heading"><span>COMPONENT</span><span>MONTHS</span><span>ANNUAL AMOUNT</span></div>
        {parts.map(p=><div className="pay-row" key={p.name}><span><i className={'dot '+p.colour}/>{p.name}</span><span>{p.months}</span><strong>{currency(p.value)}</strong></div>)}
        <div className="pay-row sum"><strong>Total annual pay</strong><span>{13+avc+months}</span><strong>{currency(pay.total)}</strong></div>
        <p className="footnote">Monthly reference: {currency(pay.monthly)}. The published annual norm already includes norm bonuses.</p>
      </div>
      <aside className="october"><p className="eyebrow">BENCHMARK ≠ IMMEDIATE PAY</p><h2>What changes<br/>in October?</h2><p>From <strong>15 October 2026</strong>, existing officeholders receive a one-off adjustment of <strong>up to 9%</strong>, depending on individual circumstances.</p><div className="october-example"><span>MR4 · ANNUALISED EXAMPLE AT 9%</span><strong>S$1.1m <ArrowUpRight size={21}/> S$1.199m</strong></div><p>The S$1.8m figure is the full new MR4 benchmark. It is not an immediate salary for every minister.</p><a href={SOURCES.october} target="_blank" rel="noreferrer">Read the announcement <ArrowUpRight size={15}/></a></aside>
    </section>
    <section id="sources" className="sources"><details><summary><span>Sources & how this works</span><ChevronDown size={18}/></summary><div className="source-body">
      <p>Figures verified 15 September 2026. All amounts are Singapore dollars, annualised and before tax. Calculations use the published reference point, not an individual's salary or the upper end of a salary band.</p>
      <p>Monthly reference = annual norm ÷ 20. Fixed pay = 12 months + a fixed 13th month. Add the selected AVC, performance and national bonus months. MR4 norm: 1 AVC + 3 performance + 3 national. PM norm: 1 AVC + 6 national, with no performance bonus.</p>
      <p>The main slider moves MR4 performance and national bonuses together. Changing role redistributes their combined months to the selected role. Adjusting components independently creates a custom scenario. Moving the main slider links them again and retains AVC.</p>
      <p>Bonuses model payouts, not the economic indicators used to decide them. Salary bands permit pay above and below the reference point. The illustration uses the same scale throughout: one bundle unit per S$100,000, with partial units faded. Above S$4.8m the illustration is capped; the numerical calculation continues.</p>
      <p>The current report gives a typical AVC of 1 month, not a universal maximum. The 2025 civil-service AVC was 1.7 months. “Maximum” here refers only to performance and national bonuses at the stated AVC assumption.</p>
      <ul><li><a href={SOURCES.previous} target="_blank" rel="noreferrer">2012 White Paper · salary structure, paragraphs 77–78 ↗</a></li><li><a href={SOURCES.revised} target="_blank" rel="noreferrer">2026 review · Table 1 and Annex E ↗</a></li><li><a href={SOURCES.october} target="_blank" rel="noreferrer">PMO · implementation announcement, 8 September 2026 ↗</a></li><li><a href={SOURCES.avc} target="_blank" rel="noreferrer">PSD · 2025 civil-service AVC ↗</a></li></ul>
    </div></details></section>
    <footer><span><span className="brand-dot"/> THE PAY PACKET</span><p>An independent explainer. Illustrations are caricatures, not personal pay disclosures.</p><span>SGD · 2026</span></footer>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
  </main>;
}

