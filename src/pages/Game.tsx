import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Flag,
  Heart,
  Maximize2,
  Play,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  AccountSidebar,
  DuckPill,
  EmptyState,
  GameCard,
  GameGrid,
  LongText,
  RelatedCategories,
  SearchSidebar,
  SmartImage,
  StandardPage,
} from "../components";
import { formatTitle, gameCategories } from "../data";
import { useDuck } from "../store";
import { useState } from "react";

function compactNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function useGameTracking(gameId?: string) {
  const { allGames, recordPlay, addPlayTime } = useDuck();
  const game = allGames.find((item) => String(item.id) === gameId);
  useEffect(() => {
    if (!game) return;
    recordPlay(game);
    const timer = window.setInterval(() => addPlayTime(30), 30_000);
    return () => window.clearInterval(timer);
  }, [game?.id, recordPlay, addPlayTime]);
}

export function GamePage() {
  const { title = "" } = useParams();
  const decoded = decodeURIComponent(title).toLowerCase();
  const { allGames, games, loading, state, vote, toggleFavorite, refreshCatalog } = useDuck();
  const [search, setSearch] = useState(false);
  const [account, setAccount] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const game = allGames.find((item) => item.title.toLowerCase() === decoded);
  useGameTracking(game ? String(game.id) : undefined);

  const related = useMemo(() => {
    if (!game) return [];
    const categories = new Set(gameCategories(game));
    return games.filter((candidate) => candidate.id !== game.id && gameCategories(candidate).some((item) => categories.has(item))).slice(0, 50);
  }, [game, games]);

  if (!game) {
    return (
      <StandardPage className="not-found-page">
        <EmptyState
          icon={<Play size={30} />}
          title={loading ? "Loading game…" : "Game not found"}
          text={loading ? "Checking the live DuckMath catalog." : `We couldn’t find “${formatTitle(decoded)}”. It may have moved or been removed.`}
          action={<div className="button-row"><button className="btn btn-primary" onClick={refreshCatalog}><RefreshCw size={17} /> Retry catalog</button><Link className="btn btn-secondary" to="/">Back to games</Link></div>}
        />
      </StandardPage>
    );
  }

  const gameId = String(game.id);
  const userVote = state.votes[gameId];
  const favorite = state.favorites.includes(gameId);
  const displayTitle = formatTitle(game.title);
  const primaryCategory = gameCategories(game)[0] || "casual";

  const requestFullscreen = () => {
    const element = frameRef.current;
    if (!element) return;
    if (element.requestFullscreen) element.requestFullscreen();
    else (element as HTMLDivElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen?.();
  };

  const report = () => {
    const reason = window.prompt("Why are you reporting this game? Include where the issue occurs and anything blocking the game.");
    if (!reason?.trim()) return;
    window.location.href = `mailto:support@duckmath.org?subject=${encodeURIComponent(`Game report: ${displayTitle}`)}&body=${encodeURIComponent(`Game: ${displayTitle}\nCatalog ID: ${gameId}\n\n${reason}`)}`;
  };

  return (
    <main className="game-page">
      <GameGrid compact={state.settings.compactGrid}>
        <DuckPill onSearch={() => setSearch(true)} onAccount={() => setAccount(true)} />
        <li className="game-container game-frame-6x4">
          <div className="game-frame" ref={frameRef}>
            {game.link ? (
              <iframe
                key={game.link}
                src={game.link}
                title={`${displayTitle} game`}
                className="game-iframe"
                allow="autoplay; fullscreen; gamepad; keyboard-map; xr-spatial-tracking; clipboard-write"
                allowFullScreen
              />
            ) : (
              <div className="game-load-fallback">
                <SmartImage src={game.icon} alt="" />
                <h2>Game data is not available offline</h2>
                <p>Reconnect and refresh the catalog to load the original game URL.</p>
                <button className="btn btn-primary" onClick={refreshCatalog}><RefreshCw size={16} /> Retry</button>
              </div>
            )}
          </div>
          <div className="game-banner">
            {!warningDismissed && game.link && (
              <div className="game-network-warning">
                <span>This game may not work with your WiFi. Try another if it doesn’t load.</span>
                <button onClick={() => setWarningDismissed(true)}>Got it</button>
              </div>
            )}
            <div className="game-info">
              <div className="game-thumbnail"><SmartImage src={game.icon} alt={displayTitle} eager /></div>
              <div className="game-details">
                <h1 className="game-title">{displayTitle} Unblocked</h1>
                <p className="game-developer">by {game.developer_name || "Coming Soon"}</p>
                {game.top_message && <p className="game-extra-text">{game.top_message}</p>}
              </div>
            </div>
            <div className="game-actions">
              <button className={`action-button ${userVote === 1 ? "active" : ""}`} onClick={() => vote(gameId, 1)} title="Upvote"><ThumbsUp /><span>{compactNumber((game.upvotes || 0) + (userVote === 1 ? 1 : 0))}</span></button>
              <button className={`action-button ${userVote === 0 ? "active" : ""}`} onClick={() => vote(gameId, 0)} title="Downvote"><ThumbsDown /><span>{compactNumber((game.downvotes || 0) + (userVote === 0 ? 1 : 0))}</span></button>
              <button className={`action-button ${favorite ? "active favorite" : ""}`} onClick={() => toggleFavorite(gameId)} title="Favorite"><Heart fill={favorite ? "currentColor" : "none"} /><span>{favorite ? "Saved" : "Save"}</span></button>
              <button className="action-button report-action" onClick={report} title="Report"><Flag /><span>Report</span></button>
              <button className="action-button" onClick={requestFullscreen} title="Fullscreen"><Maximize2 /><span>Full</span></button>
            </div>
          </div>
        </li>
        <li className="egg-vertical-under-pill in-house-ad vertical">
          <a href="https://discord.com/invite/t2EwRyhFcG" target="_blank" rel="noreferrer"><SmartImage src="https://duckmath.org/imgs/in_house/discord_vertical.jpg" alt="Join The Duck Pond" /></a>
        </li>
        <li className="egg-vertical-top-right in-house-ad vertical">
          <a href="https://discord.com/invite/t2EwRyhFcG" target="_blank" rel="noreferrer"><SmartImage src="https://duckmath.org/imgs/in_house/discord_vertical.jpg" alt="Join The Duck Pond" /></a>
        </li>
        <li className="egg-horizontal-under-game in-house-ad horizontal">
          <a href="https://duckmath.github.io/" target="_blank" rel="noreferrer"><SmartImage src="https://duckmath.org/imgs/in_house/duckmath.webp" alt="DuckMath mirror" /></a>
        </li>
        {related.map((candidate) => <GameCard key={candidate.id} game={candidate} size="1x1" />)}
        <RelatedCategories current={primaryCategory} />
      </GameGrid>
      <div className="bottom-content-wrap">
        <section className="bottom-markdown game-description">
          <nav className="breadcrumbs"><Link to="/">Duckmath</Link><span>/</span><Link to={`/${primaryCategory}`}>{formatTitle(primaryCategory)}</Link><span>/</span><span>{displayTitle}</span></nav>
          <div className="game-description-title"><div><h1>{displayTitle}</h1><p>{gameCategories(game).map(formatTitle).join(", ")}</p></div><Link to={`/class2/${encodeURIComponent(game.title)}`} className="btn btn-primary"><Maximize2 size={17} /> Fullscreen page</Link></div>
          <LongText text={game.desc || `Play ${displayTitle} online in your browser. Open the game above to start playing without a download.`} />
          <h2>Developer</h2><p>{game.developer_name || "N/A"}</p>
          <h2>Controls</h2><LongText text={game.controls || "Controls are provided inside the game when available."} />
          <h2>Devices</h2><p>{displayTitle} can be played on: {game.devices || "Desktop"}</p>
          <h2>More games like {displayTitle}</h2>
          <p>{related.slice(0, 8).map((item) => formatTitle(item.title)).join(", ") || "Explore the related categories above for more games."}</p>
        </section>
      </div>
      <SearchSidebar open={search} onClose={() => setSearch(false)} />
      <AccountSidebar open={account} onClose={() => setAccount(false)} />
    </main>
  );
}

export function GameFullscreenPage({ minimal = false }: { minimal?: boolean }) {
  const { title = "" } = useParams();
  const decoded = decodeURIComponent(title).toLowerCase();
  const { allGames, refreshCatalog } = useDuck();
  const navigate = useNavigate();
  const frameRef = useRef<HTMLDivElement>(null);
  const game = allGames.find((item) => item.title.toLowerCase() === decoded);
  useGameTracking(game ? String(game.id) : undefined);
  if (!game) return <StandardPage><EmptyState title="Game not found" text="Return to the catalog and choose another game." action={<Link to="/" className="btn btn-primary">Back to games</Link>} /></StandardPage>;
  return (
    <main className="fullscreen-game-page">
      <div className="fullscreen-game-toolbar">
        {!minimal ? <button onClick={() => navigate(`/class/${encodeURIComponent(game.title)}`)}><ArrowLeft size={19} /> Back</button> : <span />}
        <div><SmartImage src={game.icon} alt="" /><strong>{formatTitle(game.title)}</strong></div>
        <div className="fullscreen-toolbar-actions">
          {game.link && <a href={game.link} target="_blank" rel="noreferrer" title="Open game in a new tab"><ExternalLink size={18} /></a>}
          <button onClick={() => frameRef.current?.requestFullscreen?.()} title="Browser fullscreen"><Maximize2 size={18} /></button>
        </div>
      </div>
      <div className="fullscreen-game-frame" ref={frameRef}>
        {game.link ? <iframe src={game.link} title={formatTitle(game.title)} allow="autoplay; fullscreen; gamepad; keyboard-map; clipboard-write" allowFullScreen /> : <EmptyState title="Game URL unavailable" text="Refresh the live catalog and try again." action={<button className="btn btn-primary" onClick={refreshCatalog}>Retry</button>} />}
      </div>
    </main>
  );
}
