export type Game = {
  id: number | string;
  title: string;
  icon: string;
  link: string;
  categories: string;
  desc?: string | null;
  developer_name?: string | null;
  controls?: string | null;
  devices?: string | null;
  upvotes?: number | null;
  downvotes?: number | null;
  video_link?: string | null;
  is_featured?: boolean;
  is_listed?: boolean;
  is_indexed?: boolean;
  created_at?: string;
  top_message?: string | null;
  limit_platform?: string[] | string | null;
  url_data_source?: number;
  supports_about_blank?: boolean;
  supports_cloud_save?: boolean;
  local?: boolean;
};

export const DUCK = "https://duckmath.org";
export const DUCK_ASSETS = `${DUCK}/imgs`;
export const DEFAULT_ICON = `${DUCK_ASSETS}/duck.webp`;
export const SUPABASE_URL = "https://hqlgppguxhqeaonjzinv.supabase.co";
export const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxbGdwcGd1eGhxZWFvbmp6aW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MjYwNDQsImV4cCI6MjA0ODIwMjA0NH0.4LuWk4qxp0NRZ5_erEIJq5BHq5qZiSE4zTUFS1ioZw8";

const cdn = "https://cdn.jsdelivr.net/gh/mathlesson/mathlesson.github.io";

// Real DuckMath titles used while the live public catalog is loading.
const fallbackRows: Array<[string, string, string?]> = [
  ["steal-a-brainrot", "multiplayer casual indie", "DuckMath Community"],
  ["minecraft", "sandbox adventure survival 3d", "Mojang"],
  ["ragdoll-archers", "action physics shooting 2d", "Ericetto"],
  ["grow-a-garden", "casual idle simulator multiplayer", "DuckMath Community"],
  ["race-survival-arena-king", "racing driving multiplayer 3d", "DuckMath Community"],
  ["undertale-yellow", "adventure rpg retro", "Team Undertale Yellow"],
  ["99-nights-in-the-forest", "horror survival multiplayer", "DuckMath Community"],
  ["clash-royale", "strategy multiplayer mobile", "Supercell"],
  ["obby-but-youre-on-a-bike", "platformer obby 3d", "DuckMath Community"],
  ["retro-bowl-college", "sports football retro", "New Star Games"],
  ["poly-track", "racing driving 3d", "Kodub"],
  ["gladihoppers", "fighting physics 2d", "Dreamon Studios"],
  ["idle-ants", "idle clicker casual", "DuckMath Community"],
  ["deadly-descent", "driving racing 3d", "DuckMath Community"],
  ["hollow-knight", "platformer adventure indie", "Team Cherry"],
  ["monkey-mart", "idle casual simulator", "TinyDobbins"],
  ["snow-rider-3d", "driving sports 3d", "DuckMath Community"],
  ["baldis-basics", "horror indie retro", "Basically Games"],
  ["bloonstd-5", "strategy tower-defense flash", "Ninja Kiwi"],
  ["crazycattle3d", "action casual 3d", "DuckMath Community"],
  ["blocky-puzzle", "puzzle brain casual", "DuckMath Community"],
  ["backrooms", "horror adventure 3d", "DuckMath Community"],
  ["buckshot-roulette", "horror strategy indie", "Mike Klubnika"],
  ["bitlife", "simulator casual mobile", "Candywriter"],
  ["cookie-clicker", "idle clicker casual", "Orteil"],
  ["granny", "horror survival 3d", "DVloper"],
  ["pokemon-emerald", "retro rpg adventure", "Game Freak"],
  ["drive-mad", "driving physics puzzle", "Fancade"],
  ["1v1.lol", "shooting multiplayer action", "JustPlay.LOL"],
  ["the-binding-of-isaac", "action adventure indie", "Edmund McMillen"],
  ["friday-night-funkin", "music rhythm retro", "ninja_muffin99"],
  ["subway-surfers-barcelona", "running casual 3d", "SYBO Games"],
  ["five-nights-at-freddys", "horror survival point-and-click", "Scott Cawthon"],
  ["pizza-tower", "platformer action indie", "Tour De Pizza"],
  ["burrito-bison", "action arcade flash", "Juicy Beast"],
  ["retro-bowl", "sports football retro", "New Star Games"],
  ["ragdoll-hit", "action physics fighting", "DuckMath Community"],
  ["2d-fortnite", "shooting multiplayer 2d", "DuckMath Community"],
  ["undertale", "rpg adventure retro", "Toby Fox"],
  ["super-mario-64", "platformer retro 3d", "Nintendo"],
  ["capybara-clicker", "idle clicker casual", "DuckMath Community"],
  ["doki-doki-literature-club", "visual-novel story indie", "Team Salvato"],
  ["pokemon-red", "retro rpg adventure", "Game Freak"],
  ["stickman-hook", "physics skill casual", "Madbox"],
  ["drift-boss", "driving casual skill", "DuckMath Community"],
  ["solar-smash", "simulator sandbox 3d", "Paradyme Games"],
  ["among-us", "multiplayer social strategy", "Innersloth"],
  ["doom-1", "shooting retro action", "id Software"],
  ["deltarune", "rpg adventure retro", "Toby Fox"],
  ["golf-orbit", "sports casual skill", "DuckMath Community"],
  ["rocket-soccer-derby", "sports driving multiplayer", "DuckMath Community"],
  ["super-liquid-soccer", "sports physics 3d", "DuckMath Community"],
  ["funny-shooter-2", "shooting action 3d", "DuckMath Community"],
  ["happy-wheels", "physics action ragdoll", "Jim Bonacci"],
  ["escaping-the-prison", "adventure point-and-click flash", "PuffballsUnited"],
  ["hole.io", "io multiplayer casual", "Voodoo"],
  ["deepest-sword", "platformer physics indie", "Cosmic Adventure Squad"],
  ["geometry-dash", "platformer rhythm skill", "RobTop Games"],
  ["the-impossible-quiz", "puzzle quiz flash", "Splapp-me-do"],
  ["slope", "running skill 3d", "Rob Kay"],
  ["smash-karts", "multiplayer driving action", "Tall Team"],
  ["ovo", "platformer skill 2d", "Dedra Games"],
  ["uno", "cards multiplayer casual", "Mattel"],
  ["basket-random", "sports physics 2-player", "RHM Interactive"],
  ["tanuki-sunset", "driving sports retro", "DuckMath Community"],
  ["getting-over-it", "physics platformer skill", "Bennett Foddy"],
  ["portal", "puzzle adventure 3d", "Valve"],
  ["moto-x3m", "driving bike physics", "MadPuffers"],
  ["run-3", "running platformer skill", "Player 03"],
  ["fireboy-and-watergirl", "puzzle platformer 2-player", "Oslo Albet"],
  ["cluster-rush", "platformer skill 3d", "Landfall"],
  ["2048", "puzzle brain casual", "Gabriele Cirulli"],
  ["flappy-bird", "arcade skill retro", "Dong Nguyen"],
  ["duck-life-4", "adventure training flash", "Wix Games"],
  ["little-alchemy-2", "puzzle crafting casual", "Recloak"],
  ["madalin-stunt-cars-2", "driving multiplayer 3d", "Madalin Games"],
  ["rooftop-snipers", "shooting physics 2-player", "Michael Eichler"],
  ["paper-minecraft", "sandbox survival 2d", "Griffpatch"],
  ["temple-run-2", "running adventure 3d", "Imangi Studios"],
  ["red-ball-4", "platformer physics casual", "FDG Entertainment"],
  ["the-worlds-hardest-game", "puzzle skill flash", "Snubby Land"],
  ["pac-man", "arcade retro skill", "Namco"],
  ["math-duck", "puzzle math platformer", "DuckMath"],
  ["tetris", "puzzle retro skill", "Alexey Pajitnov"],
  ["eggy-car", "driving physics casual", "DuckMath Community"],
  ["volley-random", "2-player casual sports multiplayer 2d", "RHM Interactive"],
  ["wordle", "brain puzzle casual", "Duck"],
  ["super-star-car", "3d sports car driving", "Barnzmu"],
  ["truck-loader-4", "puzzle physics driving", "Flazm"],
];

const exactLinks: Record<string, string> = {
  "volley-random": "https://classroomlesson.github.io/basic-ruffle-player/html/volley_random/index.html",
  wordle: "https://db2.duckmath.org/2025/html/wordle/pre.html",
  "super-star-car": "https://classroomlesson.github.io/basic-ruffle-player/html/super_star_car/index.html",
  "truck-loader-4": "https://classroomlesson.github.io/basic-ruffle-player/html/truck_loader_4/index.html",
};

const exactIcons: Record<string, string> = {
  "super-star-car": `${cdn}/superstarcar.webp`,
  "truck-loader-4": `${cdn}/truckloader4.webp`,
};

export const fallbackGames: Game[] = fallbackRows.map(([title, categories, developer_name], index) => ({
  id: `fallback-${index}`,
  title,
  categories,
  developer_name,
  icon: exactIcons[title] || `${cdn}/img/${title}.jpg`,
  link: exactLinks[title] || "",
  desc: null,
  controls: null,
  devices: "Desktop,Tablet,Mobile",
  video_link: title === "volley-random" ? `${cdn}/v/volley-random2.mp4` : null,
  is_listed: true,
}));

export async function fetchGames(signal?: AbortSignal): Promise<Game[]> {
  const endpoint = `${SUPABASE_URL}/rest/v1/rpc/get_apps_ordered_by_title?apikey=${SUPABASE_KEY}`;
  const response = await fetch(endpoint, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
  const data = (await response.json()) as Game[];
  if (!Array.isArray(data)) throw new Error("Catalog returned an unexpected response");
  return data.filter((game) => game && game.title && game.icon);
}

export function formatTitle(title = "") {
  const acronyms: Record<string, string> = {
    io: "IO", lol: "lol", "2d": "2D", "3d": "3D", cs: "CS", cod: "COD",
    gba: "GBA", rpg: "RPG", uno: "Uno", ovo: "OvO", tabs: "TABS",
  };
  return title
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => acronyms[word.toLowerCase()] || word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function gameCategories(game: Game) {
  return (game.categories || "casual").toLowerCase().split(/[\s,]+/).filter(Boolean);
}

export const categoryInfo: Record<string, { label: string; description: string }> = {
  multiplayer: { label: "Multiplayer", description: "Compete, cooperate, and meet other players in browser-based multiplayer games that require no installation." },
  "2d": { label: "2D", description: "Explore lightweight side-scrollers, arcade games, physics challenges, and classic two-dimensional adventures." },
  flash: { label: "Flash", description: "Revisit preserved Flash-era favorites running in modern browser emulation." },
  horror: { label: "Horror", description: "Survive tense escapes, eerie mysteries, and frightening adventures." },
  platformer: { label: "Platformer", description: "Jump, dash, climb, and master precise movement through creative levels." },
  puzzle: { label: "Puzzle", description: "Train your brain with logic, physics, word, and problem-solving games." },
  fighting: { label: "Fighting", description: "Enter fast competitive battles with timing-based combat and unique fighters." },
  sports: { label: "Sports", description: "Play football, basketball, soccer, racing, and unpredictable physics sports." },
  driving: { label: "Driving", description: "Race, drift, jump, and explore in car, bike, and stunt-driving games." },
  action: { label: "Action", description: "Fast-paced games focused on movement, reactions, combat, and arcade excitement." },
  adventure: { label: "Adventure", description: "Discover new worlds, complete quests, and follow memorable stories." },
  casual: { label: "Casual", description: "Easy-to-learn games for quick breaks and relaxed play sessions." },
  shooting: { label: "Shooting", description: "Test your aim in competitive shooters and action-packed challenges." },
  racing: { label: "Racing", description: "Chase faster times and first-place finishes across tracks and open roads." },
  retro: { label: "Retro", description: "Play timeless console, arcade, and pixel-art favorites in your browser." },
  idle: { label: "Idle", description: "Build, upgrade, and grow even when you only have a few minutes to play." },
  clicker: { label: "Clicker", description: "Turn simple clicks into enormous upgrades, businesses, and collections." },
  "2-player": { label: "2 Player", description: "Share a keyboard and compete or cooperate with a friend on one device." },
  brain: { label: "Brain", description: "Words, numbers, memory, and logic challenges for curious players." },
  sandbox: { label: "Sandbox", description: "Create, explore, experiment, and play your own way without a fixed path." },
};

export const popularCategoryOrder = [
  "multiplayer", "2d", "flash", "horror", "platformer", "puzzle", "fighting", "sports", "driving",
];

export const mirrors = [
  { name: "DuckMath.org", url: "https://duckmath.org/", note: "Primary website" },
  { name: "DuckMath Cloud", url: "https://d2gve52fz9syn8.cloudfront.net/", note: "CloudFront mirror" },
  { name: "BYOD Mirror", url: "https://byod2.duckmath.org/", note: "Alternate DuckMath mirror" },
  { name: "DuckMath on GitHub", url: "https://duckmath.github.io/", note: "Open-source static mirror" },
];

export const appsAndTools = [
  { name: "The Duck Pond", description: "Join the DuckMath community, get help, and hear about new games.", url: "https://discord.com/invite/t2EwRyhFcG", kind: "Community" },
  { name: "DuckMath YouTube", description: "Game previews, updates, and DuckMath videos.", url: "https://www.youtube.com/@duckmath-games", kind: "Video" },
  { name: "DuckMath TikTok", description: "Short clips, new releases, and community highlights.", url: "https://www.tiktok.com/@duckmath", kind: "Social" },
  { name: "DuckMath Instagram", description: "Reels and updates from the DuckMath team.", url: "https://www.instagram.com/duckmath/reels/", kind: "Social" },
  { name: "Source Code", description: "Explore the open-source DuckMath project and contribute improvements.", url: "https://github.com/duckmath/duckmath.github.io", kind: "Developer" },
  { name: "Game Help", description: "Email support when a game does not load or you need help with your account.", url: "mailto:support@duckmath.org", kind: "Support" },
];

export const blogPosts = [
  {
    slug: "how-to-maximize-your-fun-with-unblocked-games-at-duckmath",
    title: "How to Maximize Your Fun with Unblocked Games at DuckMath",
    date: "October 5, 2025",
    excerpt: "Understand browser games, choose a category, and get into a game quickly on a school Chromebook.",
    sections: [
      ["Understanding Unblocked Games", "Unblocked games are browser-based titles that can run without a download. DuckMath focuses on lightweight embeds, clear controls, and quick access so you can spend your break playing rather than setting up software."],
      ["Find the right game faster", "Use Search to look up a title, or open a category such as Multiplayer, Puzzle, Sports, or Platformer. Every game page includes developer information, supported devices, and controls when the catalog provides them."],
      ["Make the experience yours", "Create a local profile, claim your daily streak, earn dabloons by playing, and spend them on cosmetic items. Your settings and activity are saved in your browser."],
    ],
  },
  {
    slug: "the-most-popular-unblocked-games-on-duckmath-what-players-are-loving",
    title: "The Most Popular Unblocked Games on DuckMath",
    date: "October 6, 2025",
    excerpt: "A look at the variety across action, puzzle, sports, platformer, and retro games.",
    sections: [
      ["An extensive game library", "DuckMath’s catalog spans action and shooters, brain-teasing puzzle titles, sports and driving games, and nostalgic platformers. New releases and community favorites appear alongside lesser-known indie games."],
      ["Something for every break", "Try Retro Bowl for a quick sports season, Tunnel Rush for a reflex challenge, 2048 for a puzzle, or a two-player physics game with a friend. Use the related-game row on any game page to find something similar."],
      ["No downloads required", "Games launch in the browser. Open the game frame, review its controls, and use Fullscreen when you want a larger view."],
    ],
  },
  {
    slug: "your-guide-to-the-best-unblocked-shooting-games-on-duckmath-for-school-fun",
    title: "Your Guide to Shooting Games on DuckMath",
    date: "January 28, 2026",
    excerpt: "Find shooting games with search and category filters, then check controls before you play.",
    sections: [
      ["Browse the collection", "Open Search and choose the Shooting filter, or search for a specific title. Multiplayer and 2 Player filters help narrow the catalog to the way you want to play."],
      ["Check compatibility", "Game pages list Desktop, Tablet, and Mobile support when available. Some larger 3D games can take longer to load on low-resource devices."],
      ["Play responsibly", "Follow your school or workplace rules and take breaks. DuckMath’s tools are intended for convenient browser entertainment, not for violating local policies."],
    ],
  },
];

export type ShopItem = {
  id: string;
  name: string;
  type: "cursor" | "background" | "badge";
  cost: number;
  description: string;
  color: string;
};

export const shopItems: ShopItem[] = [
  { id: "emerald-cursor", name: "Emerald Cursor", type: "cursor", cost: 75, color: "#3fb683", description: "A crisp emerald ring for your pointer." },
  { id: "gold-cursor", name: "Golden Cursor", type: "cursor", cost: 150, color: "#f6c945", description: "A bright gold pointer inspired by the seasonal stash." },
  { id: "crystal-cursor", name: "Crystal Cursor", type: "cursor", cost: 250, color: "#8b5cf6", description: "A violet crystal trail for dedicated players." },
  { id: "emerald-bg", name: "Emerald Caverns", type: "background", cost: 100, color: "#87dc83", description: "The classic DuckMath emerald-pattern backdrop." },
  { id: "gold-bg", name: "Golden Vault", type: "background", cost: 175, color: "#d8ad32", description: "A warm geometric gold background." },
  { id: "midnight-bg", name: "Midnight Slate", type: "background", cost: 225, color: "#1e293b", description: "A low-light slate theme for late sessions." },
  { id: "duck-badge", name: "Duckling", type: "badge", cost: 50, color: "#6fbf73", description: "A profile badge for members of the pond." },
  { id: "medieval-badge", name: "Medieval Times", type: "badge", cost: 300, color: "#c084fc", description: "The current season’s commemorative badge." },
];

export const seasonRewards = [
  { tier: 1, xp: 0, name: "25 Dabloons", reward: 25 },
  { tier: 2, xp: 150, name: "50 Dabloons", reward: 50 },
  { tier: 3, xp: 350, name: "75 Dabloons", reward: 75 },
  { tier: 4, xp: 650, name: "100 Dabloons", reward: 100 },
  { tier: 5, xp: 1000, name: "Medieval Champion Badge", reward: 150 },
];
