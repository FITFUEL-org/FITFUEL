// Exercise database: definitions (with stick-figure poses), sub-areas, and per-place availability.
export const FOCUS_NAMES={full:"Full body",chest:"Chest",back:"Back",shoulders:"Shoulders",arms:"Arms",legs:"Legs and glutes",core:"Core / abs",upper:"Upper body",lower:"Lower body",cardio:"Cardio / endurance"};
// (Unused in the original app; kept for reference.)
export const EXERCISE_EXAMPLES={full:["Squats","Push-ups","Dumbbell or band rows","Plank"],chest:["Push-ups","Dumbbell floor or bench press","Incline push-ups","Chest fly"],back:["Dumbbell or band rows","Lat pulldown or pull-ups","Reverse fly","Back extensions"],shoulders:["Overhead press","Lateral raises","Rear-delt fly","Band face pulls"],arms:["Biceps curls","Hammer curls","Bench dips","Overhead triceps extension"],legs:["Squats","Lunges","Romanian deadlift","Glute bridges","Calf raises"],core:["Plank","Dead bug","Leg raises","Bicycle crunches"],upper:["Push-ups","Rows","Overhead press","Biceps curls"],lower:["Squats","Lunges","Glute bridges","Calf raises"],cardio:["Brisk walk or jog intervals","Cycling","Skipping rope","Swimming"]};
// Exercise: id:[name, target muscles, sets x reps, startPose, endPose]. Pose=[torso,upperArm,forearm,thigh,shin,weight(1 dumbbell/2 bar),bench,hipY]; angles in degrees from straight down, positive = forward.
export const EXERCISE_DEFS={
pu:["Push-up","Chest, front shoulders, triceps","3 × 8–15",[75,0,0,-68,-68,0,0,100],[75,-60,5,-68,-68,0,0,115]],
bp:["Bench press","Chest, front shoulders, triceps","4 × 6–10",[-90,180,180,100,0,1,1,150],[-90,-10,170,100,0,1,1,150]],
ip:["Incline dumbbell press","Upper chest, shoulders, triceps","3 × 8–12",[-35,165,165,90,0,1,1,140],[-35,-10,160,90,0,1,1,140]],
cf:["Chest fly","Chest, front shoulders","3 × 10–15",[-90,180,180,100,0,1,1,150],[-90,-80,-80,100,0,1,1,150]],
di:["Dips","Lower chest, triceps, shoulders","3 × 6–12",[0,0,0,-10,-40,0,0,100],[15,-50,40,-10,-40,0,0,116]],
pl:["Pull-up","Lats, biceps, upper back","3 × 5–10",[0,180,180,5,-10,2,0,110],[0,-20,180,5,-10,2,0,64]],
br:["Barbell bent-over row","Lats, mid-back, rear shoulders, biceps","4 × 8–10",[70,0,0,15,-5,1,0,120],[70,-50,5,15,-5,1,0,120]],
ow:["One-arm dumbbell row","Lats, rhomboids, biceps","3 × 10–12 each side",[80,0,0,15,-5,1,0,120],[80,-60,0,15,-5,1,0,120]],
lp:["Lat pulldown","Lats, biceps, rear shoulders","3 × 10–12",[-5,180,180,90,0,2,1,140],[-5,-20,160,90,0,2,1,140]],
oh:["Overhead press","Shoulders, triceps, upper chest","3 × 8–10",[0,0,180,0,0,1,0,120],[0,180,180,0,0,1,0,120]],
fr:["Front raise","Front shoulders","3 × 10–12",[0,0,0,0,0,1,0,120],[0,90,90,0,0,1,0,120]],
lr:["Lateral raise (raise arms out to the sides)","Side shoulders","3 × 12–15",[0,0,0,0,0,1,0,120],[0,90,90,0,0,1,0,120]],
ur:["Upright row","Side shoulders, traps","3 × 10–12",[0,0,0,0,0,1,0,120],[0,100,20,0,0,1,0,120]],
bc:["Biceps curl","Biceps","3 × 10–12",[0,0,0,0,0,1,0,120],[0,0,155,0,0,1,0,120]],
hc:["Hammer curl","Biceps, brachialis, forearms","3 × 10–12",[0,0,0,0,0,1,0,120],[0,0,155,0,0,1,0,120]],
oe:["Overhead triceps extension","Triceps","3 × 10–12",[0,180,-30,0,0,1,0,120],[0,180,180,0,0,1,0,120]],
tp:["Triceps pushdown","Triceps","3 × 12–15",[0,0,100,0,0,1,0,120],[0,0,0,0,0,1,0,120]],
sq:["Squat","Quads, glutes, hamstrings, core","4 × 8–12",[0,90,90,0,0,1,0,120],[45,90,90,80,-15,1,0,149]],
rd:["Romanian deadlift","Hamstrings, glutes, lower back","3 × 8–12",[0,0,0,0,0,1,0,120],[70,0,0,15,-5,1,0,120]],
gb:["Glute bridge","Glutes, hamstrings, core","3 × 12–15",[-90,90,90,100,0,0,0,150],[-110,90,90,75,0,0,0,135]],
cr:["Calf raise","Calves","4 × 15–20",[0,0,0,0,0,1,0,120],[0,0,0,0,0,1,0,112]],
lg:["Leg raise","Lower abs, hip flexors","3 × 10–15",[-90,90,90,90,90,0,0,150],[-90,90,90,170,170,0,0,150]],
cc:["Crunch","Upper abs","3 × 15–20",[-90,-150,-100,100,0,0,0,150],[-65,-150,-100,100,0,0,0,150]],
pk:["Plank (hold)","Abs, core, shoulders","3 × 30–60 sec",[80,0,90,-70,-70,0,0,110],[80,0,90,-70,-70,0,0,110]],
jg:["Jog / run intervals","Heart, legs, glutes","20–30 min",[10,-40,60,60,-30,0,0,120],[10,40,100,-30,-70,0,0,120]],
sk:["Skipping rope","Calves, shoulders, heart","5 × 1 min",[0,20,70,0,0,0,0,120],[0,20,70,0,0,0,0,112]],
wk:["Brisk walk","Legs, heart","30–45 min",[5,25,40,25,-10,0,0,120],[5,-25,20,-20,-10,0,0,120]]};
EXERCISE_DEFS.ipu=["Incline push-up (hands on a bench)","Upper chest, front shoulders, triceps","3 × 8–15",[55,0,0,-52,-52,0,0,100],[55,-60,5,-52,-52,0,0,112]];
EXERCISE_DEFS.dp=["Decline push-up (feet on a bench)","Lower chest, shoulders, triceps","3 × 8–12",[88,0,0,-85,-85,0,0,100],[88,-60,5,-85,-85,0,0,115]];
EXERCISE_DEFS.rf=["Reverse fly (bent-over)","Rear shoulders, upper back","3 × 12–15",[70,0,0,15,-5,1,0,120],[70,-40,-40,15,-5,1,0,120]];
EXERCISE_DEFS.dl=["Deadlift","Lower back, glutes, hamstrings, back","4 × 5–8",[75,0,0,70,-10,2,0,143],[0,0,0,0,0,2,0,120]];
EXERCISE_DEFS.sm=["Superman hold","Lower back, glutes","3 × 10–12",[90,90,90,-90,-90,0,0,150],[70,120,120,-100,-100,0,0,150]];
EXERCISE_DEFS.ap=["Arnold press","Shoulders, triceps","3 × 8–12",[0,20,170,0,0,1,0,120],[0,180,180,0,0,1,0,120]];
EXERCISE_DEFS.fp=["Face pull","Rear shoulders, upper back","3 × 12–15",[0,90,90,0,0,2,0,120],[0,100,160,0,0,2,0,120]];
EXERCISE_DEFS.bbc=["Barbell curl","Biceps","3 × 8–12",[0,0,0,0,0,2,0,120],[0,0,155,0,0,2,0,120]];
EXERCISE_DEFS.kb=["Dumbbell kickback","Triceps","3 × 12–15",[70,-70,0,15,-5,1,0,120],[70,-70,-70,15,-5,1,0,120]];
EXERCISE_DEFS.sc=["Skull crusher (lying triceps extension)","Triceps","3 × 10–12",[-90,180,-100,100,0,1,1,150],[-90,180,180,100,0,1,1,150]];
EXERCISE_DEFS.lu=["Lunge","Quads, glutes, hamstrings","3 × 10–12 each leg",[0,0,0,0,0,1,0,120],[0,0,0,90,0,1,0,154]];
EXERCISE_DEFS.le=["Leg extension","Quads","3 × 12–15",[-10,0,0,90,0,0,1,140],[-10,0,0,90,90,0,1,140]];
EXERCISE_DEFS.lc=["Standing leg curl","Hamstrings","3 × 12–15",[0,0,0,0,0,0,0,120],[0,0,0,5,-100,0,0,120]];
EXERCISE_DEFS.scr=["Seated calf raise","Calves (soleus)","4 × 15–20",[0,0,0,90,0,1,1,140],[0,0,0,90,0,1,1,132]];
EXERCISE_DEFS.bcr=["Bicycle crunch","Abs, obliques","3 × 12–20",[-70,-150,-100,150,70,0,0,150],[-65,-150,-100,100,0,0,0,150]];
EXERCISE_DEFS.db=["Dead bug","Deep core, abs","3 × 8–12 each side",[-90,180,180,180,90,0,0,150],[-90,-90,-90,90,90,0,0,150]];
EXERCISE_DEFS.hlr=["Hanging leg raise","Lower abs, hip flexors","3 × 8–12",[0,180,180,0,0,2,0,110],[0,180,180,90,90,2,0,110]];
EXERCISE_DEFS.su=["Sit-up","Abs, hip flexors","3 × 12–20",[-90,-150,-100,100,0,0,0,150],[-5,-150,-100,100,0,0,0,150]];
EXERCISE_DEFS.hk=["High knees","Heart, hip flexors, quads","4 × 30 sec",[5,25,70,0,0,0,0,120],[5,-25,70,90,0,0,0,120]];
EXERCISE_DEFS.jj=["Jumping jacks","Heart, calves, shoulders","4 × 30–45 sec",[0,0,0,0,0,0,0,120],[0,180,180,0,0,0,0,112]];
EXERCISE_DEFS.cy=["Cycling","Heart, quads, glutes","30–45 min",[40,50,70,70,-10,0,1,140],[40,50,70,20,-50,0,1,140]];
EXERCISE_DEFS.jsq=["Jump squat","Legs, glutes, heart","4 × 10–15",[45,90,90,80,-15,0,0,149],[0,180,180,0,0,0,0,106]];
EXERCISE_DEFS.dpu=["Diamond push-up (hands close together)","Triceps, inner chest","3 × 8–12",EXERCISE_DEFS.pu[3],EXERCISE_DEFS.pu[4]];
EXERCISE_DEFS.cu=["Chin-up (palms facing you)","Biceps, lats","3 × 5–10",EXERCISE_DEFS.pl[3],EXERCISE_DEFS.pl[4]];
EXERCISE_DEFS.bu=["Burpee","Full body, heart","4 × 8–12",EXERCISE_DEFS.pu[3],EXERCISE_DEFS.jj[4]];
EXERCISE_DEFS.mc=["Mountain climber","Core, shoulders, hip flexors, heart","4 × 30 sec",EXERCISE_DEFS.pu[3],[75,0,0,60,-20,0,0,100]];
EXERCISE_DEFS.stp=["Step-up (bench or low wall)","Quads, glutes","3 × 10 each leg",EXERCISE_DEFS.lu[3],EXERCISE_DEFS.lu[4]];
EXERCISE_DEFS.wpu=["Wide push-up (hands wider than shoulders)","Outer chest, shoulders","3 × 8–15",EXERCISE_DEFS.pu[3],EXERCISE_DEFS.pu[4]];
EXERCISE_DEFS.cgp=["Close-grip push-up","Triceps, inner chest","3 × 8–12",EXERCISE_DEFS.pu[3],EXERCISE_DEFS.pu[4]];
EXERCISE_DEFS.wpl=["Wide-grip pull-up","Lats, upper back","3 × 5–8",EXERCISE_DEFS.pl[3],EXERCISE_DEFS.pl[4]];
EXERCISE_DEFS.ir=["Inverted row (under a bar or sturdy table)","Lats, mid-back, biceps","3 × 8–12",[80,0,0,15,-5,0,0,120],[80,-60,0,15,-5,0,0,120]];
EXERCISE_DEFS.bdr=["Bent-over dumbbell row (both arms)","Lats, mid-back, rear shoulders","3 × 10–12",EXERCISE_DEFS.br[3],EXERCISE_DEFS.br[4]];
EXERCISE_DEFS.sfl=["Superman swimmer","Lower back, glutes, rear shoulders","3 × 20 sec",EXERCISE_DEFS.sm[3],EXERCISE_DEFS.sm[4]];
EXERCISE_DEFS.pp=["Pike push-up (hips high)","Shoulders, triceps, upper chest","3 × 6–12",[135,10,10,-10,-10,0,0,90],[135,-30,0,-10,-10,0,0,110]];
EXERCISE_DEFS.sp=["Sprint intervals","Legs, glutes, heart","6 × 20 sec fast, 60 sec walk",EXERCISE_DEFS.jg[3],EXERCISE_DEFS.jg[4]];
export const VARIATIONS=[["ibp", "ip", "Incline barbell press", "Upper chest, front shoulders, triceps", "4 × 6–10"], ["ifl", "cf", "Incline dumbbell fly", "Upper chest, front shoulders", "3 × 10–15"], ["ipw", "ipu", "Incline wide push-up", "Upper chest, shoulders", "3 × 8–15"], ["dbp", "bp", "Dumbbell floor press", "Chest, triceps, front shoulders", "3 × 8–12"], ["dcp", "bp", "Decline bench press", "Lower chest, triceps", "4 × 6–10"], ["dpw", "dp", "Decline wide push-up", "Lower chest, shoulders", "3 × 8–12"], ["sap", "lp", "Straight-arm pulldown", "Lats", "3 × 10–15"], ["gm", "rd", "Good morning (hands behind head)", "Lower back, hamstrings, glutes", "3 × 10–12"], ["sdl", "lr", "Seated dumbbell lateral raise", "Side shoulders", "3 × 10–15"], ["clr", "lr", "Cable lateral raise", "Side shoulders", "3 × 12–15"], ["rrf", "rf", "Seated rear fly", "Rear shoulders, upper back", "3 × 12–15"], ["cbc", "bc", "Concentration curl", "Biceps", "3 × 10–12 each arm"], ["sgb", "gb", "Single-leg glute bridge", "Glutes, hamstrings", "3 × 10 each leg"], ["slr", "rd", "Single-leg Romanian deadlift", "Hamstrings, glutes, balance", "3 × 8–10 each leg"], ["dcr", "cr", "Single-leg calf raise", "Calves", "3 × 12–15 each leg"], ["bss", "lu", "Bulgarian split squat", "Quads, glutes", "3 × 8–12 each leg"], ["ccc", "cc", "Cable crunch", "Upper abs", "3 × 12–15"], ["dcc", "su", "Decline crunch", "Upper abs", "3 × 12–15"], ["rcr", "lg", "Reverse crunch", "Lower abs", "3 × 12–15"], ["fk", "lg", "Flutter kicks", "Lower abs, hip flexors", "3 × 20–30 sec"], ["sps", "pk", "Side plank (hold)", "Obliques, deep core", "3 × 20–40 sec each side"], ["bd", "pk", "Bird dog", "Deep core, lower back, glutes", "3 × 8–12 each side"], ["hlh", "db", "Hollow hold", "Deep core, lower abs", "3 × 20–30 sec"], ["tcr", "cc", "Toe-touch crunch", "Upper abs", "3 × 12–15"], ["vu", "su", "V-up", "Upper and lower abs", "3 × 10–12"], ["hyp", "sm", "Back extension", "Lower back, glutes", "3 × 12–15"]];VARIATIONS.forEach(([k,b,n,m,r])=>EXERCISE_DEFS[k]=[n,m,r,EXERCISE_DEFS[b][3],EXERCISE_DEFS[b][4]]);
export const SUB_AREAS={chest:{"Upper chest":["ip","ibp","ifl","ipu","ipw","pp"],"Middle chest":["bp","dbp","cf","pu","wpu","dpu"],"Lower chest":["dcp","di","dp","dpw"]},back:{"Lats (width)":["pl","wpl","cu","lp","sap","ow","bdr","ir"],"Mid back (thickness)":["br","bdr","ow","ir","rf"],"Lower back":["dl","rd","gm","hyp","sm","sfl"]},shoulders:{"Front delts":["oh","ap","fr","pp"],"Side delts":["lr","sdl","clr","ur"],"Rear delts":["rf","rrf","fp","sfl"]},arms:{"Biceps":["bc","hc","bbc","cbc","cu","ir"],"Triceps":["oe","tp","kb","sc","di","dpu","cgp"]},legs:{"Quads":["sq","lu","bss","le","stp","jsq"],"Hamstrings and glutes":["rd","slr","gb","sgb","lc"],"Calves":["cr","dcr","scr","sk"]},core:{"Upper abs":["cc","su","tcr","vu","ccc","dcc"],"Lower abs":["lg","hlr","rcr","fk","bcr"],"Deep core":["pk","sps","db","bd","hlh","mc"]}};
export const BODYWEIGHT_ONLY=["tcr","vu","ipw","dpw","sgb","slr","dcr","bss","rcr","fk","sps","bd","hlh","dpu","wpu","cgp","bu","mc","stp","sp","pp","sfl","pu","ipu","dp","sq","gb","cr","lg","cc","pk","jg","sk","wk","lu","lc","bcr","db","su","hk","jj","jsq","sm"];
export const PLACE_EXERCISES={home:"pu ipu dp dpu wpu cgp di ow bdr rf sm sfl oh ap fr lr ur bc hc oe kb sq lu gb cr rd lg cc pk bcr db su hk jj sk jsq bu mc stp ipw dpw pp dbp gm sdl rrf cbc sgb slr dcr bss rcr fk sps bd hlh ir tcr vu".split(" "),gym:"bp ip cf di pu ipu dp pl lp br bdr ow dl oh ap fp fr lr ur rf bc bbc hc tp oe sc kb sq lu le lc scr rd gb cr lg hlr cc su bcr db pk cy jg wk sk hk jj jsq ibp ifl ipw dpw pp dcp sap gm sdl clr rrf cbc sgb slr dcr bss ccc dcc rcr fk sps bd hlh cu wpl ir mc stp dbp sm sfl hyp tcr vu".split(" "),out:"pu ipu dp dpu wpu cgp pp di pl cu wpl ir sm sfl sq lu stp gb cr lg cc su bcr db pk mc bu hk jj sk jsq jg sp wk cy ipw dpw sgb slr dcr bss rcr fk sps bd hlh oh ap fr lr sdl ur rf rrf bdr ow bc hc cbc oe kb gm tcr vu".split(" ")};
export const EXTRA_EXERCISES={full:["bu","mc","stp"],upper:["dpu","wpu","cu","ow","ap"],lower:["stp","jsq"],chest:["dpu","wpu"],back:["cu","bdr","sfl","ir","wpl","rd"],shoulders:["dp","pp","di","pu","bu","mc"],arms:["dpu","cu","cgp","ir","pl"],legs:["stp","jsq"],core:["mc"],cardio:["bu","mc","sp"]};
export const PLACE_NAMES={home:"Home",gym:"Gym",out:"Outdoor"},PLACE_TIPS={home:"No gym needed. Use a chair, a backpack or water bottles as weights.",gym:"Use free weights and machines. Warm up with one light set first.",out:"Use a park bench, a pull-up bar and open ground. Carry a backpack or water bottles for extra weight."};
export const DEFAULT_EXERCISES={full:["sq","pu","dl","br","lu","oh","pk"],chest:["ip","ipu","pu","bp","cf","di","dp"],back:["pl","lp","br","ow","rf","dl","sm"],shoulders:["oh","ap","fr","lr","ur","rf","fp"],arms:["bc","hc","bbc","oe","tp","kb","sc"],legs:["sq","lu","le","rd","gb","lc","cr"],core:["cc","su","lg","hlr","bcr","db","pk"],upper:["pu","br","oh","bc","bp","pl"],lower:["sq","rd","gb","cr","lu","le"],cardio:["jg","hk","sk","wk","jj","cy","jsq"]};
export const EXIMG={};/* optional photos per exercise, e.g. EXIMG.bp="bench.jpg" (ids: pu, bp, sq, dl ...) */
