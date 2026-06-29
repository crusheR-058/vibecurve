// Branching flashcard domains. A user picks a domain, then branches down the
// tree as deep as they like. The chosen path is stored on their profile and
// drives affinity matching (deepest shared branch = strongest match).
//
// Depth is intentionally uneven — representative branches go ~4-5 deep, others
// are shallow leaves. Add breadth/depth over time; the UI + matching adapt.

export interface FlashNode {
  id: string;
  label: string;
  emoji?: string;
  children?: FlashNode[];
}

export interface Domain {
  id: string;
  label: string;
  emoji: string;
  /** "What's trending" rotates weekly; flagged so it can be refreshed. */
  weekly?: boolean;
  children: FlashNode[];
}

// tiny helpers to keep the tree readable
const n = (id: string, label: string, emoji?: string, children?: FlashNode[]): FlashNode => ({
  id,
  label,
  emoji,
  children,
});

export const DOMAINS: Domain[] = [
  // 1 ─────────────────────────── Geography / Region ───────────────────────────
  {
    id: "geography",
    label: "Geography / Region",
    emoji: "🌍",
    children: [
      n("asia", "Asia", "🌏", [
        n("south_asia", "South Asia", "🪷", [
          n("india", "India", "🇮🇳", [
            n("north_india", "North India", "🏔️", [
              n("delhi", "Delhi", "🕌"),
              n("punjab", "Punjab", "🌾"),
              n("himalayas", "The Himalayas", "🏔️"),
            ]),
            n("south_india", "South India", "🌴", [
              n("kerala", "Kerala", "🛶"),
              n("bengaluru", "Bengaluru", "💻"),
              n("chennai", "Chennai", "🏖️"),
            ]),
            n("mumbai", "Mumbai", "🌃"),
          ]),
          n("pakistan", "Pakistan", "🇵🇰"),
          n("srilanka", "Sri Lanka", "🇱🇰"),
        ]),
        n("east_asia", "East Asia", "🏯", [
          n("japan", "Japan", "🇯🇵", [
            n("tokyo", "Tokyo", "🗼"),
            n("kyoto", "Kyoto", "⛩️"),
            n("okinawa", "Okinawa", "🏝️"),
          ]),
          n("south_korea", "South Korea", "🇰🇷", [
            n("seoul", "Seoul", "🌆"),
            n("busan", "Busan", "🌊"),
          ]),
          n("china", "China", "🇨🇳"),
        ]),
        n("southeast_asia", "Southeast Asia", "🌺", [
          n("thailand", "Thailand", "🇹🇭"),
          n("vietnam", "Vietnam", "🇻🇳"),
          n("indonesia", "Indonesia", "🇮🇩"),
        ]),
      ]),
      n("europe", "Europe", "🏰", [
        n("western_europe", "Western Europe", "🥖", [
          n("france", "France", "🇫🇷", [
            n("paris", "Paris", "🗼"),
            n("riviera", "French Riviera", "🛥️"),
          ]),
          n("uk", "United Kingdom", "🇬🇧", [
            n("london", "London", "🎡"),
            n("scotland", "Scotland", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"),
          ]),
          n("germany", "Germany", "🇩🇪"),
        ]),
        n("southern_europe", "Southern Europe", "🌅", [
          n("italy", "Italy", "🇮🇹", [
            n("rome", "Rome", "🏛️"),
            n("amalfi", "Amalfi Coast", "🍋"),
          ]),
          n("spain", "Spain", "🇪🇸"),
          n("greece", "Greece", "🏺"),
        ]),
        n("nordics", "The Nordics", "❄️", [
          n("norway", "Norway", "🇳🇴"),
          n("iceland", "Iceland", "🌋"),
        ]),
      ]),
      n("africa", "Africa", "🦁", [
        n("north_africa", "North Africa", "🐫", [n("egypt", "Egypt", "🇪🇬"), n("morocco", "Morocco", "🇲🇦")]),
        n("east_africa", "East Africa", "🦒", [n("kenya", "Kenya", "🇰🇪"), n("tanzania", "Tanzania", "🇹🇿")]),
        n("west_africa", "West Africa", "🥁", [n("nigeria", "Nigeria", "🇳🇬"), n("ghana", "Ghana", "🇬🇭")]),
      ]),
      n("americas", "The Americas", "🗽", [
        n("north_america", "North America", "🍁", [
          n("usa", "United States", "🇺🇸", [
            n("california", "California", "🌅"),
            n("new_york", "New York", "🗽"),
            n("texas", "Texas", "🤠"),
          ]),
          n("canada", "Canada", "🇨🇦"),
          n("mexico", "Mexico", "🇲🇽"),
        ]),
        n("south_america", "South America", "🌎", [
          n("brazil", "Brazil", "🇧🇷"),
          n("argentina", "Argentina", "🇦🇷"),
          n("peru", "Peru", "🇵🇪"),
        ]),
      ]),
      n("oceania", "Oceania", "🏝️", [
        n("australia", "Australia", "🇦🇺", [n("sydney", "Sydney", "🌉"), n("outback", "The Outback", "🏜️")]),
        n("new_zealand", "New Zealand", "🇳🇿"),
      ]),
    ],
  },

  // 2 ─────────────────────────── Entertainment ───────────────────────────
  {
    id: "entertainment",
    label: "Entertainment",
    emoji: "🎬",
    children: [
      n("movies", "Movies", "🍿", [
        n("scifi", "Sci-Fi", "🛸", [
          n("space_opera", "Space opera", "🚀", [n("star_wars", "Star Wars", "⭐"), n("dune", "Dune", "🏜️")]),
          n("dystopia", "Dystopian", "🌆", [n("blade_runner", "Blade Runner", "🌧️"), n("matrix", "The Matrix", "💊")]),
        ]),
        n("action", "Action", "💥", [
          n("superhero", "Superhero", "🦸", [n("marvel", "Marvel", "🛡️"), n("dc", "DC", "🦇")]),
          n("heist", "Heist", "💰"),
        ]),
        n("horror", "Horror", "👻", [n("slasher", "Slasher", "🔪"), n("psychological", "Psychological", "🧠")]),
        n("romcom", "Rom-com", "💌"),
      ]),
      n("tv", "TV Shows", "📺", [
        n("drama", "Drama", "🎭", [n("crime", "Crime", "🔍"), n("period", "Period drama", "👑")]),
        n("sitcom", "Sitcom", "😂", [n("the_office", "The Office", "📎"), n("friends", "Friends", "☕")]),
        n("reality", "Reality TV", "📸"),
      ]),
      n("anime", "Anime", "🍙", [
        n("shonen", "Shōnen", "⚔️", [n("one_piece", "One Piece", "🏴‍☠️"), n("jjk", "Jujutsu Kaisen", "👹")]),
        n("slice_of_life", "Slice of life", "🌸"),
        n("studio_ghibli", "Studio Ghibli", "🌿"),
      ]),
      n("kdrama", "K-Drama", "💗", [
        n("romance_kdrama", "Romance", "💞"),
        n("thriller_kdrama", "Thriller", "🔪"),
        n("historical_kdrama", "Historical (sageuk)", "👑"),
      ]),
    ],
  },

  // 3 ─────────────────────────── Sports ───────────────────────────
  {
    id: "sports",
    label: "Sports",
    emoji: "⚽",
    children: [
      n("football", "Football (Soccer)", "⚽", [
        n("premier_league", "Premier League", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", [
          n("arsenal", "Arsenal", "🔴"),
          n("liverpool", "Liverpool", "🔴"),
          n("man_city", "Man City", "🩵"),
        ]),
        n("la_liga", "La Liga", "🇪🇸", [n("real_madrid", "Real Madrid", "👑"), n("barcelona", "Barcelona", "🔵🔴")]),
        n("world_cup", "International", "🌍"),
      ]),
      n("basketball", "Basketball", "🏀", [
        n("nba", "NBA", "🇺🇸", [n("lakers", "Lakers", "💜💛"), n("warriors", "Warriors", "💙💛"), n("celtics", "Celtics", "☘️")]),
        n("streetball", "Streetball", "🛹"),
      ]),
      n("cricket", "Cricket", "🏏", [
        n("ipl", "IPL", "🇮🇳", [n("csk", "Chennai (CSK)", "💛"), n("mi", "Mumbai (MI)", "💙"), n("rcb", "Bangalore (RCB)", "❤️")]),
        n("test", "Test cricket", "🧢"),
      ]),
      n("f1", "Formula 1", "🏎️", [n("ferrari", "Ferrari", "🐎"), n("redbull", "Red Bull", "🐂"), n("mclaren", "McLaren", "🧡")]),
      n("tennis", "Tennis", "🎾", [
        n("grand_slam", "Grand Slams", "🏆", [n("wimbledon", "Wimbledon", "🎾"), n("us_open", "US Open", "🗽")]),
        n("tennis_goats", "The GOATs", "🐐", [n("federer", "Federer", "🎾"), n("nadal", "Nadal", "🟠"), n("djokovic", "Djokovic", "🇷🇸"), n("alcaraz", "Alcaraz", "🔥")]),
      ]),
      n("combat", "Combat sports", "🥊", [n("mma", "MMA / UFC", "🥋"), n("boxing", "Boxing", "🥊")]),
    ],
  },

  // 4 ─────────────────────────── Pets ───────────────────────────
  {
    id: "pets",
    label: "Pets",
    emoji: "🐾",
    children: [
      n("dogs", "Dogs", "🐕", [
        n("small_dogs", "Small breeds", "🐩", [n("pomeranian", "Pomeranian", "🦊"), n("dachshund", "Dachshund", "🌭")]),
        n("medium_dogs", "Medium breeds", "🐕", [n("beagle", "Beagle", "🐶"), n("border_collie", "Border Collie", "🖤")]),
        n("large_dogs", "Large breeds", "🐕‍🦺", [n("golden", "Golden Retriever", "🦴"), n("husky", "Husky", "🐺")]),
      ]),
      n("cats", "Cats", "🐈", [
        n("fluffy", "Fluffy", "😻", [n("ragdoll", "Ragdoll", "🧶"), n("maine_coon", "Maine Coon", "🦁")]),
        n("sleek", "Sleek", "🐈‍⬛", [n("siamese", "Siamese", "💎"), n("bombay", "Bombay", "🖤")]),
      ]),
      n("small_pets", "Small pets", "🐹", [n("rabbit", "Rabbit", "🐰"), n("hamster", "Hamster", "🐹"), n("guinea_pig", "Guinea pig", "🐹")]),
      n("birds", "Birds", "🦜", [n("parrot", "Parrot", "🦜"), n("budgie", "Budgie", "🐤")]),
      n("reptiles", "Reptiles", "🦎", [n("gecko", "Gecko", "🦎"), n("turtle", "Turtle", "🐢")]),
      n("fish", "Fish / Aquarium", "🐠"),
    ],
  },

  // 5 ─────────────────────────── Exercise / Workouts ───────────────────────────
  {
    id: "exercise",
    label: "Exercise / Workouts",
    emoji: "🏋️",
    children: [
      n("strength", "Strength", "💪", [
        n("weightlifting", "Weightlifting", "🏋️", [n("bodybuilding", "Bodybuilding", "💪"), n("powerlifting", "Powerlifting", "🏋️‍♀️")]),
        n("calisthenics", "Calisthenics", "🤸", [n("pull_ups", "Pull-ups & bars", "🧗"), n("mobility", "Mobility flow", "🤸‍♂️")]),
      ]),
      n("cardio", "Cardio", "🏃", [
        n("running", "Running", "👟", [n("5k", "Casual 5k", "🏃‍♀️"), n("marathon", "Marathon", "🏅")]),
        n("cycling", "Cycling", "🚴"),
        n("hiit", "HIIT", "🔥"),
      ]),
      n("mind_body", "Mind-body", "🧘", [
        n("yoga", "Yoga", "🧘‍♀️", [n("vinyasa", "Vinyasa", "🌬️"), n("yin", "Yin / restorative", "🕯️")]),
        n("pilates", "Pilates", "🩰"),
      ]),
      n("outdoor", "Outdoor", "🏔️", [n("hiking", "Hiking", "🥾"), n("climbing", "Climbing", "🧗‍♀️"), n("swimming", "Swimming", "🏊")]),
      n("rest", "Rest is the workout", "😌"),
    ],
  },

  // 6 ─────────────────────────── Cuisine ───────────────────────────
  {
    id: "cuisine",
    label: "Cuisine",
    emoji: "🍜",
    children: [
      n("asian", "Asian", "🥢", [
        n("japanese", "Japanese", "🍣", [n("sushi", "Sushi", "🍣"), n("ramen", "Ramen", "🍜")]),
        n("indian", "Indian", "🍛", [n("north_indian_food", "North Indian", "🫓"), n("south_indian_food", "South Indian", "🥥")]),
        n("thai", "Thai", "🍲"),
        n("korean", "Korean", "🍱", [n("kbbq", "Korean BBQ", "🥩"), n("kimchi", "Kimchi everything", "🌶️")]),
      ]),
      n("european", "European", "🥐", [
        n("italian", "Italian", "🍝", [n("pizza", "Pizza", "🍕"), n("pasta", "Pasta", "🍝")]),
        n("french", "French", "🥖"),
        n("mediterranean", "Mediterranean", "🫒"),
      ]),
      n("americas_food", "Americas", "🌮", [
        n("mexican", "Mexican", "🌮", [n("tacos", "Tacos", "🌮"), n("burritos", "Burritos", "🌯")]),
        n("bbq", "American BBQ", "🍖"),
      ]),
      n("street_food", "Street food", "🍢"),
      n("desserts", "Desserts", "🍰", [n("chocolate", "Chocolate", "🍫"), n("icecream", "Ice cream", "🍦"), n("pastries", "Pastries", "🧁")]),
      n("vegan", "Plant-based", "🥗"),
    ],
  },

  // 7 ─────────────────────────── Travel ───────────────────────────
  {
    id: "travel",
    label: "Travel",
    emoji: "✈️",
    children: [
      n("adventure", "Adventure", "🧗", [
        n("mountains", "Mountains", "🏔️", [n("trekking", "Trekking", "🥾"), n("skiing", "Skiing", "⛷️")]),
        n("ocean", "Ocean", "🌊", [n("scuba", "Scuba diving", "🤿"), n("surfing", "Surfing", "🏄")]),
        n("backpacking", "Backpacking", "🎒"),
      ]),
      n("relax", "Relaxation", "🏖️", [
        n("beaches", "Beaches", "🏝️", [n("maldives", "Maldives vibes", "🐠"), n("bali", "Bali vibes", "🌺")]),
        n("spa", "Spa & wellness", "💆"),
      ]),
      n("city", "City breaks", "🌆", [n("foodie_trips", "Foodie trips", "🍜"), n("museums", "Museums & art", "🖼️"), n("nightlife", "Nightlife", "🌃")]),
      n("roadtrip", "Road trips", "🚐"),
      n("solo", "Solo travel", "🧳"),
    ],
  },

  // 8 ─────────────────────────── Books ───────────────────────────
  {
    id: "books",
    label: "Books",
    emoji: "📚",
    children: [
      n("fiction", "Fiction", "📖", [
        n("fantasy", "Fantasy", "🐉", [
          n("epic_fantasy", "Epic fantasy", "⚔️", [n("lotr", "Tolkien / LOTR", "💍"), n("sanderson", "Sanderson", "🌪️")]),
          n("ya_fantasy", "YA fantasy", "🌙"),
        ]),
        n("scifi_books", "Sci-Fi", "🚀", [n("dystopian_books", "Dystopian", "🏚️"), n("space", "Space", "🪐")]),
        n("romance", "Romance", "💞"),
        n("thriller", "Thriller / Mystery", "🔪"),
        n("literary", "Literary fiction", "🕯️"),
      ]),
      n("nonfiction", "Non-fiction", "📓", [
        n("selfhelp", "Self-help", "🌱"),
        n("history", "History", "🏛️"),
        n("science_books", "Science", "🔬"),
        n("memoir", "Memoir / biography", "🪞"),
      ]),
      n("manga", "Manga / comics", "📐"),
      n("poetry", "Poetry", "🖋️"),
    ],
  },

  // 9 ─────────────────────────── Emotion / Mood ───────────────────────────
  {
    id: "emotion",
    label: "Emotion / Mood",
    emoji: "🎭",
    children: [
      n("calm", "Calm & grounded", "🌿", [
        n("content", "Content", "☺️"),
        n("reflective", "Reflective", "🪞"),
        n("sleepy", "Cozy & sleepy", "😴"),
      ]),
      n("bright", "Bright & up", "🌟", [
        n("excited", "Excited", "✨"),
        n("motivated", "Motivated", "🚀"),
        n("social", "Social & buzzing", "🎉"),
      ]),
      n("heavy", "Heavy", "🌧️", [
        n("tired", "Drained", "😮‍💨"),
        n("anxious", "Anxious", "🌀"),
        n("lonely", "Lonely", "🌙"),
      ]),
      n("mixed", "All over the place", "🎢", [n("bittersweet", "Bittersweet", "🍂"), n("numb", "Numb", "🫥")]),
    ],
  },

  // 10 ─────────────────────────── Music ───────────────────────────
  {
    id: "music",
    label: "Music",
    emoji: "🎧",
    children: [
      n("pop", "Pop", "🎤", [
        n("kpop", "K-Pop", "💜", [n("bts", "BTS", "💜"), n("blackpink", "BLACKPINK", "🖤💗"), n("newjeans", "NewJeans", "🐰")]),
        n("western_pop", "Western pop", "🌟", [n("taylor", "Taylor Swift", "🧣"), n("weeknd", "The Weeknd", "🌆")]),
      ]),
      n("hiphop", "Hip-Hop", "🎙️", [
        n("rap", "Rap", "🔥", [n("oldschool", "Old school", "📻"), n("drill", "Drill", "🥶")]),
        n("rnb", "R&B", "💧"),
      ]),
      n("rock", "Rock", "🎸", [n("indie_rock", "Indie", "🌃"), n("classic_rock", "Classic rock", "🤘"), n("metal", "Metal", "🤟")]),
      n("electronic", "Electronic", "🎛️", [n("house", "House", "🏠"), n("techno", "Techno", "🌀"), n("lofi", "Lo-fi", "🎧")]),
      n("classical", "Classical / instrumental", "🎻"),
      n("regional", "Regional / desi", "🪕"),
    ],
  },

  // 11 ─────────────────────────── Gaming ───────────────────────────
  {
    id: "gaming",
    label: "Gaming",
    emoji: "🎮",
    children: [
      n("fps", "Shooters (FPS)", "🔫", [
        n("tactical", "Tactical", "🎯", [n("valorant", "Valorant", "🔴"), n("cs", "CS2", "🔫")]),
        n("battle_royale", "Battle royale", "🪂", [n("fortnite", "Fortnite", "🟪"), n("apex", "Apex", "🔺"), n("warzone", "Warzone", "🪖")]),
      ]),
      n("rpg", "RPG", "🗡️", [
        n("jrpg", "JRPG", "🌸", [n("final_fantasy", "Final Fantasy", "💎"), n("persona", "Persona", "🃏")]),
        n("open_world", "Open world", "🗺️", [n("elden_ring", "Elden Ring", "💍"), n("zelda", "Zelda", "🗡️"), n("witcher", "The Witcher", "🐺")]),
      ]),
      n("moba", "MOBA", "🧙", [n("lol", "League of Legends", "⚔️"), n("dota", "Dota 2", "🛡️")]),
      n("sandbox", "Sandbox / sim", "🧱", [n("minecraft", "Minecraft", "⛏️"), n("sims", "The Sims", "💚"), n("stardew", "Stardew Valley", "🌾")]),
      n("cozy_games", "Cozy games", "🍄", [n("animal_crossing", "Animal Crossing", "🍃")]),
      n("mobile", "Mobile games", "📱"),
    ],
  },

  // 12 ─────────────────────────── Tech & Internet ───────────────────────────
  {
    id: "tech",
    label: "Tech & Internet",
    emoji: "💻",
    children: [
      n("coding", "Coding", "👨‍💻", [
        n("web_dev", "Web dev", "🌐", [n("frontend", "Frontend", "🎨"), n("backend", "Backend", "🗄️")]),
        n("ai_ml", "AI / ML", "🤖", [n("llms", "LLMs", "🧠"), n("computer_vision", "Computer vision", "👁️")]),
        n("gamedev", "Game dev", "🕹️"),
      ]),
      n("gadgets", "Gadgets", "🔌", [
        n("phones", "Phones", "📲", [n("iphone", "iPhone", "🍎"), n("android", "Android", "🤖")]),
        n("wearables", "Wearables", "⌚"),
        n("pc_build", "PC building", "🖥️"),
      ]),
      n("crypto", "Crypto & Web3", "🪙"),
      n("startups", "Startups", "🚀"),
      n("social_media", "Social media", "💬", [n("tiktok", "TikTok", "🎵"), n("youtube", "YouTube", "▶️"), n("reddit", "Reddit", "👽")]),
    ],
  },

  // 13 ─────────────────────────── Fashion & Style ───────────────────────────
  {
    id: "fashion",
    label: "Fashion & Style",
    emoji: "👗",
    children: [
      n("streetwear", "Streetwear", "🧢", [n("sneakers", "Sneakers", "👟"), n("hype_drops", "Hype / drops", "🔥")]),
      n("minimal_style", "Minimal / clean", "🤍", [n("capsule", "Capsule wardrobe", "🧥"), n("monochrome", "Monochrome", "⬛")]),
      n("vintage_thrift", "Vintage / thrift", "🕰️"),
      n("formal_wear", "Tailored / formal", "🤵"),
      n("beauty", "Beauty & skincare", "💄", [n("skincare", "Skincare", "🧴"), n("makeup", "Makeup", "💋")]),
    ],
  },

  // 14 ─────────────────────────── Art & Creativity ───────────────────────────
  {
    id: "art",
    label: "Art & Creativity",
    emoji: "🎨",
    children: [
      n("visual_art", "Visual art", "🖌️", [
        n("painting", "Painting", "🖼️", [n("watercolor", "Watercolor", "💧"), n("oil_acrylic", "Oil & acrylic", "🎨")]),
        n("digital_art", "Digital art", "🖊️", [n("illustration", "Illustration", "✏️"), n("blender_3d", "3D / Blender", "🧊")]),
      ]),
      n("crafts", "Crafts & DIY", "🧶", [n("knit_crochet", "Knit & crochet", "🧣"), n("pottery", "Pottery", "🏺")]),
      n("writing", "Writing", "✍️", [n("poetry_writing", "Poetry", "🖋️"), n("fiction_writing", "Fiction", "📖"), n("journaling", "Journaling", "📓")]),
      n("design", "Design", "📐", [n("graphic_design", "Graphic design", "🎯"), n("ux_design", "UX / product", "🧩")]),
      n("filmmaking", "Film & video", "🎬"),
    ],
  },

  // 15 ─────────────────────────── Science & Space ───────────────────────────
  {
    id: "science",
    label: "Science & Space",
    emoji: "🔭",
    children: [
      n("space_science", "Space", "🪐", [
        n("astronomy", "Astronomy", "🌌", [n("planets_moons", "Planets & moons", "🌑"), n("stars_galaxies", "Stars & galaxies", "✨")]),
        n("space_travel", "Space travel", "🚀", [n("nasa", "NASA / missions", "🛰️"), n("spacex", "SpaceX", "🛸")]),
      ]),
      n("physics", "Physics", "⚛️", [n("quantum", "Quantum", "🌀"), n("cosmology", "Cosmology", "🌠")]),
      n("biology", "Biology & life", "🧬", [n("neuroscience", "Neuroscience", "🧠"), n("genetics", "Genetics", "🧫")]),
      n("earth_science", "Nature & earth", "🌍", [n("climate", "Climate", "🌡️"), n("oceans", "Oceans", "🌊"), n("dinosaurs", "Dinosaurs", "🦕")]),
      n("psychology", "Psychology", "🧩"),
    ],
  },

  // 16 ─────────────────────────── Cars & Motors ───────────────────────────
  {
    id: "cars",
    label: "Cars & Motors",
    emoji: "🚗",
    children: [
      n("performance_cars", "Performance", "🏎️", [
        n("supercars", "Supercars", "💎", [n("ferrari_car", "Ferrari", "🐎"), n("lamborghini", "Lamborghini", "🐂")]),
        n("jdm", "JDM", "🇯🇵", [n("nissan_gtr", "Nissan GT-R", "🏁"), n("toyota_supra", "Toyota Supra", "🟠")]),
      ]),
      n("evs", "EVs", "🔋", [n("tesla", "Tesla", "⚡"), n("ev_trucks", "Trucks / Rivian", "🛻")]),
      n("classic_cars", "Classic cars", "🚙"),
      n("motorcycles", "Motorcycles", "🏍️", [n("sportbikes", "Sportbikes", "🏁"), n("cruisers", "Cruisers", "🛣️")]),
      n("offroad", "Off-road & overland", "🚜"),
    ],
  },

  // 17 ─────────────────────────── Money & Career ───────────────────────────
  {
    id: "money",
    label: "Money & Career",
    emoji: "💼",
    children: [
      n("investing", "Investing", "📈", [
        n("stocks", "Stocks", "💹", [n("index_etfs", "Index / ETFs", "🧺"), n("growth_stocks", "Growth stocks", "🚀")]),
        n("real_estate", "Real estate", "🏠"),
      ]),
      n("entrepreneurship", "Entrepreneurship", "🧑‍💼", [n("side_hustle", "Side hustles", "💡"), n("small_business", "Small business", "🏪")]),
      n("personal_finance", "Personal finance", "💰", [n("budgeting", "Budgeting", "🧮"), n("fire_saving", "FIRE / saving", "🔥")]),
      n("career_growth", "Career & growth", "📊"),
    ],
  },

  // 18 ─────────────────────────── What's Trending (weekly) ───────────────────────────
  {
    id: "trending",
    label: "What's Trending",
    emoji: "🔥",
    weekly: true,
    children: [
      // ⚠️ Refresh this list weekly (or wire to a feed). Kept shallow on purpose.
      n("ai_everything", "AI everything", "🤖", [n("ai_excited", "Here for it", "🚀"), n("ai_worried", "A little scared", "😬")]),
      n("new_album", "That new album drop", "💿", [n("loved_it", "On repeat", "🔁"), n("mid", "Kinda mid", "😐")]),
      n("viral_show", "The show everyone's watching", "📺", [n("binged", "Binged it already", "🍿"), n("avoiding", "Avoiding spoilers", "🙈")]),
      n("sports_moment", "This week's sports moment", "🏆"),
      n("internet_drama", "Internet drama", "🍵", [n("invested", "Fully invested", "👀"), n("touching_grass", "Touching grass", "🌱")]),
      n("seasonal", "Seasonal mood", "🍁"),
    ],
  },
];

// ── helpers ──────────────────────────────────────────────────────────────────

export function findDomain(id: string): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}

export function childrenAt(domain: Domain, path: FlashNode[]): FlashNode[] {
  if (path.length === 0) return domain.children;
  return path[path.length - 1].children ?? [];
}

/**
 * Ordered affinity keys for matching — deepest (most specific) first, across
 * all of a user's domains. Two people who share a deeper key are more alike,
 * so matching walks these from most-branched to least ("reverse order").
 *
 * e.g. domain geography, path [asia, south_asia, india] →
 *   geography>asia>south_asia>india, geography>asia>south_asia, geography>asia, geography
 */
export function affinityKeys(
  domains: { domainId: string; path: { id: string }[] }[],
): string[] {
  const scored: { key: string; depth: number }[] = [];
  for (const sel of domains) {
    const ids = [sel.domainId, ...sel.path.map((p) => p.id)];
    for (let i = ids.length; i >= 1; i--) {
      scored.push({ key: ids.slice(0, i).join(">"), depth: i });
    }
  }
  scored.sort((a, b) => b.depth - a.depth); // most-specific across all domains first
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { key } of scored) {
    if (!seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}
