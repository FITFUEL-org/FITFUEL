import { U } from "../state.js";

// Wizard / dashboard lookup tables.
export const AM={back:"back",shoulder:"shoulders",arm:"arms",chest:"chest",abs:"core",butt:"legs",leg:"legs",full:"full"},AL={back:"Back",shoulder:"Shoulder",arm:"Arm",chest:"Chest",abs:"Abs",butt:"Butt",leg:"Leg",full:"Full body"};
export const GL={str:"Get stronger",mus:"Build muscle mass",lean:"Get lean and defined",red:"Reduce bodyweight",hea:"Improve health and wellness",spo:"Boost sports performance"},LV={beg:"Beginner",int:"Intermediate",adv:"Advanced"};
export const TIP={mot:"Put your training days in your calendar. Showing up matters more than a perfect session.",guide:"Open the Exercises tab. Every move shows its start and end position.",bore:"Rotate the specific area each week, for example upper, middle and lower chest.",none:"Nice work. Keep your routine steady and check the Report tab once a week to track progress."};
export const DP={2:[2,5],3:[1,3,5],4:[1,2,4,5],5:[1,2,3,4,5],6:[1,2,3,4,5,6],7:[0,1,2,3,4,5,6]};
export const MS='<svg viewBox="0 0 100 130"><circle cx="50" cy="14" r="11"/><path d="M18 34q32-14 64 0l4 30-12 4-4 56H30l-4-56-12-4z"/></svg>',FS_='<svg viewBox="0 0 100 130"><circle cx="50" cy="14" r="11"/><path d="M30 34q20-8 40 0l4 24-8 14 12 56H22l12-56-8-14z"/></svg>';
// Wizard steps. k = kind of input; o = options.
export const ST=[
{id:"basic",k:"basic",t:"Let's start with the basics"},
{id:"gender",k:"one",two:1,t:"What's your gender?",s:"It helps us tailor calories and intensity to different metabolic rates.",o:[["m",MS,"Male"],["f",FS_,"Female"]]},
{id:"goal",k:"one",t:"What's your main goal?",o:[["str","⚡","Get stronger"],["mus","💪","Build muscle mass"],["lean","🔥","Get lean and defined"],["red","⚖️","Reduce bodyweight"],["hea","❤️","Improve health and wellness"],["spo","🏅","Boost sports performance"]]},
{id:"foc",k:"chips",t:"Select the areas you want to focus on",o:[["back","Back"],["shoulder","Shoulder"],["arm","Arm"],["chest","Chest"],["abs","Abs"],["butt","Butt"],["leg","Leg"],["full","Full body"]]},
{id:"height",k:"slider",t:"What's your height?",min:120,max:220,def:()=>170},
{id:"weight",k:"slider",t:"What's your current weight?",min:30,max:200,def:()=>70},
{id:"target",k:"slider",t:"What's your target weight?",min:30,max:200,def:()=>U.weight},
{id:"lv",k:"one",t:"What's your fitness level?",o:[["beg","⚡","Beginner","Less than 6 months of experience"],["int","⚡⚡","Intermediate","6 months to 2 years of experience"],["adv","⚡⚡⚡","Advanced","More than 2 years of experience"]]},
{id:"place",k:"one",t:"Where do you work out?",s:"We pick exercises that fit your place.",o:[["home","🏠","Home","Bodyweight and light dumbbells"],["gym","🏋️","Gym","Barbells, machines and benches"],["out","🌳","Outdoor","Park, open ground and pull-up bars"]]},
{id:"equip",k:"multi",t:"Which type of equipment do you have?",o:[["all","✔","All equipment"],["barbell","🏋️","Barbells"],["dumbbell","💪","Dumbbells"],["kettlebell","🔔","Kettlebells"],["machine","⚙️","Weight machines"],["none","🚫","None of the above"]]},
{id:"days",k:"days",t:"How often do you work out?",s:"We recommend training at least 3 days a week for better results."},
{id:"ch",k:"one",t:"What's your biggest challenge when working out?",o:[["mot","🔥","Struggle with staying motivated"],["guide","🧭","Lack clear workout guidance"],["bore","🎯","Get bored with workouts easily"],["none","✅","No challenge","I am already consistent with my workouts"]]},
{id:"diet",k:"one",t:"What do you eat?",o:[["veg","🥦","Vegetarian"],["vegan","🌱","Vegan"],["egg","🥚","Eggetarian"],["nv","🍗","Non-vegetarian"]]},
{id:"budget",k:"one",num:1,t:"What's your daily food budget?",o:[["120","🪙","Low","About ₹100–150 a day"],["250","💵","Medium","About ₹200–300 a day"],["550","💎","High","About ₹500+ a day"]]},
{id:"health",k:"one",t:"Any health considerations?",s:"Pick yes and we skip calorie targets and portions, and suggest seeing a doctor or dietitian.",o:[["no","👍","No, none of these"],["yes","🩺","Yes","Medical condition, medication, pregnancy, or a history of disordered eating"]]}];
// Bottom tabs: [key, icon, label, element id].
export const TB=[["home","🏠","Home","t_home"],["diet","🥗","Diet","result"],["ex","🏋️","Exercises","t_ex"],["rep","📊","Report","t_rep"],["me","👤","Me","t_me"]];
