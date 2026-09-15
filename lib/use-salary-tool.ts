'use client';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { calculate, parseAvc, scaleComparison, type GraphicMode, type Role, type Framework, type Bonuses } from './salary';

type Scenario = {role:Role;framework:Framework;bonus:Bonuses;avc:number;graphic?:GraphicMode};
type Context = {registerTool(tool: {name:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown},options:{signal:AbortSignal}):void|Promise<void>};
export function useSalaryTool(apply:(scenario:Scenario)=>void) {
  useEffect(()=>{
    const context=(document as Document & {modelContext?:Context}).modelContext;
    if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    const tool={name:'configure_salary_scenario',description:'Set the visible Singapore salary calculator to a reference framework scenario and return its annual components. This is not personal salary disclosure.',
      inputSchema:{type:'object',properties:{role:{type:'string',enum:['mr4','pm']},framework:{type:'string',enum:['previous','revised']},performance:{type:'number',minimum:0,maximum:6,description:'Must be zero for PM; 0 to 6 for MR4.'},national:{type:'number',minimum:0,maximum:12,description:'0 to 6 for MR4; 0 to 12 for PM.'},avc:{type:'number',minimum:0},graphic:{type:'string',enum:['money','rice','household'],description:'Optional illustration scale; preserves the current selection if omitted.'}},required:['role','framework','performance','national','avc'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input:unknown){
        if(!input||typeof input!=='object')throw new Error('Provide a salary scenario.');
        const p=input as Record<string,unknown>;
        if(Object.keys(p).some(k=>!['role','framework','performance','national','avc','graphic'].includes(k))||
          (p.graphic!==undefined&&p.graphic!=='money'&&p.graphic!=='rice'&&p.graphic!=='household')||
          (p.role!=='mr4'&&p.role!=='pm')||(p.framework!=='previous'&&p.framework!=='revised')||
          typeof p.performance!=='number'||!Number.isFinite(p.performance)||p.performance<0||p.performance>(p.role==='pm'?0:6)||
          typeof p.national!=='number'||!Number.isFinite(p.national)||p.national<0||p.national>(p.role==='pm'?12:6)||
          typeof p.avc!=='number'||parseAvc(String(p.avc))===null)throw new Error('Invalid role, framework or bonus months. PM performance must be zero.');
        const scenario:Scenario={role:p.role,framework:p.framework,bonus:{performance:p.performance,national:p.national},avc:p.avc,graphic:p.graphic as GraphicMode|undefined};
        flushSync(()=>apply(scenario));
        const pay=calculate(scenario.role,scenario.framework,scenario.bonus,scenario.avc);
        return {role:p.role,framework:p.framework,...pay,...(scenario.graphic?{graphic:scenario.graphic,comparison:scaleComparison(pay.total,scenario.graphic)}:{})};
      }};
    try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser capability. Calculator remains fully available. */}
    return()=>lifecycle.abort();
  },[apply]);
}

