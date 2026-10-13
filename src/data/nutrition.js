// Nutrition tables and keyword lists used for filtering and calorie math.
// Foods treated as non-vegetarian when building vegetarian-friendly options.
export const MEAT_PATTERN=/chicken|fish|salmon|prawn|rohu|tikka/i;
// Terms matched against food names for allergy/dislike filtering.
export const DAIRY_TERMS=["milk","curd","yogurt","yoghurt","paneer","cheese","whey"];
export const ALLERGY_SYNONYMS={nut:["nut","almond","walnut","peanut"],milk:DAIRY_TERMS,dairy:DAIRY_TERMS,lactose:DAIRY_TERMS,egg:["egg"],fish:["fish","salmon","rohu"],prawn:["prawn"],shellfish:["prawn"],soy:["soya","soy","tofu"],gluten:["atta","bread","noodles","oats","roti"],wheat:["atta","bread","noodles","roti"]};
// Approx kcal per minute of training by workout type (scaled by body weight / 70 kg).
export const WORKOUT_KCAL_RATE={"Strength training":5,"Cardio":8,"Mixed strength and cardio":7,"Sports":7,"Mobility / yoga":3,"Not decided":5};
export const GOAL_NAMES={maintain:"maintain weight",lose:"lose weight gradually",gain:"gain weight gradually",fitness:"support fitness and body composition"};
// [name pattern, kcal, protein g, perUnit?]  per 100 g/ml, or per piece/slice/scoop when perUnit=1. Raw/dry weights.
export const NUTRITION_TABLE=[[/soy milk/i,40,3.3,0],[/soy yogurt/i,55,4.5,0],[/greek/i,95,9,0],[/tikka/i,160,27,0],[/chicken/i,120,22,0],[/paneer|cottage/i,290,18,0],[/tofu/i,80,8,0],[/soya/i,345,52,0],[/^milk$/i,62,3.3,0],[/curd/i,60,3.5,0],[/egg/i,75,6.3,1],[/banana/i,90,1.1,1],[/avocado/i,240,3,1],[/sourdough/i,90,3.5,1],[/bread/i,70,3,1],[/whey|plant protein/i,120,24,1],[/oil/i,890,0,0],[/dal/i,345,23,0],[/rajma/i,330,22,0],[/chickpea|chole/i,360,19,0],[/besan/i,390,22,0],[/roasted chana/i,370,20,0],[/peanut/i,570,25,0],[/almond/i,580,21,0],[/walnut/i,650,15,0],[/mixed nuts/i,600,18,0],[/chia/i,490,17,0],[/oats/i,380,13,0],[/poha/i,350,6.5,0],[/brown rice/i,360,7.5,0],[/rice/i,360,7,0],[/atta/i,340,12,0],[/millet/i,340,9,0],[/quinoa/i,370,14,0],[/buckwheat/i,350,13,0],[/sprouts/i,30,3,0],[/salad/i,20,1,0],[/greens/i,25,2.5,0],[/vegetables/i,30,2,0],[/fruit/i,60,.7,0],[/berries/i,50,.7,0],[/sweet potato/i,86,1.6,0],[/salmon/i,208,20,0],[/prawn/i,85,18,0],[/fish|rohu/i,100,17,0]];
