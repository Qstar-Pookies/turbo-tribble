import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Coins,
  Flame,
  Gamepad2,
  Home,
  Info,
  Link2,
  Menu,
  MessageCircle,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Trophy,
  Upload,
  User,
  X,
} from "lucide-react";
import {
  categoryInfo,
  DEFAULT_ICON,
  DUCK_ASSETS,
  formatTitle,
  gameCategories,
  popularCategoryOrder,
  type Game,
} from "./data";
import { useDuck } from "./store";

export function SmartImage({ src, alt, className = "", eager = false }: { src?: string | null; alt: string; className?: string; eager?: boolean }) {
  const [source, setSource] = useState(src || DEFAULT_ICON);
  useEffect(() => setSource(src || DEFAULT_ICON), [src]);
  return (
    <img
      src={source}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      onError={() => source !== DEFAULT_ICON && setSource(DEFAULT_ICON)}
    />
  );
}

export function GameCard({ game, size = "1x1" }: { game: Game; size?: "1x1" | "2x2" | "3x3" }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const spans = { "1x1": "col-span-1 row-span-1", "2x2": "col-span-2 row-span-2", "3x3": "col-span-3 row-span-3" };
  return (
    <li className={`app-icon-card ${spans[size]}`}>
      <Link
        to={`/class/${encodeURIComponent(game.title)}`}
        className="app-icon-container"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }}
        aria-label={`Play ${formatTitle(game.title)}`}
      >
        <div className="app-icon-image-wrapper">
          <SmartImage src={game.icon} alt={formatTitle(game.title)} className="app-icon-image" />
          {hovered && game.video_link && (
            <video ref={videoRef} src={game.video_link} className="app-icon-video show-video" muted loop playsInline autoPlay />
          )}
        </div>
        <div className="app-icon-overlay">
          <h3 className="new-app-icon-title">{formatTitle(game.title)}</h3>
        </div>
        {game.local && <span className="local-game-tag">Local</span>}
      </Link>
    </li>
  );
}

export function DuckPill({ onSearch, onAccount }: { onSearch: () => void; onAccount: () => void }) {
  const { state } = useDuck();
  return (
    <li className="duck-pill col-span-1 row-span-1">
      <Link to="/" className="pill-brand" aria-label="DuckMath home">
        <SmartImage src={`${DUCK_ASSETS}/duck.webp`} alt="DuckMath goose" eager />
        <span className="pill-wordmark">Duckmath</span>
      </Link>
      <div className="pill-actions">
        <button onClick={onSearch} aria-label="Search games" title="Search games"><Search size={21} /></button>
        <button onClick={onAccount} aria-label="Open account menu" title="Account and features" className="pill-account">
          <User size={20} />
          <span>{state.coins}</span>
        </button>
      </div>
    </li>
  );
}

export function GameGrid({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return <ul className={`apps-grid${compact ? " compact-grid" : ""}`}>{children}</ul>;
}

export function Sidebar({ open, onClose, title, children, search = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; search?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}${search ? " search-sidebar" : ""}`} aria-hidden={!open} aria-label={title}>
        <div className="sidebar-header">
          <button className="sidebar-back-button" onClick={onClose} aria-label="Close sidebar"><ArrowLeft size={24} /></button>
          <h2 className="sidebar-title">{title}</h2>
        </div>
        <div className="sidebar-content">{children}</div>
      </aside>
    </>
  );
}

export function SearchSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { games } = useDuck();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    games.forEach((game) => gameCategories(game).forEach((item) => counts.set(item, (counts.get(item) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [games]);
  const ordered = [...popularCategoryOrder.filter((item) => categories.includes(item)), ...categories.filter((item) => !popularCategoryOrder.includes(item))].slice(0, 22);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return games.filter((game) => {
      const matchesQuery = !needle || `${game.title} ${game.categories} ${game.developer_name || ""}`.toLowerCase().replace(/-/g, " ").includes(needle);
      const matchesCategory = category === "all" || gameCategories(game).includes(category);
      return matchesQuery && matchesCategory;
    }).slice(0, 60);
  }, [games, query, category]);
  return (
    <Sidebar open={open} onClose={onClose} title="Search" search>
      <div className="search-sidebar-header">
        <div className="search-bar-wrapper">
          <span className="search-bar-icon"><Search size={22} /></span>
          <input
            ref={inputRef}
            className="search-bar-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search games..."
            aria-label="Search games"
            onKeyDown={(event) => {
              if (event.key === "Enter" && results[0]) {
                navigate(`/class/${encodeURIComponent(results[0].title)}`);
                onClose();
              }
            }}
          />
          {(query || category !== "all") && (
            <button className="search-bar-clear" onClick={() => { setQuery(""); setCategory("all"); }} aria-label="Clear search"><X size={18} /></button>
          )}
        </div>
      </div>
      <div className="category-filters">
        <div className="category-filters-scroll">
          {["all", ...ordered].map((item) => (
            <button key={item} className={`category-filter-btn ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>
              {item === "all" ? "All Games" : categoryInfo[item]?.label || formatTitle(item)}
            </button>
          ))}
        </div>
      </div>
      <div className="search-results-heading">
        <h3>{query ? `Results for “${query}”` : category === "all" ? "Top Games" : `${categoryInfo[category]?.label || formatTitle(category)} Games`}</h3>
        <span>{results.length}{results.length === 60 ? "+" : ""} games</span>
      </div>
      {results.length ? (
        <div className="search-results-grid">
          {results.map((game) => (
            <Link key={game.id} to={`/class/${encodeURIComponent(game.title)}`} className="search-result-card" onClick={onClose}>
              <SmartImage src={game.icon} alt="" />
              <span>{formatTitle(game.title)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Search />} title="No games found" text="Try another title or choose a different category." />
      )}
    </Sidebar>
  );
}

const accountItems = [
  { label: "Profile", path: "/profile", icon: User, color: "#3fb683" },
  { label: "Streak", path: "/streak", icon: Flame, color: "#ffa726" },
  { label: "Scroll Feed", path: "/scroll-feed", icon: Menu, color: "#06b6d4" },
  { label: "Item Shop", path: "/cache", icon: ShoppingBag, color: "#c084fc" },
  { label: "Links", path: "/links", icon: Link2, color: "#f97316" },
  { label: "Settings", path: "/settings", icon: Settings, color: "#c8e6c9" },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy, color: "#ffb300" },
  { label: "Upload", path: "/upload", icon: Upload, color: "#60a5fa" },
];

export function AccountSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, level } = useDuck();
  return (
    <Sidebar open={open} onClose={onClose} title="Your Duck">
      <Link to="/profile" onClick={onClose} className="account-profile-card">
        <SmartImage src={state.profile.icon} alt="Profile" />
        <div><strong>{state.profile.username}</strong><span>Level {level} · {state.xp} XP</span></div>
        <ArrowRight size={18} />
      </Link>
      <div className="account-quick-stats">
        <span><Coins size={16} /> {state.coins} dabloons</span>
        <span><Flame size={16} /> {state.streak} day streak</span>
      </div>
      <div className="account-sidebar-items">
        <div className="account-sidebar-list">
          {accountItems.map(({ label, path, icon: Icon, color }) => (
            <Link key={path} className="account-sidebar-item" to={path} onClick={onClose} style={{ "--item-color": color } as React.CSSProperties}>
              <div className="account-sidebar-item-icon"><Icon size={23} /></div>
              <span className="account-sidebar-item-label">{label}</span>
              <div className="account-sidebar-item-arrow"><ArrowRight size={16} /></div>
            </Link>
          ))}
          <a className="account-sidebar-item" href="https://discord.com/invite/t2EwRyhFcG" target="_blank" rel="noreferrer" style={{ "--item-color": "#5865F2" } as React.CSSProperties}>
            <div className="account-sidebar-item-icon"><MessageCircle size={23} /></div>
            <span className="account-sidebar-item-label">The Duck Pond</span>
            <div className="account-sidebar-item-arrow"><ArrowRight size={16} /></div>
          </a>
        </div>
      </div>
    </Sidebar>
  );
}

export function RelatedCategories({ current }: { current?: string }) {
  return (
    <li className="related-categories-card">
      <div className="related-categories-heading"><Sparkles size={20} /><h2>Popular Unblocked Game Categories</h2></div>
      <div className="related-category-links">
        {popularCategoryOrder.filter((item) => item !== current).map((item) => (
          <Link key={item} to={`/${item}`}>{categoryInfo[item].label}<ArrowRight size={15} /></Link>
        ))}
      </div>
    </li>
  );
}

export function TopBanner() {
  return (
    <div className="top-banner">
      <Link to="/" className="top-banner-brand">
        <img src={`${DUCK_ASSETS}/goose_xmas.png`} alt="DuckMath logo" className="hover-spin" />
        <span>Duckmath</span>
      </Link>
    </div>
  );
}

export function StandardPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`standard-page ${className}`}><TopBanner /><div className="standard-page-inner">{children}</div></main>;
}

export function PageHeading({ eyebrow, title, text, actions }: { eyebrow?: string; title: string; text?: string; actions?: ReactNode }) {
  return (
    <header className="page-heading">
      <div>{eyebrow && <span className="page-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{text && <p>{text}</p>}</div>
      {actions && <div className="page-heading-actions">{actions}</div>}
    </header>
  );
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state">{icon && <div className="empty-state-icon">{icon}</div>}<h3>{title}</h3><p>{text}</p>{action}</div>;
}

export function TextWithLinks({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return <>{parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return <span key={index}>{part.replace(/\*\*/g, "")}</span>;
    return match[2].startsWith("/")
      ? <Link key={index} to={match[2]}>{match[1]}</Link>
      : <a key={index} href={match[2]} target="_blank" rel="noreferrer">{match[1]}</a>;
  })}</>;
}

export function LongText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).filter(Boolean);
  return <div className="long-text">{blocks.map((block, index) => {
    if (block.startsWith("## ")) return <h2 key={index}>{block.replace(/^##\s+/, "")}</h2>;
    const lines = block.split("\n");
    if (lines.every((line) => line.trim().startsWith("-"))) {
      return <ul key={index}>{lines.map((line, i) => <li key={i}><TextWithLinks text={line.replace(/^[-*]\s*/, "")} /></li>)}</ul>;
    }
    return <p key={index}>{lines.map((line, i) => <span key={i}><TextWithLinks text={line.replace(/^[-*]\s*/, "")} />{i < lines.length - 1 && <br />}</span>)}</p>;
  })}</div>;
}

export function HomeBottomContent() {
  return (
    <section className="bottom-markdown">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Duckmath</Link><span>/</span><span>Unblocked Games</span></nav>
      <h1>About DuckMath</h1>
      <h2>Unblocked Games</h2>
      <p>DuckMath hosts a curated library of actually working unblocked games in school with fast loads and minimal friction. Play instantly with no downloads or logins.</p>
      <h2>Featured games you can play here</h2>
      <p>Browse community favorites including Steal A Brainrot, Minecraft, Ragdoll Archers, Grow A Garden, Retro Bowl College, Poly Track, Slope, 2048, and hundreds more.</p>
      <h2>Popular categories</h2>
      <p>Multiplayer, 2D, Flash, Horror, Platformer, Puzzle, Fighting, Sports, and Driving categories make it easy to find the right game for a quick break or a longer session.</p>
      <h2>Built for school Chromebooks</h2>
      <p>DuckMath is a simple, fast, student-run unblocked games website. The catalog prioritizes stable, lightweight embeds, helpful controls information, and quick links so you can get into a game and have fun.</p>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const social = [
    ["TikTok", "https://www.tiktok.com/@duckmath", "tiktok.svg"],
    ["The Duck Pond", "https://discord.com/invite/t2EwRyhFcG", "duckpond.svg"],
    ["Instagram", "https://www.instagram.com/duckmath/reels/", "instagram.svg"],
    ["YouTube", "https://www.youtube.com/@duckmath-games", "youtube.svg"],
    ["LinkedIn", "https://www.linkedin.com/company/duckmath", "linkedin.svg"],
  ];
  return (
    <footer className="ducky-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section footer-brand-section">
            <div className="brand-header">
              <Link to="/"><SmartImage src={`${DUCK_ASSETS}/duck.webp`} alt="DuckMath" className="footer-logo" eager /></Link>
              <div className="brand-text"><Link to="/"><h1 className="brand-title">Duckmath</h1></Link><p className="brand-subtitle">Free Unblocked Games Online</p></div>
            </div>
            <p className="brand-description">Duckmath.org hosts 250+ browser games, updates daily, and features leaderboards, dabloons, a seasonal battlepass, and multiple integrations so you can play from the school chromebook.</p>
            <div className="social-links">{social.map(([name, url, icon]) => <a key={name} href={url} className="social-btn" aria-label={name} target="_blank" rel="noreferrer"><img src={`${DUCK_ASSETS}/black_social_icons/${icon}`} alt={name} /></a>)}</div>
          </div>
          <FooterSection title="Pages" links={[["🏠", "Home", "/"], ["ℹ️", "About", "/about"], ["📝", "Blog", "/blog"]]} />
          <FooterSection title="Features" links={[["🏆", "Leaderboard", "/leaderboard"], ["🔥", "Streak", "/streak"], ["👤", "Profile", "/profile"], ["⚙️", "Settings", "/settings"], ["📤", "Upload", "/upload"], ["📜", "Scroll Feed", "/scroll-feed"]]} />
          <FooterSection title="Support" links={[["📧", "Contact Us", "mailto:support@duckmath.org"], ["💬", "The Duck Pond", "https://discord.com/invite/t2EwRyhFcG"], ["🔗", "Links", "/links"]]} />
          <FooterSection title="Legal" links={[["📜", "Terms of Service", "/terms"], ["🔒", "Privacy Policy", "/privacy"], ["⚖️", "DMCA Takedown", "/takedown"]]} />
        </div>
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">© {year} Duckmath. All rights reserved. v1.1.50</p>
            <p className="production-credit">Built for fast, accessible browser gaming.</p>
            <a href="mailto:support@duckmath.org" className="contact-email">support@duckmath.org</a>
          </div>
        </div>
      </div>
      <div className="crystal-decoration crystal-1" /><div className="crystal-decoration crystal-2" /><div className="crystal-decoration crystal-3" />
    </footer>
  );
}

function FooterSection({ title, links }: { title: string; links: string[][] }) {
  return <div className="footer-section"><h4 className="section-title">{title}</h4><ul className="footer-links">{links.map(([icon, label, url]) => <li key={label}>{url.startsWith("/") ? <Link to={url}><span className="link-icon">{icon}</span> {label}</Link> : <a href={url} target={url.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><span className="link-icon">{icon}</span> {label}</a>}</li>)}</ul></div>;
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export const pageIcons = { Home, Info, BookOpen, Gamepad2, Award };
