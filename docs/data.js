// Illustrative per-100g values. Raw, edible ingredient weights; not a prescribed diet.
export const foods = {
 oats:['Овсяные хлопья','Крупы и хлеб',370,13,7,62], milk:['Молоко 2,5%','Молочное и яйца',52,3,2.5,4.7], banana:['Бананы','Фрукты и ягоды',89,1.1,.3,22.8], berries:['Ягоды','Фрукты и ягоды',45,1,.4,9], nuts:['Грецкие орехи','Бакалея',654,15,65,14], honey:['Мёд','Бакалея',304,.3,0,82],
 egg:['Яйца (без скорлупы)','Молочное и яйца',143,12.6,9.5,.7], bread:['Хлеб цельнозерновой','Крупы и хлеб',247,13,4.2,41], avocado:['Авокадо (мякоть)','Овощи и зелень',160,2,14.7,8.5], tomato:['Помидоры','Овощи и зелень',18,.9,.2,3.9], cucumber:['Огурцы','Овощи и зелень',15,.7,.1,3.6], spinach:['Шпинат','Овощи и зелень',23,2.9,.4,3.6],
 chicken:['Куриное филе','Мясо и рыба',120,22.5,2.6,0], turkey:['Филе индейки','Мясо и рыба',114,23.7,1.5,0], cod:['Филе трески','Мясо и рыба',82,17.8,.7,0], salmon:['Филе лосося','Мясо и рыба',208,20.4,13.4,0], potato:['Картофель','Овощи и зелень',77,2,.1,17], rice:['Рис (сухой)','Крупы и хлеб',360,7,.7,80], brownRice:['Бурый рис (сухой)','Крупы и хлеб',350,7.5,2.5,73], pasta:['Паста (сухая)','Крупы и хлеб',350,12,1.5,72],
 broccoli:['Брокколи','Овощи и зелень',34,2.8,.4,6.6], zucchini:['Кабачок','Овощи и зелень',17,1.2,.3,3.1], pepper:['Сладкий перец','Овощи и зелень',31,1,.3,6], carrot:['Морковь','Овощи и зелень',41,.9,.2,9.6], onion:['Репчатый лук','Овощи и зелень',40,1.1,.1,9.3], garlic:['Чеснок','Овощи и зелень',149,6.4,.5,33], lemon:['Лимон','Фрукты и ягоды',29,1.1,.3,9.3], oil:['Оливковое масло','Бакалея',884,0,100,0],
 yogurt:['Йогурт греческий 2%','Молочное и яйца',73,9.5,2,3.6], cottage:['Queso cottage Philadelphia 4,6%','Молочное и яйца',96,10,4.6,3.1], apple:['Яблоки','Фрукты и ягоды',52,.3,.2,14], flour:['Мука пшеничная','Крупы и хлеб',364,10,1,76], cheese:['Твёрдый сыр','Молочное и яйца',350,25,27,0]
};
export const recipes = [
 {id:'oats',slot:0,title:'Овсянка с бананом и орехами',subtitle:'Мягкая каша, ягоды и немного мёда',time:12,image:'oats',ingredients:{oats:75,milk:200,banana:100,berries:70,nuts:15,honey:8},steps:['Всыпьте хлопья в молоко, добавьте немного воды по желанию. Варите на слабом огне, помешивая, до мягкости.','Переложите в миску. Добавьте банан, ягоды, орехи и мёд.']},
 {id:'toast',slot:0,title:'Тосты с авокадо и яйцом',subtitle:'Хрустящий хлеб и свежие овощи',time:15,image:'toast',ingredients:{bread:100,egg:120,avocado:80,tomato:120,spinach:30},steps:['Подсушите хлеб. Разомните авокадо вилкой и распределите по тостам.','Приготовьте яйца до полной готовности удобным способом. Выложите на тосты, подайте с помидорами и шпинатом.']},
 {id:'pancakes',slot:0,title:'Творожные оладьи с ягодами',subtitle:'Завтрак, ради которого легко проснуться',time:20,image:'pancakes',ingredients:{cottage:160,egg:60,flour:55,milk:60,berries:100,honey:15,oil:5},steps:['Смешайте творог, яйцо, муку и молоко до густого теста.','Смажьте сковороду указанным количеством масла. Выпекайте небольшие оладьи на умеренном огне с обеих сторон до полной готовности. Подайте с ягодами и мёдом.']},
 {id:'chicken-potato',slot:1,title:'Курица с картофелем и травами',subtitle:'Золотистый картофель и сочное филе',time:45,image:'chicken',ingredients:{chicken:190,potato:310,carrot:80,onion:50,oil:14,garlic:5,cucumber:120},steps:['Нарежьте картофель небольшими дольками, морковь и лук — ломтиками. Смешайте с половиной масла.','Добавьте курицу, оставшееся масло и чеснок. Приправьте по вкусу. Запекайте при 190 °C около 35–45 минут, до полной готовности.','Подайте со свежим огурцом. Время зависит от толщины кусочков и духовки.'],video:'https://www.youtube.com/watch?v=2QnIxcBShTY',channel:'Видеопример: курица с картофелем'},
 {id:'turkey-rice',slot:1,title:'Индейка с рисом и овощами',subtitle:'Тёплая тарелка для активного дня',time:30,image:'turkey-rice',ingredients:{turkey:190,rice:90,zucchini:130,pepper:100,oil:12,garlic:4},steps:['Отварите рис в воде до готовности.','Нарежьте индейку поперёк волокон. Готовьте в сковороде с маслом, затем добавьте овощи и чеснок. При необходимости подлейте воду.','Доведите мясо до полной готовности и подайте с рисом.'],video:'https://www.youtube.com/watch?v=sQX0To6K7OI',channel:'Eda Show · техника приготовления индейки'},
 {id:'chicken-brown-rice',slot:1,title:'Курица с бурым рисом и брокколи',subtitle:'Простые продукты в одной тарелке',time:40,image:'chicken-rice',ingredients:{chicken:200,brownRice:88,broccoli:180,oil:12,tomato:100},steps:['Промойте бурый рис и отварите по инструкции на упаковке. Брокколи приготовьте на пару.','Нарежьте филе и обжарьте с маслом до полной готовности, при необходимости добавляя воду. Подайте с бурым рисом, брокколи и помидором.'],video:'https://www.youtube.com/results?search_query=куриное+филе+с+бурым+рисом+и+брокколи',channel:'Поиск подходящего видео на YouTube',search:true},
 {id:'fish-potato',slot:2,title:'Рыба с картофелем в духовке',subtitle:'Треска, лимон и запечённые овощи',time:55,image:'cod',ingredients:{cod:220,potato:300,tomato:130,pepper:100,onion:40,oil:15,lemon:25,garlic:4},steps:['Тонко нарежьте картофель и лук, смешайте с частью масла. Добавьте перец и помидоры, немного воды и накройте форму фольгой.','Запекайте при 200 °C до мягкости картофеля. Добавьте рыбу, оставшееся масло, чеснок и лимон.','Готовьте без фольги ещё около 15–20 минут, до полной готовности рыбы.'],video:'https://www.youtube.com/watch?v=A-kC_VOBihM',channel:'Коршикова Любовь · рыба с картошкой'},
 {id:'salmon-rice',slot:2,title:'Лосось с рисом и брокколи',subtitle:'Нежная рыба с лимонной ноткой',time:30,image:'salmon',ingredients:{salmon:170,rice:75,broccoli:200,oil:7,lemon:25},steps:['Отварите рис. Брокколи приготовьте на пару или в небольшом количестве воды.','Смажьте рыбу маслом, добавьте лимон и запекайте при 180 °C до полной готовности. Подайте с гарниром.'],video:'https://www.youtube.com/results?search_query=лосось+в+духовке+рис+брокколи',channel:'Поиск подходящего видео на YouTube',search:true},
 {id:'turkey-pasta',slot:2,title:'Паста с индейкой и томатами',subtitle:'Домашний томатный соус и тёртый сыр',time:30,image:'pasta',ingredients:{turkey:180,pasta:85,tomato:200,onion:50,oil:10,cheese:15,garlic:4},steps:['Отварите пасту по инструкции на упаковке.','На масле приготовьте лук, чеснок и кусочки индейки. Добавьте нарезанные помидоры и немного воды. Тушите до полной готовности мяса.','Соедините с пастой, посыпьте сыром.'],video:'https://www.youtube.com/results?search_query=паста+с+индейкой+в+томатном+соусе',channel:'Поиск подходящего видео на YouTube',search:true},
 {id:'yogurt',slot:3,title:'Йогурт с ягодами и орехами',subtitle:'Небольшая пауза для себя',time:3,image:'yogurt',ingredients:{yogurt:250,berries:100,nuts:25,honey:12,banana:100},steps:['Выложите йогурт в миску. Добавьте ягоды, нарезанный банан, орехи и мёд.']},
 {id:'cottage',slot:3,title:'Творог с яблоком и мёдом',subtitle:'Сытный перекус без готовки',time:5,image:'cottage',ingredients:{cottage:200,apple:170,nuts:20,honey:15},steps:['Нарежьте яблоко. Смешайте с творогом, добавьте орехи и мёд.']}
];
export const slots=['Завтрак','Обед','Ужин','Перекус'];
export const times=['08:30','13:00','19:00','16:30'];
export const weekPattern=[['oats','chicken-potato','fish-potato','yogurt'],['toast','turkey-rice','salmon-rice','cottage'],['pancakes','chicken-brown-rice','turkey-pasta','yogurt'],['oats','turkey-rice','fish-potato','cottage'],['toast','chicken-potato','salmon-rice','yogurt'],['pancakes','chicken-brown-rice','turkey-pasta','cottage'],['oats','turkey-rice','fish-potato','yogurt']];

// Search labels used in Spanish supermarkets; product composition still follows its label.
export const spanishFoods = {
 oats:'copos de avena', milk:'leche 2,5% de materia grasa', banana:'plátanos', berries:'frutos rojos, frescos o congelados', nuts:'nueces peladas', honey:'miel',
 egg:'huevos', bread:'pan integral', avocado:'aguacate', tomato:'tomates', cucumber:'pepino', spinach:'espinacas',
 chicken:'pechuga de pollo', turkey:'pechuga de pavo', cod:'filetes de bacalao fresco o desalado, sin espinas', salmon:'filetes de salmón, sin espinas', potato:'patatas', rice:'arroz', brownRice:'arroz integral', pasta:'pasta',
 broccoli:'brócoli', zucchini:'calabacín', pepper:'pimiento', carrot:'zanahorias', onion:'cebolla', garlic:'ajo', lemon:'limón', oil:'aceite de oliva',
 yogurt:'yogur griego natural 2%', cottage:'queso cottage Philadelphia, tarrina de 175 g', apple:'manzanas', flour:'harina de trigo', cheese:'queso curado'
};
export const shoppingHints = {
 egg:'Вес указан без скорлупы. Для покупки ориентир: около 50 г съедобной части на яйцо среднего размера.',
 milk:'Жирность в рецепте 2,5%. Если берёшь leche semidesnatada другой жирности, КБЖУ будут немного отличаться.',
 cottage:'Philadelphia Cottage: упаковка 175 г, половина — 87,5 г. По данным производителя на 100 г: 96 ккал, Б 10 г, Ж 4,6 г, У 3,1 г. Не путай с обычным queso de untar; сверяй этикетку своей упаковки.',
 cod:'Выбирай свежее, замороженное или уже вымоченное филе (desalado), а не сухую солёную треску.',
 yogurt:'Ищи натуральный без добавленного сахара; ориентир рецепта — 2% жирности.',
 brownRice:'Arroz integral: сухой бурый рис. Время варки смотри на упаковке.'
};
export const mealPhotos = {
 oats:{url:'https://images.unsplash.com/photo-1715098841757-0e9690ec12d6?auto=format&fit=crop&w=1000&q=85',credit:'Dimitris Asproloupos / Unsplash',source:'https://unsplash.com/photos/qzRVPgqSWn4'},
 toast:{url:'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1000&q=85',credit:'Unsplash',source:'https://unsplash.com'},
 pancakes:{url:'https://cdn.yhangry.com/setmenus/images/0cLVIDX1LbsQrT7JROc8RCjH0PUZt7m7PDcP4df1.webp',credit:'yhangry · оладьи с ягодами',source:'https://yhangry.com/f/private-chefs/brunch/'},
 chicken:{url:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=85',credit:'Unsplash',source:'https://unsplash.com'},
 'turkey-rice':{url:'https://storefront-prod.fr.picnicinternational.com/static/images/recipes/9c7a1392a84be1dd10446224dc05095c2618ac6437117c4f4ec958992f98da4e/filled-600x600.webp',credit:'Picnic · индейка, рис и овощи',source:'https://picnic.app/fr/recettes/69612c736d1c7e01382f2620/minc-de-dinde-faon-gyros-et-riz'},
 'chicken-rice':{url:'https://cdn.rouvy.com/cms/dinner_870f4b5ba5/dinner_870f4b5ba5.jpg',credit:'ROUVY · курица с рисом и брокколи',source:'https://rouvy.com/blog/best-carb-sources-triathletes'},
 cod:{url:'https://cloudfront-us-east-1.images.arcpublishing.com/startribunemedia/SOBFJNHXHMG5O2RQQX2M4RKJNI.jpg',credit:'Star Tribune · треска с картофелем',source:'https://www.startribune.com/recipe-herb-roasted-cod-with-potatoes-and-tomatoes/570436462'},
 salmon:{url:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=85',credit:'Unsplash',source:'https://unsplash.com'},
 pasta:{url:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=85',credit:'Unsplash',source:'https://unsplash.com'},
 yogurt:{url:'https://images.deliveryhero.io/image/global-menu-service/GV_ES/vendor/882275/product/41897811814/ca503771-7881-4ccd-9218-4cc8c45686ec.jpg',credit:'The Green Spot / Glovo · йогурт с фруктами и орехами',source:'https://glovoapp.com/en/es/fuengirola/stores/the-green-spot-fuengirola'},
 cottage:{url:'https://slimmingviolet.com/wp-content/uploads/2024/08/cottage-cheese-and-apple-salad.png',credit:'Slimming Violet · творог с яблоком',source:'https://slimmingviolet.com/cottage-cheese-salads/'}
};

// Familiar breakfasts and evening snacks; per-100g values except the cited branded cottage.
Object.assign(foods, {
  "eggwhite": [
    "Белок яичный жидкий пастеризованный",
    "Молочное и яйца",
    49,
    10.6,
    0.3,
    1
  ],
  "muesliFruit": [
    "Мюсли фруктовые (сухие)",
    "Крупы и хлеб",
    360,
    9,
    5,
    70
  ],
  "muesliNuts": [
    "Мюсли с орехами и сухофруктами (сухие)",
    "Крупы и хлеб",
    410,
    11,
    13,
    62
  ],
  "whey": [
    "Протеиновый порошок",
    "Спортивное питание",
    400,
    80,
    6,
    7
  ],
  "chia": [
    "Семена чиа",
    "Бакалея",
    486,
    16.5,
    30.7,
    7.7
  ],
  "cocoa": [
    "Какао-порошок без сахара",
    "Бакалея",
    228,
    20,
    14,
    20
  ],
  "cinnamon": [
    "Корица молотая",
    "Бакалея",
    247,
    4,
    1.2,
    28
  ],
  "sausage": [
    "Колбаса варёная типа mortadela",
    "Мясо и рыба",
    300,
    12,
    27,
    3
  ],
  "turkeySlices": [
    "Индейка для бутербродов (нарезка)",
    "Мясо и рыба",
    105,
    18,
    2,
    3
  ]
});
Object.assign(spanishFoods, {
  "eggwhite": "claras de huevo líquidas pasteurizadas",
  "muesliFruit": "muesli con frutas deshidratadas",
  "muesliNuts": "muesli con frutos secos y frutas deshidratadas",
  "whey": "proteína en polvo / proteína de suero",
  "chia": "semillas de chía",
  "cocoa": "cacao puro en polvo sin azúcar",
  "cinnamon": "canela molida",
  "sausage": "mortadela en lonchas",
  "turkeySlices": "pechuga de pavo cocida en lonchas"
});
Object.assign(shoppingHints, {
  "eggwhite": "Это отдельный жидкий белок из бутылки, не целые яйца. Ориентир: около 33 г на один белок; проверь мерную шкалу своей бутылки. Состав и КБЖУ зависят от бренда. Готовь до полной готовности.",
  "whey": "15 г в рецепте — масса порошка, а не 15 г чистого белка. В условном порошке с 80% белка это около 12 г белка; смотри этикетку и взвешивай порцию, размер скупа бывает разным.",
  "muesliFruit": "Ищи muesli con frutas deshidratadas. КБЖУ здесь примерные; смеси сильно различаются. Не путай сухую смесь с готовой кашей.",
  "muesliNuts": "Ищи muesli con frutos secos y frutas deshidratadas. Орехи и сухофрукты уже входят в смесь и отдельно для неё в корзину не добавляются.",
  "chia": "Базовая порция 5 г — ориентир небольшой чайной ложки. Точнее взвесить.",
  "cocoa": "Cacao puro sin azúcar: несладкий какао-порошок; шоколадный напиток с сахаром имеет другой состав.",
  "sausage": "В расчёте — пример варёной колбасы типа mortadela. Salchichón, chorizo и другие колбасы отличаются по составу и калорийности.",
  "turkeySlices": "Это готовая нарезка для бутербродов, не сырое филе. Состав и доля мяса зависят от марки."
});
Object.assign(mealPhotos, {
  "omelet": {
    "url": "https://teresasrecipes.com/images/5bb864f9-dec4-4fdf-9dcf-a680d22978de.jpg",
    "credit": "Teresa’s Recipes · омлет с овощами",
    "source": "https://teresasrecipes.com/recipe/spinach-and-tomato-omelette"
  },
  "sandwich": {
    "url": "https://www.arise-app.com/images/dishes/pt/sanduiche-de-pao-de-forma-com-queijo-e-mortadela-1fmp29.webp",
    "credit": "Arise · бутерброд с сыром и колбасой",
    "source": "https://www.arise-app.com/pt/prato/Sandu%C3%ADche-de-p%C3%A3o-de-forma-com-queijo-e-mortadela"
  },
  "overnight": {
    "url": "https://fryzia.com/assets/images/1763639933783-5dedethk.webp",
    "credit": "Fryzia · ночная овсянка в баночке",
    "source": "https://fryzia.com/recipes/overnight-oats-jars"
  },
  "evening": {
    "url": "https://res.cloudinary.com/solin-fitness/image/upload/c_scale%2Cw_800%2Cq_auto%2Cf_auto/single-meal-images/xtpyhzsxbokw0tbah546",
    "credit": "Solin · йогурт с cottage и ягодами",
    "source": "https://www.solin.stream/recipes/260481/cottage-cheese-greek-yogurt-bowl-with-berries-and-almonds"
  }
});
recipes.push(...[
  {
    "id": "omelet-protein",
    "title": "Омлет из целых яиц и жидкого белка",
    "slot": 0,
    "image": "omelet",
    "ingredients": {
      "egg": 150,
      "eggwhite": 200,
      "tomato": 150,
      "spinach": 40,
      "oil": 5,
      "bread": 60
    },
    "steps": [
      "Смешай целые яйца и жидкий пастеризованный белок из бутылки. Количество каждого указано отдельно.",
      "На сковороде с указанным маслом слегка прогрей овощи. Влей яичную смесь и готовь на небольшом огне под крышкой до полной готовности. Подай с хлебом."
    ],
    "time": 15,
    "subtitle": "Целые яйца и белок из бутылки — отдельными граммовками",
    "portionGroup": "omelet"
  },
  {
    "id": "omelet-cheese",
    "title": "Омлет с белком, сыром и шпинатом",
    "slot": 0,
    "image": "omelet",
    "ingredients": {
      "egg": 150,
      "eggwhite": 200,
      "cheese": 25,
      "spinach": 60,
      "tomato": 120,
      "oil": 5,
      "bread": 45
    },
    "steps": [
      "Смешай яйца и жидкий белок. На масле прогрей шпинат и помидоры.",
      "Влей смесь, посыпь сыром. Готовь под крышкой на слабом огне до полной готовности. Подай с хлебом."
    ],
    "time": 15,
    "subtitle": "Домашний вариант из вашего привычного рациона",
    "portionGroup": "omelet"
  },
  {
    "id": "scrambled-toast",
    "title": "Скрэмбл с яйцом, белком и тостом",
    "slot": 0,
    "image": "omelet",
    "ingredients": {
      "egg": 150,
      "eggwhite": 200,
      "bread": 80,
      "tomato": 150,
      "oil": 5
    },
    "steps": [
      "Смешай яйца с жидким белком. Подсуши хлеб.",
      "На сковороде с маслом готовь смесь на слабом огне, аккуратно перемешивая лопаткой, до полной готовности. Подай с тостом и помидором."
    ],
    "time": 12,
    "subtitle": "Домашний вариант из вашего привычного рациона",
    "portionGroup": "omelet"
  },
  {
    "id": "sandwich-sausage",
    "title": "Бутерброды с сыром и колбасой",
    "slot": 0,
    "image": "sandwich",
    "ingredients": {
      "bread": 100,
      "cheese": 35,
      "sausage": 45,
      "tomato": 100,
      "cucumber": 100
    },
    "steps": [
      "Выложи на хлеб сыр и ломтики варёной колбасы. Добавь помидор.",
      "По желанию прогрей на сухой сковороде. Подай с огурцом. Колбаса в расчёте — типа mortadela."
    ],
    "time": 7,
    "subtitle": "Домашний вариант из вашего привычного рациона"
  },
  {
    "id": "overnight-oats",
    "title": "Ночная овсянка с протеином и чиа",
    "slot": 0,
    "image": "overnight",
    "ingredients": {
      "oats": 75,
      "milk": 200,
      "whey": 15,
      "chia": 5,
      "cocoa": 3,
      "cinnamon": 1,
      "berries": 80
    },
    "steps": [
      "Вечером взвесь сухую основу. Смешай с молоком, порошком протеина, чиа, какао и корицей, хорошо размешай.",
      "Накрой и поставь в холодильник при температуре не выше 4 °C на ночь. Утром снова перемешай и добавь ягоды. Используй сроки хранения молока и готовь порцию на следующее утро."
    ],
    "time": 5,
    "subtitle": "Вечером смешать, утром добавить ягоды",
    "portionGroup": "overnight"
  },
  {
    "id": "overnight-fruit-muesli",
    "title": "Ночные фруктовые мюсли с протеином",
    "slot": 0,
    "image": "overnight",
    "ingredients": {
      "muesliFruit": 75,
      "milk": 200,
      "whey": 15,
      "chia": 5,
      "cocoa": 3,
      "cinnamon": 1,
      "berries": 80
    },
    "steps": [
      "Вечером взвесь сухую основу. Смешай с молоком, порошком протеина, чиа, какао и корицей, хорошо размешай.",
      "Накрой и поставь в холодильник при температуре не выше 4 °C на ночь. Утром снова перемешай и добавь ягоды. Используй сроки хранения молока и готовь порцию на следующее утро."
    ],
    "time": 5,
    "subtitle": "Фруктовые мюсли, молоко, какао и корица",
    "portionGroup": "overnight"
  },
  {
    "id": "overnight-nut-muesli",
    "title": "Ночные мюсли с орехами и сухофруктами",
    "slot": 0,
    "image": "overnight",
    "ingredients": {
      "muesliNuts": 70,
      "milk": 200,
      "whey": 15,
      "chia": 5,
      "cocoa": 3,
      "cinnamon": 1,
      "berries": 80
    },
    "steps": [
      "Вечером взвесь сухую основу. Смешай с молоком, порошком протеина, чиа, какао и корицей, хорошо размешай.",
      "Накрой и поставь в холодильник при температуре не выше 4 °C на ночь. Утром снова перемешай и добавь ягоды. Используй сроки хранения молока и готовь порцию на следующее утро."
    ],
    "time": 5,
    "subtitle": "Ваш вариант: молоко, 15 г порошка, чиа, какао и ягоды",
    "portionGroup": "overnight"
  },
  {
    "id": "overnight-banana",
    "title": "Ночная овсянка с бананом и какао",
    "slot": 0,
    "image": "overnight",
    "ingredients": {
      "oats": 65,
      "milk": 200,
      "whey": 15,
      "chia": 5,
      "cocoa": 3,
      "cinnamon": 1,
      "banana": 100,
      "berries": 40
    },
    "steps": [
      "Вечером взвесь сухую основу. Смешай с молоком, порошком протеина, чиа, какао и корицей, хорошо размешай.",
      "Поставь закрытую баночку в холодильник при температуре не выше 4 °C до следующего утра. Утром добавь нарезанный банан и ягоды."
    ],
    "time": 5,
    "subtitle": "Домашний вариант из вашего привычного рациона",
    "portionGroup": "overnight"
  },
  {
    "id": "snack-omelet",
    "title": "Мини-омлет с белком и помидорами",
    "slot": 3,
    "image": "omelet",
    "ingredients": {
      "egg": 50,
      "eggwhite": 100,
      "tomato": 120,
      "spinach": 30,
      "oil": 4,
      "bread": 30
    },
    "steps": [
      "Смешай целое яйцо и жидкий белок. Нарежь помидор.",
      "Слегка прогрей овощи с маслом, добавь яичную смесь и готовь под крышкой до полной готовности. Подай с небольшим тостом."
    ],
    "time": 12,
    "subtitle": "Домашний вариант из вашего привычного рациона",
    "portionGroup": "mini-omelet"
  },
  {
    "id": "snack-sandwich",
    "title": "Тост с сыром и нарезкой индейки",
    "slot": 3,
    "image": "sandwich",
    "ingredients": {
      "bread": 65,
      "cheese": 25,
      "turkeySlices": 50,
      "cucumber": 100
    },
    "steps": [
      "Подсуши хлеб, выложи сыр и готовую нарезку индейки.",
      "Добавь огурец. По желанию прогрей тост до расплавления сыра."
    ],
    "time": 5,
    "subtitle": "Домашний вариант из вашего привычного рациона"
  },
  {
    "id": "evening-cottage-berries",
    "title": "Вечерний йогурт с cottage и ягодами",
    "slot": 3,
    "image": "evening",
    "ingredients": {
      "yogurt": 125,
      "cottage": 87.5,
      "berries": 80
    },
    "steps": [
      "Отмерь греческий йогурт и queso cottage. Базовый cottage — 87,5 г: половина упаковки Philadelphia 175 г.",
      "Смешай в стакане и добавь ягоды. Если используешь замороженные ягоды, подготовь их по инструкции на упаковке. До подачи храни в холодильнике."
    ],
    "time": 3,
    "subtitle": "Греческий йогурт, половина cottage и ягоды сверху",
    "portionGroup": "evening"
  },
  {
    "id": "evening-cottage-cocoa",
    "title": "Йогурт с cottage, какао и ягодами",
    "slot": 3,
    "image": "evening",
    "ingredients": {
      "yogurt": 125,
      "cottage": 87.5,
      "berries": 70,
      "cocoa": 4,
      "cinnamon": 0.5
    },
    "steps": [
      "Смешай йогурт с cottage, какао и корицей.",
      "Выложи в стакан, добавь ягоды. До подачи храни в холодильнике."
    ],
    "time": 3,
    "subtitle": "Домашний вариант из вашего привычного рациона",
    "portionGroup": "evening"
  },
  {
    "id": "evening-cottage-apple",
    "title": "Йогурт с cottage, яблоком и корицей",
    "slot": 3,
    "image": "cottage",
    "ingredients": {
      "yogurt": 125,
      "cottage": 87.5,
      "apple": 130,
      "cinnamon": 1,
      "nuts": 10
    },
    "steps": [
      "Смешай йогурт с cottage. Нарежь яблоко небольшими кусочками.",
      "Добавь яблоко, корицу и орехи. До подачи храни в холодильнике."
    ],
    "time": 5,
    "subtitle": "Домашний вариант из вашего привычного рациона",
    "portionGroup": "evening"
  },
  {
    "id": "chia-yogurt",
    "title": "Йогурт с чиа, бананом и ягодами",
    "slot": 3,
    "image": "evening",
    "ingredients": {
      "yogurt": 200,
      "chia": 10,
      "banana": 100,
      "berries": 80
    },
    "steps": [
      "Смешай йогурт с чиа и оставь в холодильнике на несколько часов.",
      "Перед подачей добавь банан и ягоды."
    ],
    "time": 5,
    "subtitle": "Домашний вариант из вашего привычного рациона"
  }
]);
export const portionGroups = {
  "overnight": {
    "label": "Ночные завтраки",
    "defaults": {
      "milk": 200,
      "whey": 15,
      "chia": 5,
      "cocoa": 3,
      "cinnamon": 1
    },
    "wifeDefaults": {
      "milk": 150
    },
    "fields": {
      "milk": {
        "min": 50,
        "max": 350,
        "step": 10
      },
      "whey": {
        "min": 0,
        "max": 40,
        "step": 1
      },
      "chia": {
        "min": 0,
        "max": 15,
        "step": 1
      },
      "cocoa": {
        "min": 0,
        "max": 8,
        "step": 0.5
      },
      "cinnamon": {
        "min": 0,
        "max": 2,
        "step": 0.5
      }
    }
  },
  "omelet": {
    "label": "Большие омлеты и скрэмбл",
    "defaults": {
      "egg": 150,
      "eggwhite": 200
    },
    "wifeDefaults": {
      "egg": 100,
      "eggwhite": 150
    },
    "fields": {
      "egg": {
        "min": 50,
        "max": 200,
        "step": 50,
        "wholeEggs": true
      },
      "eggwhite": {
        "min": 0,
        "max": 350,
        "step": 10
      }
    }
  },
  "mini-omelet": {
    "label": "Мини-омлет на перекус",
    "defaults": {
      "egg": 50,
      "eggwhite": 100
    },
    "fields": {
      "egg": {
        "min": 50,
        "max": 100,
        "step": 50,
        "wholeEggs": true
      },
      "eggwhite": {
        "min": 0,
        "max": 200,
        "step": 10
      }
    }
  },
  "evening": {
    "label": "Вечерний йогурт и cottage",
    "defaults": {
      "yogurt": 125,
      "cottage": 87.5
    },
    "fields": {
      "yogurt": {
        "min": 50,
        "max": 250,
        "step": 5
      },
      "cottage": {
        "min": 25,
        "max": 200,
        "step": 0.5
      }
    }
  }
};
export const productSources = {
 cottage:{url:'https://philadelphia.eu/es/productos/philadelphia-cottage-cheese-43458/',label:'Philadelphia · состав и КБЖУ',note:'Состав производителя: молочная основа из свежего сыра, обезжиренное молоко, сливки, соль, стабилизатор гуаровая камедь. По данным производителя: 96 ккал, Б 10 г, Ж 4,6 г, У 3,1 г на 100 г. Упаковка 175 г указана в карточке DIA.',packUrl:'https://www.dia.es/quesos/fresco/p/310747'},
 eggwhite:{url:'https://www.carrefour.es/supermercado/clara-de-huevo-pasteurizada-carrefour-classic-1-l/R-VC4AECOMM-497495/p',label:'Пример этикетки жидкого белка',note:'Пример для расчёта: 49 ккал, Б 10,6 г, Ж 0,3 г, У 1 г на 100 г. У вашей бутылки из Mercadona или другого магазина значения могут отличаться.'}
};

for(const r of recipes)if(r.id.startsWith('evening-'))r.servingTime='21:00';

// Coffee is measured as the prepared drink for nutrition; the basket uses the bean dose.
Object.assign(foods,{
 lactoseFreeMilk2:['Молоко без лактозы 2%','Молочное и яйца',50,3.2,2,4.8],
 coffee:['Кофе эспрессо (готовый)','Напитки',2,0.1,0,0]
});
Object.assign(spanishFoods,{lactoseFreeMilk2:'leche sin lactosa, 2% de materia grasa',coffee:'café en grano / café molido'});
Object.assign(shoppingHints,{
 lactoseFreeMilk2:'Для кофе: по 75 г молока на чашку каждому, два раза в день. На двоих это 150 г за один приём и 300 г за день. КБЖУ примерные: 50 ккал, Б 3,2 г, Ж 2 г, У 4,8 г на 100 г. Проверь этикетку своего молока.',
 coffee:'В корзине — масса зёрен или молотого кофе, а не готового напитка. Стартовый ориентир 7 г на чашку можно изменить в настройках напитков. Для КБЖУ считается около 30 г готового эспрессо; вода в покупки не входит.'
});
export const drinkRecipes=[
 {id:'coffee-milk',title:'Кофе с безлактозным молоком 2%',subtitle:'Кофе из кофемашины и молоко без сахара',image:'coffee',time:2,ingredients:{coffee:30,lactoseFreeMilk2:75},steps:['Приготовь эспрессо в кофемашине. Добавь молоко: по 75 г на человека. Сахар в расчёт не включён.']},
 {id:'coffee-black',title:'Кофе чёрный',subtitle:'Эспрессо из кофемашины без добавок',image:'coffee',time:2,ingredients:{coffee:30},steps:['Приготовь эспрессо в кофемашине. Молоко, сахар и другие добавки не включены.']}
];
mealPhotos.coffee={url:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85',credit:'Unsplash · coffee',source:'https://unsplash.com'};
