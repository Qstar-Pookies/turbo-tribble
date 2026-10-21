import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import {
  AccountSidebar,
  DuckPill,
  GameCard,
  GameGrid,
  HomeBottomContent,
  LongText,
  RelatedCategories,
  SearchSidebar,
  SmartImage,
} from "../components";
import { categoryInfo, formatTitle, gameCategories, popularCategoryOrder, type Game } from "../data";
import { useDuck } from "../store";
import { NotFoundPage } from "./InfoPages";

function useNarrowGrid() {
  const [narrow, setNarrow] = useState(() => window.innerWidth < 700);
  useEffect(() => {
    const update = () => setNarrow(window.innerWidth < 700);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return narrow;
}

function GridSidebars({ search, setSearch, account, setAccount }: { search: boolean; setSearch: (value: boolean) => void; account: boolean; setAccount: (value: boolean) => void }) {
  return <><SearchSidebar open={search} onClose={() => setSearch(false)} /><AccountSidebar open={account} onClose={() => setAccount(false)} /></>;
}

function InHouseAd({ className = "vertical" }: { className?: string }) {
  return (
    <li className={`egg-vertical-under-pill in-house-ad ${className}`}>
      <a href="https://discord.com/invite/t2EwRyhFcG" target="_blank" rel="noreferrer" aria-label="Join The Duck Pond">
        <SmartImage src="https://duckmath.org/imgs/in_house/discord_vertical.jpg" alt="Join DuckMath on Discord" />
      </a>
    </li>
  );
}

function CatalogNotice() {
  const { catalogError, refreshCatalog, liveCatalog, games } = useDuck();
  if (!catalogError) return null;
  return (
    <div className="catalog-notice" role="status">
      <span>{catalogError} {liveCatalog && `${games.length} cached titles available.`}</span>
      <button onClick={refreshCatalog}><RefreshCw size={15} /> Retry</button>
    </div>
  );
}

export function HomePage() {
  const { games, loading, state } = useDuck();
  const [search, setSearch] = useState(false);
  const [account, setAccount] = useState(false);
  const narrow = useNarrowGrid();
  const listed = useMemo(() => games.filter((game) => game.is_listed !== false), [games]);
  return (
    <main className="home-page">
      <CatalogNotice />
      <GameGrid compact={state.settings.compactGrid}>
        <DuckPill onSearch={() => setSearch(true)} onAccount={() => setAccount(true)} />
        <InHouseAd />
        {listed.slice(0, 3).map((game) => <GameCard key={game.id} game={game} size={narrow ? "2x2" : "3x3"} />)}
        {listed.slice(3, 9).map((game) => <GameCard key={game.id} game={game} size={narrow ? "1x1" : "2x2"} />)}
        {listed.slice(9).map((game) => <GameCard key={game.id} game={game} size="1x1" />)}
        {loading && !listed.length && <GridSkeleton />}
        <RelatedCategories />
      </GameGrid>
      <div className="bottom-content-wrap"><HomeBottomContent /></div>
      <GridSidebars search={search} setSearch={setSearch} account={account} setAccount={setAccount} />
    </main>
  );
}

function GridSkeleton() {
  return <>{Array.from({ length: 18 }, (_, index) => <li key={index} className="skeleton-item col-span-1 row-span-1"><div className="skeleton-app-icon" /></li>)}</>;
}

export function CategoryPage() {
  const { category = "" } = useParams();
  const slug = category.toLowerCase();
  const { games, loading, state } = useDuck();
  const [search, setSearch] = useState(false);
  const [account, setAccount] = useState(false);
  const matching = useMemo(() => games.filter((game) => gameCategories(game).includes(slug)), [games, slug]);
  const info = categoryInfo[slug] || { label: formatTitle(slug), description: `Browse ${formatTitle(slug)} games from the DuckMath catalog.` };
  if (!loading && !matching.length && !categoryInfo[slug]) return <NotFoundPage />;
  return (
    <main className="category-page">
      <GameGrid compact={state.settings.compactGrid}>
        <DuckPill onSearch={() => setSearch(true)} onAccount={() => setAccount(true)} />
        {matching.slice(0, 6).map((game) => <GameCard key={game.id} game={game} size="2x2" />)}
        {matching.slice(6).map((game) => <GameCard key={game.id} game={game} size="1x1" />)}
        <RelatedCategories current={slug} />
      </GameGrid>
      {!loading && !matching.length && (
        <div className="category-empty"><h2>No listed games in this category</h2><p>Try another category or search the full catalog.</p><Link to="/">Back to all games</Link></div>
      )}
      <div className="bottom-content-wrap">
        <section className="bottom-markdown">
          <nav className="breadcrumbs"><Link to="/">Duckmath</Link><span>/</span><span>{info.label}</span></nav>
          <h1>{info.label} Games</h1>
          <LongText text={`${info.description}\n\n## Popular ${info.label} picks\n\n${matching.slice(0, 8).map((game) => `[${formatTitle(game.title)}](/class/${game.title})`).join(" · ") || "New games are added to the catalog regularly."}\n\n## How to play\n\nChoose a game above to open its play page. You can review controls, supported devices, developer information, and related games before entering fullscreen.`} />
        </section>
      </div>
      <GridSidebars search={search} setSearch={setSearch} account={account} setAccount={setAccount} />
    </main>
  );
}

export function FavoritesPage() {
  const { games, state } = useDuck();
  const [search, setSearch] = useState(false);
  const [account, setAccount] = useState(false);
  const favorites = games.filter((game) => state.favorites.includes(String(game.id)));
  return (
    <main className="category-page">
      <GameGrid compact={state.settings.compactGrid}>
        <DuckPill onSearch={() => setSearch(true)} onAccount={() => setAccount(true)} />
        <li className="category-intro-tile"><span>Your collection</span><h1>Favorite Games</h1><p>{favorites.length} saved</p></li>
        {favorites.map((game: Game) => <GameCard key={game.id} game={game} size="2x2" />)}
        <RelatedCategories />
      </GameGrid>
      {!favorites.length && <div className="category-empty"><h2>Your favorites list is empty</h2><p>Open any game and use the heart button to save it here.</p><Link to="/">Find a game</Link></div>}
      <GridSidebars search={search} setSearch={setSearch} account={account} setAccount={setAccount} />
    </main>
  );
}

export function CategoryShortcuts() {
  return <div className="category-shortcuts">{popularCategoryOrder.map((item) => <Link key={item} to={`/${item}`}>{categoryInfo[item].label}</Link>)}</div>;
}
