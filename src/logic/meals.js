import { MEAL_PLANS, ALTERNATE_MEALS, PRE_WORKOUT_MEAL, POST_WORKOUT_VEG, POST_WORKOUT_NONVEG } from "../data/meals.js";
import { NUTRITION_TABLE, MEAT_PATTERN, ALLERGY_SYNONYMS } from "../data/nutrition.js";

// Pure meal-planning logic: no DOM, no global state.
// Parse "name|qty|unit|price;..." into [[name, qty, unit, price], ...].
export const parseItems=t=>t.split(";").map(x=>{const[a,b,c,d]=x.split("|");return[a,+b,c,+d]});
// Extract blocked foods (allergies / avoid-list) as lowercase keywords, expanded via synonyms.
export function parseBlockedFoods(allergies,foods){const out=[];
 const add=w=>{w=w.trim().replace(/s$/,"");if(w.length<3)return;out.push(w);for(const k in ALLERGY_SYNONYMS)if(w.includes(k))out.push(...ALLERGY_SYNONYMS[k])};
 allergies.toLowerCase().split(/[,;\n]+/).forEach(x=>add(x.replace(/^\s*(no|avoid|without)\s+/,"")));
 foods.toLowerCase().split(/[,;\n]+/).forEach(x=>{const m=x.trim().match(/^(avoid|no|without|dislike|don't like)\s+(.+)/);if(m)add(m[2])});
 return out}
// Swap dairy/paneer items for plant-based equivalents (prices adjusted).
export function veganize(it){let[n,q,u,p]=it;
 if(/^Milk$/.test(n))return["Soy milk",q,u,Math.round(p*1.6)];
 if(/^Curd$/.test(n))return["Soy yogurt",q,u,Math.round(p*2.5)];
 if(/^Greek yogurt$/.test(n))return["Soy yogurt",q,u,Math.round(p*.85)];
 if(/^Greek-style curd$/.test(n))return["Soy yogurt",q,u,p*2];
 if(/paneer/i.test(n))return[n.replace(/Paneer/g,"Tofu").replace(/paneer/g,"tofu"),q,u,Math.round(p*.9)];
 if(/^Whey/.test(n))return["Plant protein powder",q,u,p];
 return it}
// Two meal options (A/B) for a meal key, for the chosen diet and budget tier.
export function getMealOptions(dk,bk,k){
 const raw=d=>[MEAL_PLANS[bk][d][k],parseItems(ALTERNATE_MEALS[bk][d][k])];
 if(dk=="nv")return raw("nv");
 if(dk=="veg")return raw("veg");
 if(dk=="vegan")return raw("veg").map(o=>o.map(veganize));
 const ok=raw("nv").filter(o=>!o.some(i=>MEAT_PATTERN.test(i[0])));
 return[...ok,...raw("veg")].slice(0,2)}
// Calories (kcal) and protein (g) for an item [name, qty, unit, price], using the nutrition table.
export function nutritionFor(it){const[n,q]=it;const e=NUTRITION_TABLE.find(x=>x[0].test(n));if(!e)return[0,0];const f=e[3]?q:q/100;return[e[1]*f,e[2]*f]}
// Scale an item by multiplier m: rounds grams/ml to 5, pieces to whole numbers, and recomputes price and nutrition.
// Returns [name, qty, unit, price, kcal, protein].
export function scaleItem(it,m){const[n,q,u,p]=it;let nq=q*m;nq=(u=="g"||u=="ml")?Math.max(5,Math.round(nq/5)*5):Math.max(1,Math.round(nq));const[k,g]=nutritionFor([n,nq,u]);return[n,nq,u,Math.round(p*nq/q),Math.round(k),Math.round(g*10)/10]}
// Pre/post workout meal items for the settings S.
export function workoutMeal(S,kind){const{bk,dk}=S;const it=parseItems(kind=="pre"?PRE_WORKOUT_MEAL[bk]:(dk=="nv"||dk=="egg")?POST_WORKOUT_NONVEG[bk]:POST_WORKOUT_VEG[bk]);return dk=="vegan"?it.map(veganize):it}
// Build one day's plan (pl = 0 for Plan A, 1 for Plan B) from settings S and portion multiplier m.
export function buildDayPlan(S,pl,m){
 const{bk,dk,slots,bl,wm,train}=S;const t={c:0,k:0,g:0};const removed=[];
 const hit=x=>bl.some(w=>x[0].toLowerCase().includes(w));
 const build=(label,time,o)=>{const f=o.filter(x=>!hit(x));if(f.length<o.length)removed.push(...o.filter(hit).map(x=>x[0]));
  const its=f.map(x=>scaleItem(x,m));const s=its.reduce((a,x)=>({c:a.c+x[3],k:a.k+x[4],g:a.g+x[5]}),{c:0,k:0,g:0});t.c+=s.c;t.k+=s.k;t.g+=s.g;return{label,time,its,...s}};
 const meals=slots.map(([k,label,time,flip])=>{const opts=getMealOptions(dk,bk,k);const i=flip?1-pl:pl;let o=opts[i];if(o.some(hit)&&!opts[1-i].some(hit))o=opts[1-i];return build(label,time,o)});
 const extra=[];
 if(train){if(wm=="pre"||wm=="both")extra.push(build("Pre-workout meal","30–60 min before training",workoutMeal(S,"pre")));if(wm=="post"||wm=="both")extra.push(build("Post-workout meal","within 1–2 hours after",workoutMeal(S,"post")))}
 return{meals,extra,total:t.c,kcal:t.k,prot:Math.round(t.g),removed}}
