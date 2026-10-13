import { U, S, ui, resetState } from "../state.js";
import { $, esc } from "./dom.js";
import { exHtml } from "./exercises.js";
import { MEAL_PLANS, AGE_GROUPS } from "../data/meals.js";
import { GOAL_NAMES } from "../data/nutrition.js";
import { DEFAULT_EXERCISES } from "../data/exercises.js";
import { buildDayPlan, parseBlockedFoods } from "../logic/meals.js";
import { calculateBmi, ageGroupOf, budgetTier, estimateCalories, portionMultiplier } from "../logic/body.js";

// Diet planner: reads the form, computes the plan, renders the Diet tab.
export const DLB='<div class="dlrow noprint"><button type="button" data-act="dltxt">Download plan</button></div>';
export function syncUnits(){
 const hu=$("hu").value,wu=$("wu").value;
 if(hu!=ui.lastHu){const hv=+$("height").value;
  if(hu=="ft"){const ti=hv/2.54;let ft=Math.floor(ti/12),inch=Math.round(ti-ft*12);if(inch==12){ft++;inch=0}$("height").value=ft;$("inch").value=inch;$("inch").hidden=false}
  else{$("height").value=Math.round(((hv*12)+(+$("inch").value||0))*2.54);$("inch").hidden=true}
  ui.lastHu=hu}
 if(wu!=ui.lastWu){const wv=+$("weight").value;$("weight").value=wu=="lb"?Math.round(wv*2.2046):Math.round(wv*.45359*10)/10;ui.lastWu=wu}
 const h=hu=="ft"?((+$("height").value)*12+(+$("inch").value||0))*2.54:+$("height").value;
 const w=wu=="lb"?(+$("weight").value)*.45359:+$("weight").value;
 return{h,w}}
export function submit(e){
 e.preventDefault();
 const live=e.type!="submit";
 const{h,w}=syncUnits();const age=+$("age").value,goal=$("goal").value,health=$("health").checked,gender=$("gender").value,act=+$("activity").value;
 if(!(age>=13&&age<=100&&h>=120&&h<=220&&w>=30&&w<=250)){$("result").innerHTML='<div class="card warning"><p style="margin:0">Please enter a valid age (13–100), height (about 120–220 cm or 3 ft 11 in – 7 ft 3 in) and weight (30–250 kg or 66–551 lb) to see your plan.</p></div>';return}
 const dk=$("diet").value,budget=+$("budget").value||0,name=$("name").value.trim(),nm=+$("meals").value;
 const ag=ageGroupOf(age),a=AGE_GROUPS[ag],bmi=calculateBmi(w,h),adult=age>=18;
 const bk=budgetTier(budget);
 let warn=[],cal=null,m=1,pr=null;
 if(!health){
  if(gender!="x"){
   const est=estimateCalories({gender,age,weightKg:w,heightCm:h,activity:act,goal,trainingDays:+$("days").value,sessionMinutes:+$("duration").value,workoutType:$("workout").value});
   warn.push(...est.warnings);cal=est.calories;pr=est.proteinRange;
  }else{
   m=goal=="lose"?.9:goal=="gain"?1.1:1;
   warn.push(age<18?"Under 18: no calorie target is shown and portions are standard, with no weight-loss deficit. Check with a doctor before aiming to change weight.":"No calorie estimate was used, so portions are standard with a small adjustment for your goal.");
  }
 }
 const slots=[["b","Breakfast","7–9 am",0]];
 if(nm==5)slots.push(["s","Mid-morning snack","10–11 am",1]);
 slots.push(["l","Lunch","12–2 pm",0]);
 if(nm!=3)slots.push(["s","Snack","4–5 pm",0]);
 slots.push(["d","Dinner","7–8:30 pm",0]);
 resetState(S,{bk,dk,m:1,slots,bl:parseBlockedFoods($("allergies").value,$("foods").value),wm:$("wm").value,train:+$("days").value>0});
 if(cal&&!health){const base=(dayPlan(0,1).kcal+dayPlan(1,1).kcal)/2;m=portionMultiplier(cal,base)}
 S.m=m;if(!live)ui.plan=0;
 const tp=[];const t=$("time").value;
 tp.push(t=="morning"?"For morning training, eat the pre-workout meal 30–60 minutes before, and have breakfast after.":t=="evening"?"For evening training, eat the pre-workout meal 30–60 minutes before, and a balanced dinner after.":"Place the workout meals around your training time. Timing matters less than total food over the day.");
 if(dk=="veg"&&$("diet").selectedOptions[0].text.startsWith("Other"))tp.push("You chose Other, so vegetarian meals are shown. Adjust them to your needs.");
 if(dk=="vegan")tp.push("Vegan meals use soy and plant alternatives. Check vitamin B12 with a doctor, because it is not found reliably in plant foods.");
 if(!budget)tp.push("No budget entered, so a medium-budget plan is shown.");
 const stats=cal?`<div class=stats><div><b>${cal} kcal</b>daily target</div><div><b>${bmi.toFixed(1)}</b>${adult?"BMI (adult screening)":"BMI (teens: ask your doctor)"}</div><div><b>${Math.round(w*pr[0])}–${Math.round(w*pr[1])} g</b>protein target</div></div>`:`<p class=muted style="margin-top:10px">No calorie estimate shown.</p>`;
 const risk=health?'<div class="card warning"><h3>Personal guidance needed</h3><p style="margin:0">Because you selected a health consideration, no calorie target or meal quantities are shown. Please see a doctor or registered dietitian for individual advice, and avoid restrictive diets without professional guidance.</p></div>':"";
 const wcards=warn.map(x=>`<div class="card warning"><p style="margin:0">${esc(x)}</p></div>`).join("");
 const ageNote=a.adj[goal]?`<div class=card><h3>For your age group</h3><p style="margin:0">${esc(a.adj[goal])}</p></div>`:"";
 const fk=$("focus").value,ex=DEFAULT_EXERCISES[fk]?exHtml(fk):`<p class=ex><b>Body part:</b> not decided.</p>`;
 const info=`<div class=card><h3>Your routine</h3><p><b>Activity:</b> ${esc($("activity").selectedOptions[0].text)} outside workouts.</p><p><b>Training:</b> ${esc($("days").value)} days/week, ${esc($("duration").value)} min, ${esc($("workout").value)}, ${esc($("time").value)}, ${esc($("place").value)}. <b>Equipment:</b> ${esc($("equipment").value||"not specified")}. <b>Cooking:</b> ${esc($("cook").value)}.</p>${ex}</div>`;
 const tail=`<div class=card><h3>Timing and notes</h3><ul>${tp.map(x=>`<li>${esc(x)}</li>`).join("")}<li>Requests noted: ${esc($("foods").value||"none")}.</li></ul></div><div class=card><h3>Tips for your age</h3><ul>${a.tips.map(x=>`<li>${esc(x)}</li>`).join("")}<li>Drink 2–3 litres of water daily.</li></ul></div><p class=fine>Quantities are raw or dry weights, before cooking. Calories and protein come from standard food tables and are estimates. Prices are approximate Indian market rates, so edit the data in this file to match your area. Allergy filtering matches food names only, so always check labels yourself.</p>`;
 S.head=`<div class=hero><h2>${name?esc(name)+", here is":"Here is"} your plan</h2><p class=muted>Goal: ${GOAL_NAMES[goal]} · ${esc($("diet").selectedOptions[0].text)} · Budget: ${budget?"₹"+budget+"/day":"not specified"}</p>${stats}</div>${risk}${wcards}${ageNote}`;
 S.tail=tail;S.bmi=bmi;S.budget=budget;S.health=health;S.cal=cal;S.pr=pr;S.w=w;
 draw();if(!live)$("result").scrollIntoView({behavior:"smooth"})}
export function draw(){
 const r=$("result");
 if(S.health){r.innerHTML=S.head+S.tail;return}
 const planA=dayPlan(0,S.m),planB=dayPlan(1,S.m),p=ui.plan?planB:planA,avg=Math.round((4*planA.total+3*planB.total)/7);
 const bw=S.budget?(p.total>S.budget?`<div class="card warning"><p style="margin:0">This plan costs about ₹${p.total}, which is above your ₹${S.budget} budget (weekly average ₹${avg}). Use the swaps below or reduce portions.</p></div>`:`<p class=fine style="margin-top:10px">Within your ₹${S.budget}/day budget. Weekly average is about ₹${avg}.</p>`):"";
 const pw=S.pr&&p.prot<S.w*S.pr[0]*.9?`<div class="card warning"><p style="margin:0">Protein is a little below your target (${p.prot} g). Add an extra protein food such as eggs, dal, curd, paneer, soya chunks or a protein shake.</p></div>`:"";
 const tabs=`<div class=days role=group aria-label="Choose plan">${["Plan A","Plan B"].map((n,i)=>`<button type=button data-d=${i} aria-pressed=${i==ui.plan}>${n}</button>`).join("")}</div><p class=sched>Mon A · Tue B · Wed A · Thu B · Fri A · Sat B · Sun A</p>`;
 const rows=ms=>ms.map(x=>`<div class=meal><h3>${x.label}<span>${x.time}</span></h3><div><div class="it h"><span>Item</span><span>Quantity</span><span>kcal</span><span>Protein</span><span>Cost</span></div>${x.its.map(i=>`<div class=it><span>${esc(i[0])}</span><span>${i[1]} ${i[2]}</span><span>${i[4]}</span><span>${i[5]} g</span><span>₹${i[3]}</span></div>`).join("")}<div class="it sub"><span>${x.label} total</span><span></span><span>${x.k}</span><span>${Math.round(x.g)} g</span><span>₹${x.c}</span></div></div></div>`).join("");
 const rem=p.removed.length?`<div class="card warning"><p style="margin:0">Removed because of your allergy or dislike list: ${esc([...new Set(p.removed)].join(", "))}. Replace them with a safe food of similar protein.</p></div>`:"";
 const sw=MEAL_PLANS[S.bk][S.dk=="nv"?"nv":"veg"].w;
 const ex=p.extra.length?`<p class=fine style="margin:14px 0 0">Workout meals are for training days. On rest days, skip them.</p>`+rows(p.extra):"";
 r.innerHTML=S.head+tabs+DLB+`<p class=fine style="margin:10px 0 0">The same two plans repeat on alternate days, so shopping and cooking stay simple.</p>`+rows(p.meals)+ex+rem+`<div class=tot><span>${ui.plan?"Plan B":"Plan A"} total</span><span>${p.kcal} kcal · ${p.prot} g protein · ₹${p.total}</span></div>${S.cal?`<p class=fine style="margin-top:8px">Your daily target is about ${S.cal} kcal. Portions were scaled to match it on a training day.</p>`:""}${bw}${pw}<div class=card><h3>Save money or swap</h3><p style="margin:0">${esc(sw)}</p></div>`+S.tail;
 r.querySelectorAll(".days button").forEach(b=>b.onclick=()=>{ui.plan=+b.dataset.d;draw()})}
export function planText(){if(!S.bk||S.health)return"FITFUEL: no meal plan was made because a health consideration was selected. Please see a doctor or dietitian.";
 const L=["FITFUEL DIET PLAN"+(U.name?" for "+U.name:""),new Date().toDateString(),"Goal: "+GOAL_NAMES[$("goal").value],S.cal?`Daily target: ${S.cal} kcal, protein ${Math.round(S.w*S.pr[0])}-${Math.round(S.w*S.pr[1])} g`:"",""];
 [["PLAN A",0],["PLAN B",1]].forEach(([n,i])=>{const p=dayPlan(i,S.m);L.push("=== "+n+" ===");[...p.meals,...p.extra].forEach(x=>{L.push(`${x.label} (${x.time})`);x.its.forEach(t=>L.push(`  - ${t[0]}: ${t[1]} ${t[2]} | ${t[4]} kcal | ${t[5]} g protein | Rs ${t[3]}`));L.push(`  Total: ${x.k} kcal | ${Math.round(x.g)} g protein | Rs ${x.c}`)});L.push(`DAY TOTAL: ${p.kcal} kcal | ${p.prot} g protein | Rs ${p.total}`,"")});
 L.push("Schedule: Mon A, Tue B, Wed A, Thu B, Fri A, Sat B, Sun A.","Quantities are raw or dry weights. Estimates only, not medical advice.");return L.join("\n")}

// Day plan for the current settings S.
export const dayPlan=(pl,m)=>buildDayPlan(S,pl,m);
export const live=()=>submit({preventDefault(){},type:"live"});

// Wire up the planner form and render once (as the original did at load).
export function bindDietForm(){
 $("form").addEventListener("submit",submit);
 $("form").addEventListener("input",()=>submit({preventDefault(){},type:"live"}));
 submit({preventDefault(){},type:"live"});
}
