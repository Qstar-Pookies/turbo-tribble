import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  ExternalLink,
  Gamepad2,
  Heart,
  Image as ImageIcon,
  Info,
  Lock,
  MessageCircle,
  MousePointer2,
  Paperclip,
  Play,
  Plus,
  Send,
  ShieldCheck,
  ShoppingBag,
  Shuffle,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import {
  EmptyState,
  PageHeading,
  SmartImage,
  StandardPage,
} from "../components";
import {
  DEFAULT_ICON,
  formatTitle,
  gameCategories,
  seasonRewards,
  shopItems,
  type Game,
  type ShopItem,
} from "../data";
import { useDuck } from "../store";

type ShopTab = "shop" | "battlepass" | "inventory";

export function ShopPage() {
  const [tab, setTab] = useState<ShopTab>("shop");
  const { state, level, buyItem, equipItem, claimSeasonReward } = useDuck();
  const ownedItems = shopItems.filter((item) => state.owned.includes(item.id));
  return (
    <StandardPage className="shop-page">
      <PageHeading eyebrow="DuckMath rewards" title="Item Shop & Battlepass" text="Earn dabloons and XP by playing games and claiming your daily streak. Cosmetics are stored in your local inventory." actions={<div className="balance-chip"><Coins size={19} /><strong>{state.coins}</strong><span>dabloons</span></div>} />
      <div className="page-tabs"><button className={tab === "shop" ? "active" : ""} onClick={() => setTab("shop")}><ShoppingBag /> Item Shop</button><button className={tab === "battlepass" ? "active" : ""} onClick={() => setTab("battlepass")}><Sparkles /> Medieval Times</button><button className={tab === "inventory" ? "active" : ""} onClick={() => setTab("inventory")}><Award /> Inventory <span>{ownedItems.length}</span></button></div>
      {tab === "shop" && <><div className="shop-feature panel"><div><span className="page-eyebrow">Current season</span><h2>Medieval Times</h2><p>Earn XP to unlock seasonal rewards, then visit the shop for pointers, backgrounds, and profile badges.</p><button className="btn btn-secondary" onClick={() => setTab("battlepass")}>View battlepass <ArrowRight size={16} /></button></div><div className="season-emblem"><Sparkles /><span>SEASON</span><strong>01</strong></div></div><ItemGrid items={shopItems} owned={state.owned} coins={state.coins} onBuy={buyItem} onEquip={equipItem} /></>}
      {tab === "battlepass" && <section className="battlepass-section"><div className="battlepass-summary panel"><div><span className="page-eyebrow">Season level {level}</span><h2>{state.xp} XP earned</h2><p>Play a new game each day for 20 XP and claim your streak for another 50 XP.</p></div><progress value={state.xp % 500} max={500} /></div><div className="reward-track">{seasonRewards.map((reward) => {
        const unlocked = state.xp >= reward.xp;
        const claimed = state.claimedRewards.includes(reward.tier);
        return <div key={reward.tier} className={`reward-card panel ${unlocked ? "unlocked" : "locked"}`}><span className="reward-tier">Tier {reward.tier}</span><div className="reward-icon">{unlocked ? <GiftIcon tier={reward.tier} /> : <Lock />}</div><h3>{reward.name}</h3><p>{reward.xp} XP required</p><button className="btn btn-secondary" disabled={!unlocked || claimed} onClick={() => claimSeasonReward(reward.tier)}>{claimed ? <><Check size={16} /> Claimed</> : unlocked ? "Claim reward" : `${reward.xp - state.xp} XP to go`}</button></div>;
      })}</div></section>}
      {tab === "inventory" && (ownedItems.length ? <ItemGrid items={ownedItems} owned={state.owned} coins={state.coins} inventory onBuy={buyItem} onEquip={equipItem} /> : <EmptyState icon={<ShoppingBag />} title="Your inventory is empty" text="Purchase a cosmetic or claim a season reward to start your collection." action={<button className="btn btn-primary" onClick={() => setTab("shop")}>Browse shop</button>} />)}
    </StandardPage>
  );
}

function GiftIcon({ tier }: { tier: number }) {
  return tier === 5 ? <Award /> : <Coins />;
}

function ItemGrid({ items, owned, coins, inventory = false, onBuy, onEquip }: { items: ShopItem[]; owned: string[]; coins: number; inventory?: boolean; onBuy: (item: ShopItem) => void; onEquip: (item: ShopItem) => void }) {
  return <div className="shop-grid">{items.map((item) => {
    const isOwned = owned.includes(item.id);
    return <article className="shop-item panel" key={item.id} style={{ "--item-accent": item.color } as React.CSSProperties}><div className={`shop-item-preview ${item.type}`}>{item.type === "cursor" ? <MousePointer2 /> : item.type === "background" ? <ImageIcon /> : <Award />}<span style={{ background: item.color }} /></div><div className="shop-item-copy"><span>{item.type}</span><h2>{item.name}</h2><p>{item.description}</p></div><div className="shop-item-footer">{isOwned ? <button className="btn btn-secondary" onClick={() => onEquip(item)}><Check size={16} /> Equip</button> : <button className="btn btn-primary" disabled={coins < item.cost} onClick={() => onBuy(item)}><Coins size={16} /> {item.cost}</button>}{!isOwned && coins < item.cost && <small>{item.cost - coins} more needed</small>}{inventory && isOwned && <small>Owned</small>}</div></article>;
  })}</div>;
}

type BoardTab = "global" | "games" | "submissions";

export function LeaderboardPage() {
  const [tab, setTab] = useState<BoardTab>("global");
  const { state, games, level, submitScore } = useDuck();
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState("");
  const [note, setNote] = useState("");
  const [proof, setProof] = useState<string | undefined>();
  const [proofName, setProofName] = useState("");
  const activeGame = games.find((game) => String(game.id) === selected) || games[0];
  const gameScores = state.scores.filter((entry) => !activeGame || entry.gameId === String(activeGame.id));

  useEffect(() => {
    if (!selected && games[0]) setSelected(String(games[0].id));
  }, [games, selected]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!activeGame || !Number.isFinite(Number(score))) return;
    submitScore({ gameId: String(activeGame.id), gameTitle: activeGame.title, score: Number(score), note, proof });
    setScore(""); setNote(""); setProof(undefined); setProofName("");
    setTab("submissions");
  };

  return (
    <StandardPage className="leaderboard-page">
      <PageHeading eyebrow="Player rankings" title="Leaderboard" text="Track your local XP standing and submit game scores with screenshot proof for your verification queue." actions={<div className="level-chip"><Trophy /><span>Level</span><strong>{level}</strong></div>} />
      <div className="page-tabs"><button className={tab === "global" ? "active" : ""} onClick={() => setTab("global")}><Trophy /> Overview</button><button className={tab === "games" ? "active" : ""} onClick={() => setTab("games")}><Gamepad2 /> Submit a score</button><button className={tab === "submissions" ? "active" : ""} onClick={() => setTab("submissions")}><ShieldCheck /> My submissions <span>{state.scores.length}</span></button></div>
      {tab === "global" && <><section className="leaderboard-podium panel"><div className="podium-avatar"><SmartImage src={state.profile.icon} alt="" /><span>1</span></div><div><span className="page-eyebrow">Your local standing</span><h2>{state.profile.username}</h2><p>{state.xp} XP · {state.recentlyPlayed.length} games explored · {state.playSeconds >= 60 ? `${Math.floor(state.playSeconds / 60)} minutes played` : "Just getting started"}</p></div><strong>{state.xp.toLocaleString()} XP</strong></section><div className="leaderboard-table panel"><div className="leaderboard-row leaderboard-header"><span>Rank</span><span>Player</span><span>Level</span><span>Score submissions</span><span>XP</span></div><div className="leaderboard-row"><span className="rank-number">1</span><span className="leaderboard-player"><SmartImage src={state.profile.icon} alt="" /><strong>{state.profile.username}</strong><small>You</small></span><span>{level}</span><span>{state.scores.length}</span><strong>{state.xp}</strong></div></div><div className="info-callout"><Info size={18} /><p>This browser-only board contains your real local activity; it does not invent other players. Online community rankings require DuckMath’s live account service.</p></div></>}
      {tab === "games" && <div className="score-layout"><form className="panel stacked-form" onSubmit={submit}><div className="section-heading"><div><span className="page-eyebrow">New entry</span><h2>Submit a high score</h2></div><Trophy /></div><label>Game<select value={activeGame ? String(activeGame.id) : ""} onChange={(event) => setSelected(event.target.value)}>{games.map((game) => <option key={game.id} value={game.id}>{formatTitle(game.title)}</option>)}</select></label><label>Score<input type="number" min="0" step="any" required value={score} onChange={(event) => setScore(event.target.value)} placeholder="Enter your final score" /></label><label>Notes<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Level, mode, or anything moderators should know" /></label><label className="proof-upload"><Paperclip /><span>{proofName || "Attach screenshot proof (optional)"}</span><input type="file" hidden accept="image/*" onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 3_000_000) return;
        const reader = new FileReader();
        reader.onload = () => { setProof(String(reader.result)); setProofName(file.name); };
        reader.readAsDataURL(file);
      }} /></label>{proof && <div className="proof-preview"><img src={proof} alt="Score proof preview" /><button type="button" onClick={() => { setProof(undefined); setProofName(""); }}><X /></button></div>}<button className="btn btn-primary"><Trophy size={17} /> Submit for verification</button></form><section className="panel score-game-panel">{activeGame && <><SmartImage src={activeGame.icon} alt={formatTitle(activeGame.title)} /><span className="page-eyebrow">Selected game</span><h2>{formatTitle(activeGame.title)}</h2><p>{activeGame.developer_name || "DuckMath catalog"}</p><div className="score-game-stats"><span><strong>{gameScores.length}</strong> your submissions</span><span><strong>{gameScores.length ? Math.max(...gameScores.map((entry) => entry.score)) : "—"}</strong> personal best</span></div><Link to={`/class/${encodeURIComponent(activeGame.title)}`} className="btn btn-secondary"><Play size={16} /> Play this game</Link></>}</section></div>}
      {tab === "submissions" && (state.scores.length ? <div className="submission-list">{state.scores.map((entry) => <article className="panel submission-card" key={entry.id}>{entry.proof ? <img src={entry.proof} alt="Score proof" /> : <div className="submission-placeholder"><Trophy /></div>}<div><span className={`status-badge ${entry.status}`}>{entry.status}</span><h2>{formatTitle(entry.gameTitle)}</h2><p>{entry.note || "No additional notes."}</p><small>{new Date(entry.createdAt).toLocaleString()}</small></div><strong>{entry.score.toLocaleString()}</strong></article>)}</div> : <EmptyState icon={<Trophy />} title="No score submissions" text="Choose a game and submit your first score with optional screenshot proof." action={<button className="btn btn-primary" onClick={() => setTab("games")}>Submit a score</button>} />)}
    </StandardPage>
  );
}

export function ScrollFeedPage() {
  const { games, state, toggleFavorite } = useDuck();
  const [index, setIndex] = useState(0);
  const game = games[index];
  const move = (direction: number) => setIndex((current) => (current + direction + games.length) % games.length);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "j") { event.preventDefault(); move(1); }
      if (event.key === "ArrowUp" || event.key === "k") { event.preventDefault(); move(-1); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [games.length]);
  if (!game) return <StandardPage><EmptyState title="No games in the feed" text="The catalog is still loading." /></StandardPage>;
  const favorite = state.favorites.includes(String(game.id));
  return (
    <main className="scroll-feed-page">
      <div className="feed-topbar"><Link to="/"><ArrowLeft /> Back to grid</Link><span>{index + 1} / {games.length}</span><button onClick={() => setIndex(Math.floor(Math.random() * games.length))}><Shuffle /> Shuffle</button></div>
      <section className="feed-card" key={game.id}>
        <SmartImage src={game.icon} alt={formatTitle(game.title)} eager />
        <div className="feed-shade" />
        <div className="feed-copy"><span>{gameCategories(game).slice(0, 3).map(formatTitle).join(" · ")}</span><h1>{formatTitle(game.title)}</h1><p>by {game.developer_name || "DuckMath community"}</p><div className="button-row"><Link className="btn btn-primary" to={`/class/${encodeURIComponent(game.title)}`}><Play fill="currentColor" /> Play now</Link><button className="btn btn-glass" onClick={() => toggleFavorite(String(game.id))}><Heart fill={favorite ? "currentColor" : "none"} /> {favorite ? "Saved" : "Favorite"}</button></div></div>
        <div className="feed-navigation"><button onClick={() => move(-1)} aria-label="Previous game"><ChevronUp /></button><button onClick={() => move(1)} aria-label="Next game"><ChevronDown /></button></div>
      </section>
      <div className="feed-hint"><ArrowUp /> Use arrow keys or J / K to browse <ArrowDown /></div>
    </main>
  );
}

const channels = ["general", "game-help", "introductions"];

export function ChatPage() {
  const { state, addMessage } = useDuck();
  const [channel, setChannel] = useState("general");
  const [message, setMessage] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const messages = state.messages.filter((item) => item.channel === channel);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages.length, channel]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    addMessage(channel, message);
    setMessage("");
  };
  return (
    <StandardPage className="chat-page">
      <PageHeading eyebrow="The Duck Pond" title="Community Chat" text="Chat in browser-saved local channels, or join the live DuckMath Discord for the full community." actions={<a className="btn btn-primary" href="https://discord.com/invite/t2EwRyhFcG" target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open Discord</a>} />
      <div className="chat-layout panel">
        <aside className="chat-channels"><div className="chat-server"><SmartImage src={DEFAULT_ICON} alt="" /><div><strong>The Duck Pond</strong><span>Local channels</span></div></div><h3>Channels</h3>{channels.map((item) => <button key={item} className={channel === item ? "active" : ""} onClick={() => setChannel(item)}># {item}</button>)}<div className="chat-user"><SmartImage src={state.profile.icon} alt="" /><span><strong>{state.profile.username}</strong><small>Online locally</small></span></div></aside>
        <section className="chat-main"><header><div><MessageCircle /><span><strong># {channel}</strong><small>{channel === "game-help" ? "Ask for help with loading and controls" : channel === "introductions" ? "Meet other local players" : "General DuckMath conversation"}</small></span></div></header><div className="chat-messages">{messages.length ? messages.map((item) => <div className="chat-message" key={item.id}><SmartImage src={state.profile.icon} alt="" /><div><div><strong>{item.author}</strong><time>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div><p>{item.text}</p></div></div>) : <EmptyState icon={<MessageCircle />} title={`Welcome to #${channel}`} text="No local messages yet. Start the conversation below, or join Discord to chat with the live community." />}<div ref={endRef} /></div><form className="chat-compose" onSubmit={submit}><input value={message} maxLength={500} onChange={(event) => setMessage(event.target.value)} placeholder={`Message #${channel}`} aria-label={`Message ${channel}`} /><span>{message.length}/500</span><button disabled={!message.trim()} aria-label="Send message"><Send /></button></form></section>
      </div>
      <p className="local-disclaimer"><Info size={15} /> Local channel messages stay in this browser and are not posted to Discord.</p>
    </StandardPage>
  );
}

const emptyUpload = { title: "", link: "", icon: "", categories: "casual", developer_name: "", desc: "", controls: "", devices: "Desktop" };

export function UploadPage() {
  const { state, addUpload, removeUpload } = useDuck();
  const [form, setForm] = useState(emptyUpload);
  const [error, setError] = useState("");
  const set = (key: keyof typeof emptyUpload, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const url = new URL(form.link);
      if (!["https:", "http:"].includes(url.protocol)) throw new Error();
    } catch {
      return setError("Enter a valid HTTP or HTTPS game URL.");
    }
    const slug = form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) return setError("Enter a title containing letters or numbers.");
    addUpload({
      title: slug,
      link: form.link,
      icon: form.icon || DEFAULT_ICON,
      categories: form.categories.toLowerCase().replace(/,/g, " "),
      developer_name: form.developer_name || "Community upload",
      desc: form.desc || `A community-submitted browser game: ${form.title}.`,
      controls: form.controls,
      devices: form.devices,
      is_listed: true,
      upvotes: 0,
      downvotes: 0,
    });
    setForm(emptyUpload);
  };
  return (
    <StandardPage className="upload-page">
      <PageHeading eyebrow="Community catalog" title="Upload a Game" text="Add an HTML5 or WebGL browser game to your local DuckMath catalog. It appears on the homepage immediately and stays in this browser." />
      <div className="upload-layout"><form className="panel upload-form" onSubmit={submit}><div className="upload-form-grid"><label>Game title<input required value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="My Browser Game" /></label><label>Developer<input value={form.developer_name} onChange={(event) => set("developer_name", event.target.value)} placeholder="Creator or studio" /></label><label className="full-field">Game URL<input required type="url" value={form.link} onChange={(event) => set("link", event.target.value)} placeholder="https://example.com/game/index.html" /></label><label>Categories<input value={form.categories} onChange={(event) => set("categories", event.target.value)} placeholder="puzzle casual 2d" /></label><label>Devices<select value={form.devices} onChange={(event) => set("devices", event.target.value)}><option>Desktop</option><option>Desktop,Tablet</option><option>Desktop,Tablet,Mobile</option><option>Mobile</option></select></label><label className="full-field">Icon URL<input type="url" value={form.icon.startsWith("data:") ? "" : form.icon} onChange={(event) => set("icon", event.target.value)} placeholder="https://example.com/icon.png" /></label><label className="full-field">Description<textarea rows={4} value={form.desc} onChange={(event) => set("desc", event.target.value)} placeholder="What is this game about?" /></label><label className="full-field">Controls<textarea rows={3} value={form.controls} onChange={(event) => set("controls", event.target.value)} placeholder="- Arrow keys to move\n- Space to jump" /></label></div><div className="upload-icon-row"><label className="btn btn-secondary"><ImageIcon size={17} /> Upload local icon<input type="file" hidden accept="image/*" onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file || file.size > 2_000_000) return;
        const reader = new FileReader(); reader.onload = () => set("icon", String(reader.result)); reader.readAsDataURL(file);
      }} /></label>{form.icon && <SmartImage src={form.icon} alt="Icon preview" />}</div>{error && <div className="form-error">{error}</div>}<button className="btn btn-primary"><Plus size={17} /> Add to my catalog</button><p className="setting-hint">Only submit content you have permission to share. Remote games must allow iframe embedding to play here.</p></form><aside className="panel upload-guidelines"><Upload /><h2>Before you submit</h2><ul><li>Use a direct HTTPS game page, not a download link.</li><li>Test that the game allows embedding and keyboard input.</li><li>Add clear categories and control instructions.</li><li>Do not upload malware, inappropriate content, or copyrighted work without permission.</li></ul><Link to="/ugc" className="text-link">Read community guidelines <ArrowRight size={15} /></Link></aside></div>
      <section className="uploaded-section"><div className="section-heading"><div><span className="page-eyebrow">Saved in this browser</span><h2>Your uploads</h2></div><span>{state.uploads.length} games</span></div>{state.uploads.length ? <div className="uploaded-list">{state.uploads.map((game: Game) => <article className="panel" key={game.id}><SmartImage src={game.icon} alt="" /><div><h3>{formatTitle(game.title)}</h3><p>{game.categories}</p><a href={game.link} target="_blank" rel="noreferrer">Open source URL <ExternalLink size={13} /></a></div><Link className="btn btn-secondary" to={`/class/${encodeURIComponent(game.title)}`}><Play size={15} /> Play</Link><button className="icon-button danger" onClick={() => removeUpload(String(game.id))} aria-label={`Remove ${formatTitle(game.title)}`}><Trash2 /></button></article>)}</div> : <EmptyState icon={<Upload />} title="No local uploads" text="Complete the form above to add your first browser game." />}</section>
    </StandardPage>
  );
}
