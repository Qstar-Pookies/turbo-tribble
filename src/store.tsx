import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_ICON,
  fallbackGames,
  fetchGames,
  formatTitle,
  seasonRewards,
  type Game,
  type ShopItem,
} from "./data";

export type Profile = {
  username: string;
  bio: string;
  icon: string;
  joined: string;
};

export type Settings = {
  background: "emerald" | "gold" | "midnight";
  cloak: "duck" | "classroom" | "quizlet" | "drive";
  cursor: "default" | "custom";
  reduceMotion: boolean;
  compactGrid: boolean;
  panicUrl: string;
};

export type ScoreSubmission = {
  id: string;
  gameId: string;
  gameTitle: string;
  score: number;
  proof?: string;
  note: string;
  createdAt: string;
  status: "pending" | "verified";
};

export type ChatMessage = {
  id: string;
  channel: string;
  author: string;
  text: string;
  createdAt: string;
};

type RecentGame = { id: string; title: string; playedAt: string };

type PersistentState = {
  profile: Profile;
  coins: number;
  xp: number;
  streak: number;
  bestStreak: number;
  lastClaim: string | null;
  favorites: string[];
  recentlyPlayed: RecentGame[];
  playSeconds: number;
  rewardDays: Record<string, string>;
  votes: Record<string, 0 | 1>;
  owned: string[];
  equipped: Record<string, string>;
  claimedRewards: number[];
  settings: Settings;
  scores: ScoreSubmission[];
  messages: ChatMessage[];
  uploads: Game[];
};

const STATE_KEY = "duckmath.local.state.v3";
const CATALOG_KEY = "duckmath.live.catalog.v2";

const defaultState: PersistentState = {
  profile: {
    username: "Guest Duck",
    bio: "Playing games from the pond.",
    icon: DEFAULT_ICON,
    joined: new Date().toISOString(),
  },
  coins: 150,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastClaim: null,
  favorites: [],
  recentlyPlayed: [],
  playSeconds: 0,
  rewardDays: {},
  votes: {},
  owned: ["emerald-bg"],
  equipped: { background: "emerald-bg" },
  claimedRewards: [],
  settings: {
    background: "emerald",
    cloak: "duck",
    cursor: "default",
    reduceMotion: false,
    compactGrid: false,
    panicUrl: "https://classroom.google.com/",
  },
  scores: [],
  messages: [],
  uploads: [],
};

function readState(): PersistentState {
  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    if (!saved) return defaultState;
    return {
      ...defaultState,
      ...saved,
      profile: { ...defaultState.profile, ...saved.profile },
      settings: { ...defaultState.settings, ...saved.settings },
      equipped: { ...defaultState.equipped, ...saved.equipped },
    };
  } catch {
    return defaultState;
  }
}

function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function yesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDay(date);
}

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type DuckContextValue = {
  games: Game[];
  allGames: Game[];
  loading: boolean;
  catalogError: string | null;
  liveCatalog: boolean;
  refreshCatalog: () => void;
  state: PersistentState;
  level: number;
  levelProgress: number;
  notice: string | null;
  notify: (message: string) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  toggleFavorite: (gameId: string) => void;
  recordPlay: (game: Game) => void;
  addPlayTime: (seconds: number) => void;
  vote: (gameId: string, value: 0 | 1) => void;
  claimStreak: () => void;
  buyItem: (item: ShopItem) => void;
  equipItem: (item: ShopItem) => void;
  claimSeasonReward: (tier: number) => void;
  submitScore: (entry: Omit<ScoreSubmission, "id" | "createdAt" | "status">) => void;
  addMessage: (channel: string, text: string) => void;
  addUpload: (game: Omit<Game, "id" | "local">) => void;
  removeUpload: (gameId: string) => void;
  resetLocalData: () => void;
};

const DuckContext = createContext<DuckContextValue | null>(null);

export function DuckProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistentState>(readState);
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const notify = useCallback((message: string) => setNotice(message), []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in private browsing; state still works in memory.
    }
  }, [state]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    try {
      const cached = JSON.parse(localStorage.getItem(CATALOG_KEY) || "null");
      if (cached?.games?.length) {
        setLiveGames(cached.games);
        setLoading(false);
      }
    } catch {
      // Ignore malformed or unavailable cache and request fresh data.
    }
    fetchGames(controller.signal)
      .then((games) => {
        if (!active) return;
        setLiveGames(games);
        setCatalogError(null);
        setLoading(false);
        try {
          localStorage.setItem(CATALOG_KEY, JSON.stringify({ at: Date.now(), games }));
        } catch {
          // The live catalog still works when storage is full.
        }
      })
      .catch((error: Error) => {
        if (!active || error.name === "AbortError") return;
        setCatalogError("The live catalog could not be reached. Showing cached and featured titles.");
        setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadToken]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.background = state.settings.background;
    root.dataset.motion = state.settings.reduceMotion ? "reduced" : "full";
    root.classList.toggle("custom-cursor", state.settings.cursor === "custom");
    const cursorColor = state.equipped.cursor || "#3fb683";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M4 2l18 12-8 2-4 8z" fill="${cursorColor}" stroke="white" stroke-width="2"/></svg>`;
    root.style.setProperty("--duck-cursor", `url("data:image/svg+xml,${encodeURIComponent(svg)}") 3 2, auto`);
    const cloaks = {
      duck: { title: "Duckmath — Free Unblocked Games Online", icon: DEFAULT_ICON },
      classroom: { title: "Google Classroom", icon: "https://www.gstatic.com/classroom/ic_product_classroom_144.png" },
      quizlet: { title: "Quizlet: Study Tools & Flashcards", icon: "https://quizlet.com/favicon.ico" },
      drive: { title: "My Drive - Google Drive", icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" },
    };
    const cloak = cloaks[state.settings.cloak];
    document.title = cloak.title;
    let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = cloak.icon;
  }, [state.settings, state.equipped.cursor]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "`" && state.settings.panicUrl) {
        window.location.href = state.settings.panicUrl;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.settings.panicUrl]);

  const allGames = useMemo(() => {
    const base = liveGames.length ? liveGames : fallbackGames;
    const existing = new Set(base.map((game) => String(game.id)));
    return [...state.uploads.filter((game) => !existing.has(String(game.id))), ...base];
  }, [liveGames, state.uploads]);

  const games = useMemo(
    () => allGames.filter((game) => {
      if (game.is_listed === false || game.title.startsWith("test-")) return false;
      const limits = Array.isArray(game.limit_platform) ? game.limit_platform : game.limit_platform ? [game.limit_platform] : [];
      if (limits.includes("maddox") || limits.includes("freezenova")) return false;
      return true;
    }),
    [allGames],
  );

  const updateProfile = useCallback((profile: Partial<Profile>) => {
    setState((current) => ({ ...current, profile: { ...current.profile, ...profile } }));
  }, []);

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, ...settings } }));
  }, []);

  const toggleFavorite = useCallback((gameId: string) => {
    setState((current) => ({
      ...current,
      favorites: current.favorites.includes(gameId)
        ? current.favorites.filter((item) => item !== gameId)
        : [gameId, ...current.favorites],
    }));
  }, []);

  const recordPlay = useCallback((game: Game) => {
    const today = localDay();
    setState((current) => {
      const key = String(game.id);
      const rewarded = current.rewardDays[key] === today;
      return {
        ...current,
        recentlyPlayed: [
          { id: key, title: game.title, playedAt: new Date().toISOString() },
          ...current.recentlyPlayed.filter((item) => item.id !== key),
        ].slice(0, 24),
        rewardDays: { ...current.rewardDays, [key]: today },
        coins: current.coins + (rewarded ? 0 : 5),
        xp: current.xp + (rewarded ? 0 : 20),
      };
    });
  }, []);

  const addPlayTime = useCallback((seconds: number) => {
    setState((current) => ({ ...current, playSeconds: current.playSeconds + seconds }));
  }, []);

  const vote = useCallback((gameId: string, value: 0 | 1) => {
    setState((current) => ({ ...current, votes: { ...current.votes, [gameId]: value } }));
    notify(value === 1 ? "Upvote saved" : "Downvote saved");
  }, [notify]);

  const claimStreak = useCallback(() => {
    const today = localDay();
    if (state.lastClaim === today) {
      notify("Today’s streak reward is already claimed");
      return;
    }
    const next = state.lastClaim === yesterday() ? state.streak + 1 : 1;
    const reward = Math.min(100, 10 * next);
    setState((current) => ({
      ...current,
      streak: next,
      bestStreak: Math.max(current.bestStreak, next),
      lastClaim: today,
      coins: current.coins + reward,
      xp: current.xp + 50,
    }));
    notify(`Day ${next} claimed: +${reward} dabloons and +50 XP`);
  }, [state.lastClaim, state.streak, notify]);

  const buyItem = useCallback((item: ShopItem) => {
    if (state.owned.includes(item.id)) {
      notify("You already own this item");
      return;
    }
    if (state.coins < item.cost) {
      notify(`You need ${item.cost - state.coins} more dabloons`);
      return;
    }
    setState((current) => ({
      ...current,
      coins: current.coins - item.cost,
      owned: [...current.owned, item.id],
    }));
    notify(`${item.name} added to your inventory`);
  }, [state.owned, state.coins, notify]);

  const equipItem = useCallback((item: ShopItem) => {
    if (!state.owned.includes(item.id)) {
      notify("Purchase this item before equipping it");
      return;
    }
    setState((current) => {
      const equipped = { ...current.equipped, [item.type]: item.id };
      const settings = { ...current.settings };
      if (item.type === "background") {
        settings.background = item.id === "gold-bg" ? "gold" : item.id === "midnight-bg" ? "midnight" : "emerald";
        equipped.background = item.color;
      }
      if (item.type === "cursor") {
        settings.cursor = "custom";
        equipped.cursor = item.color;
      }
      return { ...current, equipped, settings };
    });
    notify(`${item.name} equipped`);
  }, [state.owned, notify]);

  const claimSeasonReward = useCallback((tier: number) => {
    const reward = seasonRewards.find((item) => item.tier === tier);
    if (!reward || state.xp < reward.xp || state.claimedRewards.includes(tier)) return;
    setState((current) => ({
      ...current,
      coins: current.coins + reward.reward,
      claimedRewards: [...current.claimedRewards, tier],
      owned: tier === 5 && !current.owned.includes("medieval-badge")
        ? [...current.owned, "medieval-badge"]
        : current.owned,
    }));
    notify(`Tier ${tier} reward claimed`);
  }, [state.xp, state.claimedRewards, notify]);

  const submitScore = useCallback((entry: Omit<ScoreSubmission, "id" | "createdAt" | "status">) => {
    setState((current) => ({
      ...current,
      scores: [{ ...entry, id: id(), createdAt: new Date().toISOString(), status: "pending" }, ...current.scores],
    }));
    notify("Score submitted to your local verification queue");
  }, [notify]);

  const addMessage = useCallback((channel: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setState((current) => ({
      ...current,
      messages: [
        ...current.messages,
        { id: id(), channel, text: clean.slice(0, 500), author: current.profile.username, createdAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const addUpload = useCallback((game: Omit<Game, "id" | "local">) => {
    setState((current) => ({
      ...current,
      uploads: [{ ...game, id: `local-${id()}`, local: true, is_listed: true }, ...current.uploads],
    }));
    notify(`${formatTitle(game.title)} added to your local catalog`);
  }, [notify]);

  const removeUpload = useCallback((gameId: string) => {
    setState((current) => ({ ...current, uploads: current.uploads.filter((game) => String(game.id) !== gameId) }));
  }, []);

  const resetLocalData = useCallback(() => {
    localStorage.removeItem(STATE_KEY);
    setState({ ...defaultState, profile: { ...defaultState.profile, joined: new Date().toISOString() } });
    notify("Local profile and activity reset");
  }, [notify]);

  const level = Math.floor(state.xp / 500) + 1;
  const levelProgress = (state.xp % 500) / 5;

  const value: DuckContextValue = {
    games,
    allGames,
    loading,
    catalogError,
    liveCatalog: liveGames.length > 0,
    refreshCatalog: () => setReloadToken((token) => token + 1),
    state,
    level,
    levelProgress,
    notice,
    notify,
    updateProfile,
    updateSettings,
    toggleFavorite,
    recordPlay,
    addPlayTime,
    vote,
    claimStreak,
    buyItem,
    equipItem,
    claimSeasonReward,
    submitScore,
    addMessage,
    addUpload,
    removeUpload,
    resetLocalData,
  };

  return (
    <DuckContext.Provider value={value}>
      {children}
      {notice && <div className="toast" role="status">{notice}</div>}
    </DuckContext.Provider>
  );
}

export function useDuck() {
  const value = useContext(DuckContext);
  if (!value) throw new Error("useDuck must be used inside DuckProvider");
  return value;
}

export { localDay };
