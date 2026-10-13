// Static meal tables: budget tiers, age groups, alternates and workout meals.
// Daily meal plans per budget tier. Items are [name, quantity, unit, approx price in INR].
// Meal keys: b=breakfast, l=lunch, s=snack, d=dinner; w = money-saving swap advice.
export const MEAL_PLANS={
 low:{n:"Low budget",lab:"Low · ₹100–150/day",tag:"About ₹100–150 a day",
  veg:{b:[["Oats",50,"g",8],["Peanuts",20,"g",3],["Milk",250,"ml",15],["Banana",1,"pc",6]],
   l:[["Toor dal (dry)",60,"g",9],["Rice",80,"g",5],["Atta for 2 rotis",60,"g",3],["Seasonal vegetables",150,"g",8],["Curd",100,"g",8]],
   s:[["Roasted chana",40,"g",5],["Seasonal fruit",100,"g",10]],
   d:[["Atta for 2 rotis",60,"g",3],["Soya chunks",50,"g",10],["Seasonal vegetables",150,"g",8],["Cooking oil",15,"ml",3]],
   w:"Swap soya chunks for rajma or chole (60 g dry, about ₹8). Swap oats for poha (60 g, about ₹4)."},
  nv:{b:[["Poha",60,"g",4],["Eggs",2,"pc",14],["Peanuts",20,"g",3],["Banana",1,"pc",6]],
   l:[["Chicken",100,"g",22],["Rice",80,"g",5],["Atta for 2 rotis",60,"g",3],["Seasonal vegetables",150,"g",8],["Curd",100,"g",8]],
   s:[["Egg",1,"pc",7],["Roasted chana",30,"g",4],["Seasonal fruit",100,"g",10]],
   d:[["Atta for 2 rotis",60,"g",3],["Toor dal (dry)",40,"g",6],["Eggs",2,"pc",14],["Seasonal vegetables",150,"g",8],["Cooking oil",15,"ml",3]],
   w:"Swap chicken for 2 more eggs on tight days. Soya chunks (50 g, about ₹10) also work."}},
 med:{n:"Medium budget",lab:"Medium · ₹200–300/day",tag:"About ₹200–300 a day",
  veg:{b:[["Paneer (in paratha)",50,"g",19],["Atta for 2 parathas",60,"g",3],["Curd",100,"g",8],["Seasonal fruit",150,"g",15]],
   l:[["Paneer",100,"g",38],["Brown rice",80,"g",8],["Toor dal (dry)",50,"g",8],["Seasonal vegetables",200,"g",12],["Salad",100,"g",5]],
   s:[["Mixed nuts",25,"g",25],["Moong sprouts",60,"g",6],["Seasonal fruit",100,"g",10]],
   d:[["Tofu",100,"g",35],["Millet roti flour",60,"g",4],["Seasonal vegetables",200,"g",12],["Cooking oil",15,"ml",3],["Milk",250,"ml",15]],
   w:"Swap tofu for soya chunks (50 g, about ₹10) to save money."},
  nv:{b:[["Eggs",3,"pc",21],["Multigrain bread",2,"slice",10],["Seasonal fruit",150,"g",15],["Milk",250,"ml",15]],
   l:[["Chicken",150,"g",33],["Brown rice",80,"g",8],["Toor dal (dry)",50,"g",8],["Seasonal vegetables",200,"g",12],["Salad",100,"g",5]],
   s:[["Mixed nuts",25,"g",25],["Egg",1,"pc",7],["Seasonal fruit",100,"g",10]],
   d:[["Fish (rohu)",150,"g",38],["Millet roti flour",60,"g",4],["Seasonal vegetables",200,"g",12],["Cooking oil",15,"ml",3],["Curd",100,"g",8]],
   w:"Swap fish for chicken or 3 eggs if fish is hard to find."}},
 high:{n:"High budget",lab:"High · ₹500+/day",tag:"About ₹500+ a day",
  veg:{b:[["Greek yogurt",150,"g",45],["Berries",80,"g",60],["Almonds",20,"g",20],["Chia seeds",10,"g",8]],
   l:[["Tofu",150,"g",52],["Quinoa",70,"g",32],["Avocado",1,"pc",80],["Fresh greens",150,"g",25],["Olive oil",10,"ml",12]],
   s:[["Whey or plant protein",1,"scoop",60],["Walnuts",20,"g",25],["Seasonal fruit",150,"g",20]],
   d:[["Paneer",150,"g",57],["Sweet potato",150,"g",12],["Fresh greens",150,"g",25],["Olive oil",10,"ml",12]],
   w:"Protein powder and berries are optional. Replace them with milk and seasonal fruit to cut about ₹100."},
  nv:{b:[["Greek yogurt",150,"g",45],["Eggs",2,"pc",14],["Berries",80,"g",60],["Almonds",20,"g",20]],
   l:[["Chicken breast",150,"g",50],["Quinoa",70,"g",32],["Avocado",1,"pc",80],["Fresh greens",150,"g",25],["Olive oil",10,"ml",12]],
   s:[["Whey protein",1,"scoop",60],["Almonds",25,"g",25],["Seasonal fruit",150,"g",20]],
   d:[["Salmon",150,"g",225],["Sweet potato",150,"g",12],["Fresh greens",150,"g",25],["Olive oil",10,"ml",12]],
   w:"Salmon is the big cost. Use rohu or chicken on other days and keep salmon for twice a week."}}
};
// Age-group tips and goal-specific notes.
export const AGE_GROUPS={
 teen:{n:"Teen (13–19)",tips:["Do not skip meals. Growing bodies need regular energy, calcium and iron.","Include milk, curd or paneer daily for calcium, and greens, dal or eggs for iron.","Limit soft drinks, chips and instant noodles, but avoid cutting out food groups.","Be active for at least 60 minutes a day through sport, cycling or play."],
  adj:{lose:"For teens, the goal is healthy habits, not strict dieting. Do not count calories or cut meals. Swap junk for whole foods, move more, and talk to a doctor before aiming for weight loss.",gain:"Growth spurts need fuel. Add one extra snack and keep protein at every meal.",maintain:"Keep eating balanced meals while you grow. Your weight will naturally change with height."}},
 adult:{n:"Adult (20–39)",tips:["Aim for 1.2–1.6 g protein per kg body weight, spread across meals.","Strength train 2–3 times a week and walk daily.","Sleep 7–9 hours. Poor sleep increases hunger and cravings.","Limit alcohol, sugary drinks and late-night eating."],adj:{}},
 mid:{n:"Middle age (40–59)",tips:["Metabolism slows with age, so keep protein steady and portions in check.","Choose fiber-rich foods like oats, millets, pulses and vegetables to help blood sugar and cholesterol.","Cut back on salt, fried food and refined sugar to protect heart health.","Strength training helps keep muscle and bone strong. Walk 30–45 minutes daily.","Get blood sugar, BP and cholesterol checked regularly."],adj:{}},
 senior:{n:"Senior (60+)",tips:["Protein matters more now. Include it at every meal to protect muscle.","Eat enough calcium and vitamin D (milk, curd, ragi, sunlight). Ask your doctor about supplements.","Choose softer, easy-to-digest foods if chewing is hard, such as khichdi, soups and stewed fruit.","Drink water through the day even when you do not feel thirsty.","Keep weight loss gradual and always under medical supervision."],
  adj:{lose:"At this age, unintended muscle loss is a bigger risk than extra weight. Lose weight only if your doctor advises, and slowly.",gain:"Small frequent meals work better than large ones. Add milk, nuts and ghee to dishes.",maintain:""}}
};
// Alternate (Plan B) meals as compact strings: "name|qty|unit|price;..." (parsed by parseItems).
export const ALTERNATE_MEALS={
 low:{veg:{b:"Besan chilla (besan)|60|g|6;Curd|150|g|12;Seasonal fruit|100|g|10",l:"Rajma|60|g|10;Rice|80|g|5;Seasonal vegetables|150|g|8;Salad|100|g|5;Curd|100|g|8",s:"Peanuts|30|g|5;Banana|1|pc|6;Milk|200|ml|12",d:"Moong dal (dry)|50|g|8;Rice|60|g|4;Seasonal vegetables|150|g|8;Curd|100|g|8;Cooking oil|10|ml|2"},
  nv:{b:"Eggs|2|pc|14;Atta for 2 rotis|60|g|3;Banana|1|pc|6;Milk|200|ml|12",l:"Eggs|2|pc|14;Rice|80|g|5;Toor dal (dry)|50|g|8;Seasonal vegetables|150|g|8;Salad|100|g|5",s:"Chickpeas (dry, boiled)|40|g|5;Peanuts|20|g|3;Seasonal fruit|100|g|10",d:"Chicken|100|g|22;Atta for 2 rotis|60|g|3;Seasonal vegetables|150|g|8;Cooking oil|15|ml|3"}},
 med:{veg:{b:"Oats|50|g|8;Milk|250|ml|15;Mixed nuts|15|g|15;Banana|1|pc|6",l:"Rajma|60|g|10;Brown rice|80|g|8;Paneer|50|g|19;Seasonal vegetables|200|g|12;Curd|100|g|8",s:"Greek-style curd|150|g|18;Almonds|15|g|15;Seasonal fruit|100|g|10",d:"Paneer|100|g|38;Atta for 2 rotis|60|g|3;Seasonal vegetables|200|g|12;Cooking oil|15|ml|3;Moong dal (dry)|40|g|6"},
  nv:{b:"Oats|50|g|8;Milk|250|ml|15;Eggs|2|pc|14;Banana|1|pc|6",l:"Eggs|3|pc|21;Brown rice|80|g|8;Toor dal (dry)|50|g|8;Seasonal vegetables|200|g|12",s:"Chicken tikka bites|80|g|18;Seasonal fruit|100|g|10;Curd|100|g|8",d:"Chicken|150|g|33;Atta for 2 rotis|60|g|3;Seasonal vegetables|200|g|12;Cooking oil|15|ml|3;Curd|100|g|8"}},
 high:{veg:{b:"Sourdough bread|2|slice|40;Avocado|1|pc|80;Paneer scramble (paneer)|80|g|30;Fresh greens|50|g|8",l:"Chickpeas (dry)|60|g|8;Quinoa|70|g|32;Paneer|100|g|38;Fresh greens|150|g|25;Olive oil|10|ml|12",s:"Greek yogurt|150|g|45;Berries|80|g|60;Almonds|20|g|20",d:"Tofu|150|g|52;Buckwheat noodles|70|g|35;Fresh greens|150|g|25;Olive oil|10|ml|12"},
  nv:{b:"Sourdough bread|2|slice|40;Eggs|3|pc|21;Avocado|1|pc|80;Fresh greens|50|g|8",l:"Prawns|150|g|105;Brown rice|80|g|8;Fresh greens|150|g|25;Olive oil|10|ml|12",s:"Cottage cheese (paneer)|100|g|38;Walnuts|20|g|25;Berries|80|g|60",d:"Chicken breast|150|g|50;Sweet potato|150|g|12;Quinoa|50|g|23;Fresh greens|150|g|25;Olive oil|10|ml|12"}}
};
export const PRE_WORKOUT_MEAL={low:"Banana|1|pc|6;Roasted chana|30|g|4",med:"Banana|1|pc|6;Multigrain bread|2|slice|10;Peanuts|15|g|2",high:"Sourdough bread|2|slice|40;Almonds|15|g|15;Banana|1|pc|6"};
export const POST_WORKOUT_VEG={low:"Milk|250|ml|15;Roasted chana|40|g|5;Banana|1|pc|6",med:"Greek-style curd|150|g|18;Moong sprouts|60|g|6;Banana|1|pc|6",high:"Whey or plant protein|1|scoop|60;Banana|1|pc|6;Almonds|15|g|15"};
export const POST_WORKOUT_NONVEG={low:"Eggs|3|pc|21;Banana|1|pc|6",med:"Eggs|3|pc|21;Multigrain bread|2|slice|10;Banana|1|pc|6",high:"Whey protein|1|scoop|60;Eggs|2|pc|14;Banana|1|pc|6"};
