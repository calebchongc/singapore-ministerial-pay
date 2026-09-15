'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSalaryTool } from '@/lib/use-salary-tool';
import { ArrowDown, ArrowUpRight, RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { calculate, calculatePersonal, currency, linkedBonuses, scaleComparison, GRAPHICS, parseAvc, SOURCES, type GraphicMode, type Role, type Framework } from '@/lib/salary';

export default function Home() {
  const [role,setRole]=useState<Role>('mr4');
  const [framework,setFramework]=useState<Framework>('previous');
  const [graphic,setGraphic]=useState<GraphicMode>('money');
  const [bonus,setBonus]=useState(linkedBonuses('mr4',6));
  const [avc,setAvc]=useState(1);
  const [avcText,setAvcText]=useState('1');
  const [custom,setCustom]=useState(false);
  const [personal,setPersonal]=useState(false);
  const [personalMonthly,setPersonalMonthly]=useState(5000);
  const [personalMonthlyText,setPersonalMonthlyText]=useState('5000');
  const [avatar,setAvatar]=useState<'male'|'female'>('male');
  const [personalModal,setPersonalModal]=useState(false);
  const [personalError,setPersonalError]=useState('');
  const [expanded,setExpanded]=useState(false);
  const [announcement,setAnnouncement]=useState('');
  useSalaryTool(useCallback(s=>{setRole(s.role);setFramework(s.framework);setBonus(s.bonus);setAvc(s.avc);setAvcText(String(s.avc));if(s.graphic)setGraphic(s.graphic);setCustom(true);},[]));
  const months=bonus.performance+bonus.national;
  const pay=personal?calculatePersonal(personalMonthly,months,avc):calculate(role,framework,bonus,avc);
  const graphicConfig=GRAPHICS[graphic];
  const equivalent=scaleComparison(pay.total,graphic);
  const grid=graphic==='money'?{columns:8,leftStep:10.7,rowStep:6.95}:graphic==='rice'?{columns:7,leftStep:12,rowStep:9.826}:{columns:6,leftStep:13.6,rowStep:48/7};
  const equivalentText=graphic==='money'?'':graphic==='rice'?equivalent.quantity.toLocaleString('en-SG')+' plates':equivalent.quantity.toLocaleString('en-SG',{maximumFractionDigits:1})+'× annual median household income';
  const other=personal?calculate('mr4',framework,linkedBonuses('mr4',6),1):calculate(role,framework==='previous'?'revised':'previous',bonus,avc);
  const avcError=parseAvc(avcText)===null;
  const level=personal?'Your salary':custom?'Custom':months===6?'Norm bonuses':months===0?'Minimum bonuses':months===12?'Maximum bonuses':'Your scenario';
  useEffect(()=>{const timer=setTimeout(()=>setAnnouncement('Total annual pay '+currency(pay.total)+(equivalentText?'. Equivalent to '+equivalentText:'')),350);return()=>clearTimeout(timer);},[pay.total,equivalentText]);
  function changeRole(value: Role) {setRole(value);setBonus(linkedBonuses(value,months));setCustom(false);setPersonal(false);}
  function reset(){setBonus(personal?{performance:6,national:0}:linkedBonuses(role,6));setAvc(1);setAvcText('1');setCustom(false);}
  function savePersonal(){const value=Number(personalMonthlyText);if(!Number.isFinite(value)||value<=0){setPersonalError('Enter a monthly base salary above zero.');return;}setPersonalMonthly(value);setPersonalError('');setPersonal(true);setPersonalModal(false);setCustom(false);}
  const parts=[
    {name:'Basic salary',months:12,value:pay.basic,colour:'basic'},
    {name:'13th-month payment',months:1,value:pay.thirteenth,colour:'thirteenth'},
    {name:'Annual Variable Component',months:avc,value:pay.avc,colour:'avc'},
    ...(personal?[{name:'Bonus',months,value:pay.performance,colour:'performance'}]:role==='mr4'?[{name:'Performance bonus',months:bonus.performance,value:pay.performance,colour:'performance'}]:[]),
    ...(!personal?[{name:'National bonus',months:bonus.national,value:pay.national,colour:'national'}]:[]),
  ];
  return <main>
    <header className="masthead"><a href="#" className="wordmark"><span className="brand-dot"/> THE PAY PACKET</a><a href="#sources" className="source-link">Follow the numbers <ArrowUpRight size={15}/></a></header>
    <div className="page-heading"><p className="eyebrow">SINGAPORE · MINISTERIAL SALARIES</p><h1>What's in the <span>pay packet?</span></h1><p>Pick a role. Move the bonus. See what adds up.</p></div>
    <section className="calculator" aria-label="Ministerial salary calculator">
      <div className="choices">
        <p className="calculator-intro">Explore the pay packet</p>
        <div className="framework-choice"><p className="control-label" id="framework-label">Framework</p>
          <RadioGroup value={framework} onValueChange={v=>setFramework(v as Framework)} aria-labelledby="framework-label" className="segmented framework">
            <label><RadioGroupItem value="previous"/><span>Previous</span></label><label><RadioGroupItem value="revised"/><span>2026 benchmark</span></label>
          </RadioGroup>
        </div>
      </div>
      <div className="visual-strip">
        <div className="minister-picker">
          <p id="role-label" className="control-label">Choose your minister</p>
          <RadioGroup value={role} onValueChange={v=>changeRole(v as Role)} aria-labelledby="role-label" aria-describedby="portrait-note" className="portrait-options">
            {([{value:'mr4',image:'chan-chun-sing',label:'MR4 minister',name:'Chan Chun Sing',caption:'MR4 example'},{value:'pm',image:'lawrence-wong',label:'Prime Minister',name:'Lawrence Wong',caption:'Prime Minister'}] as const).map(person=>
              <label key={person.value} className="portrait-option">
                <RadioGroupItem value={person.value} aria-label={person.label}/>
                <img src={'/art/'+person.image+'.png'} alt="" width="1024" height="1536" loading="eager" decoding="async" fetchPriority={person.value === 'mr4' ? 'high' : 'low'}/>
                <span className="portrait-rank">{person.caption}</span>
                <span className="portrait-name">{person.name}</span>
                <span className="portrait-status" aria-hidden="true">{role===person.value?'✓ Selected':'Select'}</span>
              </label>
            )}
            <button type="button" className={'portrait-option personal-option '+(personal?'selected':'')} onClick={()=>setPersonalModal(true)} aria-haspopup="dialog">
              <img src={'/art/your-avatar-'+avatar+'.png'} alt="" width="1024" height="1536" loading="eager" decoding="async"/>
              <span className="portrait-rank">Your salary</span>
              <span className="portrait-name">Choose avatar</span>
              <span className="portrait-status" aria-hidden="true">{personal?'✓ Selected':'Compare yours'}</span>
            </button>
          </RadioGroup>
          <div className="graphic-choice">
            <p id="graphic-label">Show the value as</p>
            <RadioGroup value={graphic} onValueChange={v=>setGraphic(v as GraphicMode)} aria-labelledby="graphic-label" className="graphic-options">
              {(Object.keys(GRAPHICS) as GraphicMode[]).map(mode=><label key={mode}><RadioGroupItem value={mode}/><img src={'/art/'+GRAPHICS[mode].image} alt="" width="24" height="24" loading="eager" decoding="async"/><span>{GRAPHICS[mode].label}</span></label>)}
            </RadioGroup>
          </div>
        </div>
        <div className="money-panel">
          <div className="total-label"><span>TOTAL ANNUAL PAY</span><span className="scenario-tag">{level}</span></div>
          <div className="total" data-testid="total">{currency(pay.total)}</div>
          <div className="total-meta"><span><i className="dot basic"/>{currency(pay.fixed)} fixed</span><span><i className="dot national"/>{currency(pay.variable)} variable</span></div>
          {equivalentText&&<p className="equivalent-value" data-testid="equivalent">{graphic==='household'?'≈ ':''}{equivalentText}</p>}
          <div className={'money-scene money-scene-'+graphic} aria-hidden="true"><div className="money-field">{Array.from({length:48},(_,i)=>{
            const opacity=Math.max(0,Math.min(1,equivalent.icons-i));
            const fraction=Math.max(0,Math.min(1,equivalent.icons-i));
            return <div key={i} className={graphic==='money'?'money-bundle':graphic==='household'?'hdb-reveal':'comparison-icon'} style={{left:((i%grid.columns)*grid.leftStep)+'%',bottom:'calc('+Math.floor(i/grid.columns)+' * '+grid.rowStep+'cqw)',opacity,zIndex:graphic==='money'?undefined:48-i,transform:'translateY('+(opacity?0:12)+'px)'}}>{graphic==='household'?<div className="hdb-block" style={{clipPath:'inset(0 '+((1-fraction)*100)+'% 0 0)'}}/>:<img src={'/art/'+graphicConfig.image} width="1024" height="1024" alt=""/>}</div>;
          })}</div></div>
          <span className="money-scale">{graphicConfig.legend}{equivalent.icons>48?' · Graphic capped at 48 icons; count shown in full.':''}</span>
        </div>
      </div>
      {personalModal&&<div className="personal-modal-backdrop" role="presentation" onMouseDown={()=>setPersonalModal(false)}><section className="personal-modal" role="dialog" aria-modal="true" aria-labelledby="personal-title" onMouseDown={event=>event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={()=>setPersonalModal(false)} aria-label="Close">×</button>
        <p className="eyebrow">YOUR PAY PACKET</p><h2 id="personal-title">Think you are minister material? Compare your own salary.</h2>
        <p>Choose a faceless avatar, then enter your monthly base salary. The same 13th-month, AVC and bonus controls apply.</p>
        <div className="avatar-choice" aria-label="Choose avatar"><button type="button" className={avatar==='male'?'selected':''} onClick={()=>setAvatar('male')}><img src="/art/your-avatar-male.png" alt="Masculine silhouette"/><span>Masculine silhouette</span></button><button type="button" className={avatar==='female'?'selected':''} onClick={()=>setAvatar('female')}><img src="/art/your-avatar-female.png" alt="Feminine silhouette"/><span>Feminine silhouette</span></button></div>
        <label className="personal-income" htmlFor="personal-monthly">Monthly base salary <span>SGD</span><input id="personal-monthly" type="number" inputMode="decimal" min="0" step="100" value={personalMonthlyText} onChange={event=>{setPersonalMonthlyText(event.target.value);setPersonalError('');}}/></label>
        {personalError&&<p className="error" role="alert">{personalError}</p>}<button type="button" className="personal-submit" onClick={savePersonal}>Compare my salary</button>
      </section></div>}
      <p id="portrait-note" className="art-caption">Illustrative pay, not personal salary disclosure. Chan Chun Sing represents an MR4 example; his grade is not asserted.</p>
      <div className="working-panel">
        <p className="slider-intro">Slide to see the bonus add up</p>
        <div className="bonus-control"><div className="bonus-heading"><label id="bonus-label">{personal?'Additional bonus':role==='pm'?'National bonus':'Performance + national bonuses'}</label><strong>{months.toLocaleString('en-SG',{maximumFractionDigits:2})}<small> months</small></strong></div>
          <Slider aria-labelledby="bonus-label" aria-describedby="bonus-assumption" value={[months]} min={0} max={12} step={0.25} onValueChange={v=>{const next=Array.isArray(v)?v[0]:v;setBonus(personal?{performance:next,national:0}:linkedBonuses(role,next));setCustom(false);}} className="bonus-slider"/>
          <div className="slider-ticks"><span>Min · 0</span><span>Norm · 6</span><span>Max · 12</span></div>
          <p className="bonus-value">{currency(pay.performance+pay.national)} <span>in {personal?'additional bonus':role==='pm'?'national bonus':'performance + national bonuses'}</span></p>
          <p id="bonus-assumption" className="assumption">Plus {avc} month{avc===1?'':'s'} AVC. {personal?'Your salary uses the same illustrative calculator, not an employment contract.':months===12?(role==='pm'?'Maximum national bonus; AVC is a separate assumption.':'Maximum performance + national bonuses; AVC is a separate assumption.'):'AVC is a separate variable payment.'}</p>
        </div>
        <div className="control-actions"><button onClick={()=>setExpanded(!expanded)} aria-expanded={expanded} aria-controls={expanded?'components':undefined}><SlidersHorizontal size={15}/> Adjust components <ChevronDown size={14} className={expanded?'rotated':''}/></button><button onClick={reset} aria-label="Reset to norm"><RotateCcw size={14}/><span>Reset to norm</span></button></div>
        {expanded&&<div id="components" className="advanced">
          {!personal&&role==='mr4'&&<div><div className="bonus-heading"><label id="pb-label">Performance bonus</label><strong>{bonus.performance} months</strong></div><Slider aria-labelledby="pb-label" value={[bonus.performance]} min={0} max={6} step={0.25} onValueChange={v=>{setBonus({...bonus,performance:Array.isArray(v)?v[0]:v});setCustom(true);}}/></div>}
          {!personal&&<div><div className="bonus-heading"><label id="nb-label">National bonus</label><strong>{bonus.national} months</strong></div><Slider aria-labelledby="nb-label" value={[bonus.national]} min={0} max={role==='pm'?12:6} step={0.25} onValueChange={v=>{setBonus({...bonus,national:Array.isArray(v)?v[0]:v});setCustom(true);}}/></div>}
          {personal&&<div><div className="bonus-heading"><label id="personal-bonus-label">Additional bonus</label><strong>{months} months</strong></div><Slider aria-labelledby="personal-bonus-label" value={[months]} min={0} max={12} step={0.25} onValueChange={v=>{const next=Array.isArray(v)?v[0]:v;setBonus({performance:next,national:0});setCustom(true);}}/></div>}
          {!personal&&role==='pm'&&<p>The PM has no individual performance bonus. The national bonus is doubled.</p>}
          <div className="avc-row"><label htmlFor="avc">Annual Variable Component<small>Assumption, in months</small></label><input id="avc" type="number" inputMode="decimal" min="0" step="any" value={avcText} aria-invalid={avcError} aria-describedby={avcError?'avc-error':'avc-help'} onChange={e=>{setAvcText(e.target.value);const next=parseAvc(e.target.value);if(next!==null){setAvc(next);setCustom(true);}}}/></div>
          {avcError?<p id="avc-error" role="alert" className="error">Enter a valid non-negative number. The total keeps the last valid AVC.</p>:<p id="avc-help">The norm assumes 1 month. This field does not set a policy maximum.</p>}
        </div>}
        <div className="comparison"><div><span>{personal?'MR4 REFERENCE PAY':framework==='previous'?'AT THE 2026 BENCHMARK':'UNDER THE PREVIOUS FRAMEWORK'}</span><strong>{currency(other.total)}</strong></div><div className="difference">{other.total>pay.total?'+':'−'}{currency(Math.abs(other.total-pay.total))}<small>{personal?'at published norm':'Same bonus assumptions'}</small></div></div>
        <a href="#breakdown" className="breakdown-link">See every component <ArrowDown size={15}/></a>
      </div>
    </section>
    <section id="breakdown" className="lower-grid">
      <div className="breakdown"><p className="eyebrow">THE SUM OF THE PARTS</p><h2>Your pay packet, opened.</h2><div className="stacked-bar" aria-hidden="true">{parts.map(p=><span key={p.name} className={p.colour} style={{width:(p.value/pay.total*100)+'%'}}/>)}</div>
        <div className="table-heading"><span>COMPONENT</span><span>MONTHS</span><span>ANNUAL AMOUNT</span></div>
        {parts.map(p=><div className="pay-row" key={p.name}><span><i className={'dot '+p.colour}/>{p.name}</span><span>{p.months}</span><strong>{currency(p.value)}</strong></div>)}
        <div className="pay-row sum"><strong>Total annual pay</strong><span>{13+avc+months}</span><strong>{currency(pay.total)}</strong></div>
        <p className="footnote">Monthly reference: {currency(pay.monthly)}. {personal?'This is your entered base salary.':'The published annual norm already includes norm bonuses.'}</p>
      </div>
      <aside className="october"><p className="eyebrow">BENCHMARK ≠ IMMEDIATE PAY</p><h2>What changes in October?</h2><p>From <strong>15 October 2026</strong>, existing officeholders receive a one-off adjustment of <strong>up to 9%</strong>, depending on individual circumstances.</p><div className="october-example"><span>MR4 · ANNUALISED EXAMPLE AT 9%</span><strong>S$1.1m <ArrowUpRight size={21}/> S$1.199m</strong></div><p>The S$1.8m figure is the full new MR4 benchmark. It is not an immediate salary for every minister.</p><a href={SOURCES.october} target="_blank" rel="noreferrer">Read the announcement <ArrowUpRight size={15}/></a></aside>
    </section>
    <section id="sources" className="sources"><details><summary><span>Sources & how this works</span><ChevronDown size={18}/></summary><div className="source-body">
      <p>Figures verified 15 September 2026. All amounts are Singapore dollars, annualised and before tax. Calculations use the published reference point, not an individual's salary or the upper end of a salary band.</p>
      <p>Monthly reference = annual norm ÷ 20. Fixed pay = 12 months + a fixed 13th month. Add the selected AVC, performance and national bonus months. MR4 norm: 1 AVC + 3 performance + 3 national. PM norm: 1 AVC + 6 national, with no performance bonus.</p>
      <p>The main slider moves MR4 performance and national bonuses together; for the PM it moves national bonus only. Changing role redistributes their combined months to the selected role. Adjusting components independently creates a custom scenario. Moving the main slider links them again and retains AVC.</p>
      <p>Bonuses model payouts, not the economic indicators used to decide them. Salary bands permit pay above and below the reference point. The value per icon and row spacing stay fixed across roles, frameworks and slider positions. One money bundle represents S$100,000; each rice graphic represents 25,000 plates at the assumed S$4 per plate. Plate totals are rounded down to whole plates. One HDB block represents annual median household income. Partial HDB blocks reveal from left to right. Illustrations stop at 48 icons; numerical totals continue.</p>
      <p>The HDB scale uses S$149,352 a year, calculated from the 2025 median monthly household market income of S$12,446. This <a href={SOURCES.household} target="_blank" rel="noreferrer">SingStat measure</a> covers resident households and includes employment income (including employer CPF contributions) and non-employment income. It is household income, not individual take-home pay.</p>
      <p>The current report gives a typical AVC of 1 month, not a universal maximum. The 2025 civil-service AVC was 1.7 months. “Maximum” here refers only to performance and national bonuses at the stated AVC assumption.</p>
      <ul><li><a href={SOURCES.framework} target="_blank" rel="noreferrer">PSD framework explainer · 20-month norm ↗</a></li><li><a href={SOURCES.previous} target="_blank" rel="noreferrer">2012 PSD release · performance and National Bonus limits ↗</a></li><li><a href={SOURCES.revised} target="_blank" rel="noreferrer">2026 review · Table 3 and Annex E ↗</a></li><li><a href={SOURCES.october} target="_blank" rel="noreferrer">PMO · implementation announcement, 8 September 2026 ↗</a></li><li><a href={SOURCES.avc} target="_blank" rel="noreferrer">PSD · 2025 civil-service AVC ↗</a></li></ul>
    </div></details></section>
    <footer><span><span className="brand-dot"/> THE PAY PACKET</span><p>An independent explainer. Illustrations are caricatures, not personal pay disclosures.</p><span>SGD · 2026</span></footer>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
  </main>;
}




