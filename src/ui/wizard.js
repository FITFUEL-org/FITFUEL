import { U, ui } from "../state.js";
import { save } from "../storage.js";
import { $, esc, hero, toast } from "./dom.js";
import { enter } from "./tabs.js";
import { ST } from "../data/wizard.js";
import { calculateBmi, ftin, bmiTxt } from "../logic/body.js";

// Onboarding wizard: step rendering, BMI guard rails and navigation.
export const bmiOf=()=>calculateBmi(U.weight,U.height);
export const fmt=s=>{const x=U[s.id];return s.id=="height"?(U.hu=="ft"?ftin(x):x+" cm"):(U.wu=="lbs"?Math.round(x*2.2046)+" lbs":x+" kg")};
export function guard(s){const h2=(U.height/100)**2,b=U.weight/h2,lo=Math.ceil(18.5*h2),hi=Math.floor(24.9*h2);
 if(s.id=="weight"&&b<18.5&&U.goal=="red")return{k:U.age<18?"warn":"bad",x:`<b>Warning: BMI ${b.toFixed(1)} is underweight.</b> Losing more weight can harm your health. A healthy weight for your height is about ${lo}–${hi} kg. Please choose a different goal.`,f:[["g:mus","Build muscle mass"],["g:hea","Improve health and wellness"]]};
 if(s.id=="target"){const tb=U.target/h2;
  if(tb<18.5)return{k:U.age<18?"warn":"bad",x:`<b>Warning:</b> a target of ${U.target} kg gives a BMI of ${tb.toFixed(1)}, which is underweight. A healthy weight for your height is about ${lo}–${hi} kg.`,f:[["t:"+lo,"Set a safe target ("+lo+" kg)"]]};
  if(b>=25&&U.target>U.weight+1)return{k:"warn",x:`<b>Note:</b> your BMI is already ${b.toFixed(1)}. Gaining more weight may not be healthy. Build muscle only with a doctor or dietitian's advice.`}}
 return null}
export function fb(s){const e=$("fb");if(!e)return;let h="";
 if(s.id=="weight"){const b=bmiOf();h=`<h3>Your current BMI: ${b.toFixed(1)}</h3><p style="margin:0">${bmiTxt(b)}</p>`}
 else if(s.id=="target"){const p=(U.target-U.weight)/U.weight*100,a=Math.abs(p);h=`<h3>${a<.5?"Maintain your weight":a<=10?"Reasonable target!":"Big change, go step by step"}</h3><p style="margin:0">${a<.5?"You'll keep your current weight.":`You will ${p<0?"lose":"gain"} ${a.toFixed(1)}% of body weight. ${a>10?"Aim for a steady pace and review your target in a few weeks.":"Steady, moderate change is the easiest to keep."}`}</p>`}
 else{e.hidden=true;return}
 const g=guard(s);if(g)h+=`<div class="guard ${g.k}">${g.x}<div>${(g.f||[]).map(([v,l])=>`<button type="button" data-fx="${v}">${l}</button>`).join("")}</div></div>`;e.innerHTML=h}
export function draw1(){const s=ST[ui.si],v=U[s.id];$("pgi").style.width=(ui.si+1)/ST.length*100+"%";$("wb").hidden=ui.si==0;$("wn").textContent=ui.si==ST.length-1?"Show my dashboard":"Next";
 let h=(ui.si==0?hero("wiz"):`<div class="stepn">Step ${ui.si+1} of ${ST.length}</div>`)+`<h2>${s.t}</h2>`+(s.s?`<p class="wsub">${s.s}</p>`:"");
 if(s.k=="basic")h+=`<div class="grid"><label class="field">Your name<input id="wname" maxlength="60" autocomplete="given-name" value="${esc(U.name||"")}"></label><label class="field">Age (years)<input id="wage" type="number" min="13" max="100" value="${U.age||""}"></label></div>`;
 else if(s.k=="chips")h+=`<div class="chips">${s.o.map(([k,l])=>`<button type="button" class="pill" data-v="${k}" aria-pressed="${(v||[]).includes(k)}">${l}</button>`).join("")}</div><p class="wsub">Chest, back, arms and more have upper, middle and lower options in the Exercises tab.</p>`;
 else if(s.k=="one"||s.k=="multi")h+=`<div class="opts${s.two?" two":""}">${s.o.map(([k,ic,l,d])=>`<button type="button" class="opt${s.two?" fig":""}" data-v="${k}" aria-pressed="${s.k=="one"?v==k:(v||[]).includes(k)}">${ic?`<span class="ic">${ic}</span>`:""}<span>${l}${d?`<small>${d}</small>`:""}</span></button>`).join("")}</div>`;
 else if(s.k=="slider"){if(v==null)U[s.id]=s.def();const hh=s.id=="height",un=hh?["cm","ft"]:["kg","lbs"],uk=hh?"hu":"wu";
  h+=`<div class="seg">${un.map(x=>`<button type="button" data-u="${x}" aria-pressed="${(U[uk]||un[0])==x}">${x}</button>`).join("")}</div><div class="num" id="num">${fmt(s)}</div><input type="range" id="rg" aria-label="${s.t}" min="${s.min}" max="${s.max}" value="${U[s.id]}"><div class="card" id="fb"></div>`}
 else if(s.k=="days")h+=`<div class="opts two">${[2,3,4,5,6,7].map(n=>`<button type="button" class="opt" data-v="${n}" aria-pressed="${U.days==n}">${n} days/week</button>`).join("")}</div><p class="wsub" style="margin-top:22px">Pick your workout week's start day.</p><div class="chips">${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d=>`<button type="button" class="pill sm" data-w="${d}" aria-pressed="${U.wk==d}">${d}</button>`).join("")}</div>`;
 $("wq").innerHTML=h;if(s.k=="slider")fb(s);chk()}
export const ok=()=>{const s=ST[ui.si],v=U[s.id],gd=s.k=="slider"?guard(s):null;if(gd&&gd.k=="bad")return false;return s.k=="basic"?!!U.name&&U.age>=13&&U.age<=100:s.k=="slider"?true:s.k=="days"?!!(U.days&&U.wk):(s.k=="multi"||s.k=="chips")?(v||[]).length>0:v!=null};
export const chk=()=>{$("wn").disabled=!ok()};
// Wire up wizard events.
export function bindWizard(){
$("wq").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const s=ST[ui.si],d=b.dataset;
 if(d.u){U[s.id=="height"?"hu":"wu"]=d.u;draw1();return}
 if(d.w){U.wk=d.w;draw1();return}
 if(d.fx){const[a,v]=d.fx.split(":");if(a=="g")U.goal=v;else U.target=+v;draw1();return}
 if(d.v==null)return;
 if(s.k=="one")U[s.id]=s.num?+d.v:d.v;else if(s.k=="days")U.days=+d.v;
 else{let a=U[s.id]||[];const ex=["all","none","full"];a=a.includes(d.v)?a.filter(x=>x!=d.v):ex.includes(d.v)?[d.v]:[...a.filter(x=>!ex.includes(x)),d.v];U[s.id]=a}
 draw1()});
$("wq").addEventListener("input",e=>{const s=ST[ui.si],i=e.target.id;if(i=="wname")U.name=e.target.value.trim();if(i=="wage")U.age=+e.target.value;if(i=="rg"){U[s.id]=+e.target.value;$("num").textContent=fmt(s);fb(s)}chk()});
$("wb").onclick=()=>{if(ui.si>0){ui.si--;draw1()}};
$("wn").onclick=()=>{if(!ok())return;if(ui.si<ST.length-1){ui.si++;draw1();scrollTo(0,0)}else{U.done=1;if(!U.start)U.start=U.weight;U.fk=(U.foc||[]).includes(U.fk)?U.fk:(U.foc||["full"])[0];save();enter();toast("Saved on this device. No need to enter details again.")}};
}
