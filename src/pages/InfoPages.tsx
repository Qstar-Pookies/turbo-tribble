import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  FileText,
  Gamepad2,
  Globe2,
  HeartHandshake,
  Info,
  Link2,
  Mail,
  Megaphone,
  MonitorCheck,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import {
  EmptyState,
  LongText,
  PageHeading,
  SmartImage,
  StandardPage,
} from "../components";
import { appsAndTools, blogPosts, DUCK_ASSETS, mirrors } from "../data";
import { useDuck } from "../store";

export function AboutPage() {
  return (
    <StandardPage className="about-page">
      <PageHeading eyebrow="About DuckMath" title="Gaming is a fundamental right." text="DuckMath is a fast, lightweight, student-run browser games platform focused on accessibility, safety, and community." actions={<Link to="/" className="btn btn-primary"><Gamepad2 size={17} /> Explore games</Link>} />
      <section className="about-hero panel"><SmartImage src={`${DUCK_ASSETS}/duck.webp`} alt="DuckMath" eager /><div><span className="page-eyebrow">1,000,000+ active users since 2022</span><h2>Built for play, wherever you are.</h2><p>DuckMath.org was built to make high-quality browser games available to everyone. The catalog combines HTML5, WebGL, preserved classics, and community favorites with a small footprint so pages load quickly on school and low-end devices.</p></div></section>
      <div className="about-values"><Value icon={<Globe2 />} title="Accessible" text="No installs or launchers. Open a game and play directly in your browser." /><Value icon={<HeartHandshake />} title="Community first" text="Player feedback, uploads, votes, and reports help improve the catalog." /><Value icon={<ShieldCheck />} title="Privacy aware" text="Local features keep activity in your browser, and account data is handled separately." /><Value icon={<Sparkles />} title="Always growing" text="New games, seasonal rewards, and community features are added regularly." /></div>
      <section className="panel manifesto"><span className="page-eyebrow">Our manifesto</span><h2>We build bridges, not walls.</h2><LongText text={"We believe everyone deserves access to quality entertainment. We foster community, creativity, and fair competition.\n\nWe stand for accessible gaming, player privacy, and the freedom to play. Use DuckMath responsibly and follow the rules of your school, workplace, and network."} /></section>
      <section className="about-steps"><div><span>01</span><h3>Find your game</h3><p>Search the full catalog or browse categories such as Puzzle, Sports, Multiplayer, and Platformer.</p></div><div><span>02</span><h3>Check the details</h3><p>Every game page includes controls, supported devices, developer information, and related titles.</p></div><div><span>03</span><h3>Play and earn</h3><p>Open the game, claim daily streaks, collect dabloons, and unlock seasonal cosmetics.</p></div></section>
    </StandardPage>
  );
}

function Value({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="panel value-card"><div>{icon}</div><h2>{title}</h2><p>{text}</p></div>;
}

export function AppsPage() {
  return (
    <StandardPage className="apps-page">
      <PageHeading eyebrow="Apps & Unblockers" title="DuckMath apps and integrations" text="Find community, support, open-source, and social resources connected to DuckMath. Use third-party services responsibly and follow local policies." />
      <div className="tools-grid">{appsAndTools.map((app) => <a key={app.name} href={app.url} target={app.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="panel tool-card"><span>{app.kind}</span><div className="tool-icon">{app.kind === "Developer" ? <Code2 /> : app.kind === "Support" ? <Mail /> : app.kind === "Community" ? <Users /> : <ExternalLink />}</div><h2>{app.name}</h2><p>{app.description}</p><strong>Open resource <ArrowRight size={16} /></strong></a>)}</div>
      <section className="panel info-callout"><Info /><p>DuckMath does not require an extension or download. Be cautious with third-party proxy services, review their privacy policies, and never enter sensitive credentials into a site you do not trust.</p></section>
    </StandardPage>
  );
}

export function LinksPage() {
  const { notify } = useDuck();
  const copy = async (url: string) => {
    try { await navigator.clipboard.writeText(url); notify("Link copied to clipboard"); }
    catch { notify("Select and copy the link manually"); }
  };
  return (
    <StandardPage className="links-page">
      <PageHeading eyebrow="Mirrors & quick links" title="DuckMath Links" text="Alternate official destinations can help when a particular host is unavailable. Availability depends on your network." />
      <div className="mirror-list">{mirrors.map((mirror, index) => <article className="panel mirror-card" key={mirror.url}><span className="mirror-index">0{index + 1}</span><div><h2>{mirror.name}</h2><p>{mirror.note}</p><code>{mirror.url.replace("https://", "")}</code></div><button className="icon-button" onClick={() => copy(mirror.url)} aria-label={`Copy ${mirror.name} URL`}><Copy /></button><a className="btn btn-secondary" href={mirror.url} target="_blank" rel="noreferrer">Open <ExternalLink size={15} /></a></article>)}</div>
      <div className="links-columns"><section className="panel"><Link2 /><h2>Community & support</h2><a href="https://discord.com/invite/t2EwRyhFcG" target="_blank" rel="noreferrer">The Duck Pond Discord <ArrowRight /></a><a href="mailto:support@duckmath.org">support@duckmath.org <ArrowRight /></a><Link to="/takedown">DMCA takedown request <ArrowRight /></Link></section><section className="panel"><MonitorCheck /><h2>Tab tools</h2><p>Change the tab title and favicon or set a quick-exit destination.</p><Link className="btn btn-secondary" to="/settings">Open cloak settings</Link></section></div>
    </StandardPage>
  );
}

export function BlogPage() {
  const [params] = useSearchParams();
  const { slug: pathSlug } = useParams();
  const slug = pathSlug || params.get("blog");
  const post = blogPosts.find((item) => item.slug === slug);
  if (slug && !post) return <NotFoundPage />;
  if (post) return (
    <StandardPage className="article-page">
      <Link to="/blog" className="back-link"><ArrowLeft size={17} /> All articles</Link>
      <article className="panel article-card"><header><span className="page-eyebrow">DuckMath Blog · {post.date}</span><h1>{post.title}</h1><p>{post.excerpt}</p></header><div className="article-body">{post.sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}<div className="article-cta"><SmartImage src={`${DUCK_ASSETS}/duck.webp`} alt="" /><div><h2>Ready to play?</h2><p>Browse the complete DuckMath catalog.</p></div><Link to="/" className="btn btn-primary">Find a game <ArrowRight size={16} /></Link></div></div></article>
    </StandardPage>
  );
  return (
    <StandardPage className="blog-page">
      <PageHeading eyebrow="DuckMath Blog" title="Guides, updates, and game picks" text="Learn how to navigate the catalog, find your next favorite game, and make the most of DuckMath features." />
      <div className="blog-grid">{blogPosts.map((item, index) => <Link key={item.slug} to={`/blog?blog=${item.slug}`} className={`panel blog-card ${index === 0 ? "featured" : ""}`}><div className="blog-card-art"><BookOpen /><span>DUCKMATH / GUIDE</span></div><div><span className="page-eyebrow">{item.date}</span><h2>{item.title}</h2><p>{item.excerpt}</p><strong>Read article <ArrowRight size={16} /></strong></div></Link>)}</div>
    </StandardPage>
  );
}

export function AdvertisePage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    window.location.href = `mailto:support@duckmath.org?subject=${encodeURIComponent(`Advertising inquiry from ${form.company || form.name}`)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\n\n${form.message}`)}`;
  };
  return (
    <StandardPage className="advertise-page">
      <PageHeading eyebrow="Partner with DuckMath" title="Advertise with us" text="Reach a large browser-gaming audience through clearly labeled placements on the DuckMath catalog and game pages." />
      <div className="advertise-stats"><div><strong>1M+</strong><span>active users since 2022</span></div><div><strong>250+</strong><span>browser games</span></div><div><strong>Daily</strong><span>catalog updates</span></div></div>
      <div className="advertise-layout"><section className="panel"><Megaphone /><h2>Placement options</h2><div className="placement"><span>01</span><div><h3>Homepage catalog</h3><p>Responsive placements around the game mosaic and category discovery areas.</p></div></div><div className="placement"><span>02</span><div><h3>Game detail pages</h3><p>Vertical and horizontal inventory adjacent to gameplay and related games.</p></div></div><div className="placement"><span>03</span><div><h3>Community partnerships</h3><p>Appropriate campaigns and community integrations considered on a case-by-case basis.</p></div></div><p className="setting-hint">All advertising must be clearly labeled, safe for a student audience, and free of deceptive downloads or misleading controls.</p></section><form className="panel stacked-form" onSubmit={submit}><h2>Start a conversation</h2><label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Work email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Company<input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></label><label>Campaign details<textarea required rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Goals, timing, budget range, and preferred placement" /></label><button className="btn btn-primary"><Mail size={17} /> Compose inquiry</button></form></div>
    </StandardPage>
  );
}

export function UGCPage() {
  return (
    <StandardPage className="legal-page">
      <PageHeading eyebrow="User-generated content" title="Community & Upload Guidelines" text="These rules keep game uploads, score submissions, and community interactions useful and safe." />
      <LegalSections sections={[
        ["Content you may share", "Submit browser games and media you own, have permission to share, or are otherwise authorized to distribute. Provide accurate titles, creators, categories, controls, and descriptions."],
        ["Prohibited content", "Do not submit malware, deceptive downloads, harassment, hate, explicit sexual content, private information, or content that infringes another person’s rights. Do not use uploads to advertise unrelated products or bypass a takedown."],
        ["Scores and proof", "Submit only scores you earned. Screenshot proof should show the relevant game and score without exposing personal information. Fabricated or manipulated submissions may be rejected."],
        ["Moderation and removal", "Content may be hidden or removed when it violates these rules, breaks the website, or is subject to a valid rights-holder request. Repeat abuse can result in restrictions."],
        ["Report a problem", "Use the Report control on a game page or email support@duckmath.org with the game title, URL, and a clear description of the issue."],
      ]} />
      <div className="button-row"><Link to="/upload" className="btn btn-primary"><Upload size={16} /> Upload a game</Link><Link to="/takedown" className="btn btn-secondary"><Scale size={16} /> Rights-holder request</Link></div>
    </StandardPage>
  );
}

function downloadBlob(content: string, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DownloadPage() {
  const { games, state, notify } = useDuck();
  const exportCatalog = () => {
    downloadBlob(JSON.stringify(games.map(({ title, icon, link, categories, developer_name, controls, devices }) => ({ title, icon, link, categories, developer_name, controls, devices })), null, 2), "duckmath-catalog.json", "application/json");
    notify("Catalog JSON downloaded");
  };
  const exportProfile = () => {
    downloadBlob(JSON.stringify(state, null, 2), "duckmath-profile-backup.json", "application/json");
    notify("Profile backup downloaded");
  };
  return (
    <StandardPage className="download-page">
      <PageHeading eyebrow="Downloads & backups" title="Take your data with you" text="Export the currently loaded game catalog or your local DuckMath activity as readable JSON files." />
      <div className="download-grid"><button className="panel download-card" onClick={exportCatalog}><FileJson /><span className="page-eyebrow">{games.length} loaded titles</span><h2>Game catalog</h2><p>Download titles, artwork URLs, game links, categories, developers, controls, and device support.</p><strong>Download JSON <Download /></strong></button><button className="panel download-card" onClick={exportProfile}><FileText /><span className="page-eyebrow">Local backup</span><h2>Profile & activity</h2><p>Export your profile, favorites, history, settings, inventory, scores, messages, and uploads.</p><strong>Download backup <Download /></strong></button><Link className="panel download-card" to="/download-svg"><Code2 /><span className="page-eyebrow">Original artwork</span><h2>SVG backgrounds</h2><p>View and download the emerald and gold geometric background assets used by DuckMath.</p><strong>Browse SVG files <ArrowRight /></strong></Link></div>
    </StandardPage>
  );
}

export function DownloadSvgPage() {
  const { notify } = useDuck();
  const files = [{ name: "Emeralds", url: `${DUCK_ASSETS}/backgrounds/emeralds.svg` }, { name: "Gold", url: `${DUCK_ASSETS}/backgrounds/gold.svg` }];
  const download = async (name: string, url: string) => {
    try {
      const response = await fetch(url); if (!response.ok) throw new Error();
      const text = await response.text(); downloadBlob(text, `duckmath-${name.toLowerCase()}.svg`, "image/svg+xml"); notify(`${name} SVG downloaded`);
    } catch { window.open(url, "_blank", "noopener,noreferrer"); }
  };
  return (
    <StandardPage className="svg-page">
      <PageHeading eyebrow="DuckMath assets" title="Download SVG backgrounds" text="Original scalable geometric backgrounds served from DuckMath’s asset library." actions={<Link to="/download" className="btn btn-secondary"><ArrowLeft size={16} /> All downloads</Link>} />
      <div className="svg-grid">{files.map((file) => <article className="panel svg-card" key={file.name}><div style={{ backgroundImage: `url(${file.url})` }} /><h2>{file.name}.svg</h2><p>Scalable vector graphic · original DuckMath asset</p><div className="button-row"><button className="btn btn-primary" onClick={() => download(file.name, file.url)}><Download size={16} /> Download</button><a className="btn btn-secondary" href={file.url} target="_blank" rel="noreferrer">View source <ExternalLink size={15} /></a></div></article>)}</div>
    </StandardPage>
  );
}

export function PrivacyPage() {
  return <StandardPage className="legal-page"><PageHeading eyebrow="Legal" title="Privacy Policy" text="How DuckMath handles account, gameplay, uploaded, and locally stored information." /><LegalSections sections={[
    ["Information you provide", "Account registration may require an email address, password, and display name. Game reports, support messages, score submissions, and uploads can include the content you choose to submit. Do not include unnecessary personal information."],
    ["Gameplay and technical data", "The service may process game plays, votes, streaks, rewards, diagnostics, approximate device capabilities, and basic request information to operate features, prevent abuse, and improve reliability."],
    ["Local browser storage", "This implementation stores guest profiles, favorites, play history, settings, local messages, uploads, inventory, and score queues in your browser’s localStorage. You can export or erase these from Settings. Clearing browser data also removes them."],
    ["Third-party games and services", "Games, content delivery networks, authentication, community, and external links may be operated by third parties. Their own policies apply when you open or interact with them. Review permissions before providing information."],
    ["Data retention and security", "Information should be retained only as long as needed for the described features, safety, and legal obligations. No online service can guarantee absolute security; use a unique password and protect your account."],
    ["Your choices", "You can play without creating an online account, edit your profile, reset local data, and contact support about account or content requests. Parents or guardians with concerns about a child’s information should contact support."],
    ["Contact", "Questions about privacy can be sent to support@duckmath.org."],
  ]} /></StandardPage>;
}

export function TermsPage() {
  return <StandardPage className="legal-page"><PageHeading eyebrow="Legal" title="Terms of Service" text="Rules for using DuckMath, its catalog, community features, and reward systems." /><LegalSections sections={[
    ["Using the service", "You may use DuckMath for lawful, personal, non-destructive purposes. Follow applicable laws, school or workplace rules, network policies, and third-party game terms. You are responsible for activity under your account."],
    ["Games and third-party content", "The catalog links to and embeds content from multiple creators and hosts. DuckMath does not claim ownership of all third-party games. Availability, compatibility, and external content can change without notice."],
    ["Accounts and rewards", "Keep your credentials secure and provide accurate account information. Dabloons, XP, badges, streaks, and battlepass rewards are virtual site features with no cash value and cannot be exchanged for money."],
    ["Acceptable conduct", "Do not attack or overload the service, bypass security, scrape at abusive rates, manipulate votes or scores, impersonate others, upload unlawful content, or interfere with other players."],
    ["User submissions", "You retain rights in content you submit but grant the permissions needed to host, display, moderate, and operate the relevant feature. Only submit content you are authorized to share."],
    ["Disclaimers and availability", "Browser games and mirrors are provided on an as-available basis. Features may be suspended for maintenance, safety, legal, or technical reasons. Report broken games so they can be reviewed."],
    ["Termination and contact", "Access may be restricted for serious or repeated abuse. Questions about these terms can be sent to support@duckmath.org."],
  ]} /></StandardPage>;
}

function LegalSections({ sections }: { sections: string[][] }) {
  return <div className="legal-sections">{sections.map(([title, text], index) => <section className="panel" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}</div>;
}

export function TakedownPage() {
  const [form, setForm] = useState({ name: "", email: "", work: "", url: "", statement: "" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    window.location.href = `mailto:support@duckmath.org?subject=${encodeURIComponent("DMCA / content takedown request")}&body=${encodeURIComponent(`Rights holder / agent: ${form.name}\nContact: ${form.email}\nWork: ${form.work}\nContent URL: ${form.url}\n\nRequest and good-faith statement:\n${form.statement}`)}`;
  };
  return (
    <StandardPage className="takedown-page"><PageHeading eyebrow="Rights holders" title="DMCA Takedown" text="Report content that you believe infringes your copyright. Provide enough detail for the team to identify the work and the material at issue." /><div className="takedown-layout"><section className="panel"><Scale /><h2>What to include</h2><ul><li>Your name and reliable contact information.</li><li>Identification of the copyrighted work.</li><li>The exact DuckMath page or game URL.</li><li>A good-faith explanation of the alleged infringement.</li><li>A statement that your notice is accurate and that you are authorized to act.</li></ul><p>Knowingly submitting a false claim can have legal consequences. For ordinary broken-game reports, use the Report button on the game page instead.</p></section><form className="panel stacked-form" onSubmit={submit}><label>Name or authorized agent<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Contact email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Copyrighted work<input required value={form.work} onChange={(event) => setForm({ ...form, work: event.target.value })} /></label><label>Content URL<input required value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://duckmath.org/class/..." /></label><label>Request and statements<textarea required rows={6} value={form.statement} onChange={(event) => setForm({ ...form, statement: event.target.value })} /></label><button className="btn btn-primary"><Mail size={16} /> Compose takedown email</button></form></div></StandardPage>
  );
}

export function IframeCheckPage() {
  const [embedded, setEmbedded] = useState(() => window.self !== window.top);
  const [checkedAt, setCheckedAt] = useState(new Date());
  const check = () => { setEmbedded(window.self !== window.top); setCheckedAt(new Date()); };
  return (
    <StandardPage className="narrow-page"><PageHeading eyebrow="Diagnostics" title="Iframe Check" text="Test whether this DuckMath page is currently running as a top-level tab or inside another document." /><section className="panel iframe-result"><div className={embedded ? "warning" : "success"}>{embedded ? <Info /> : <Check />}</div><h2>{embedded ? "Embedded browsing detected" : "Top-level browsing detected"}</h2><p>{embedded ? "The page is inside an iframe. Some games may restrict storage, input, or fullscreen in this context." : "The page is running directly in its own tab, which provides the best compatibility for most games."}</p><small>Last checked {checkedAt.toLocaleTimeString()}</small><div className="button-row"><button className="btn btn-secondary" onClick={check}>Run check again</button><button className="btn btn-primary" onClick={() => window.open(window.location.href, "_blank", "noopener,noreferrer")}>Open in new tab <ExternalLink size={16} /></button></div></section></StandardPage>
  );
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { notify } = useDuck();
  useEffect(() => {
    const values = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = values.get("access_token");
    if (accessToken) {
      localStorage.setItem("duckmath.auth.session", JSON.stringify({ access_token: accessToken, refresh_token: values.get("refresh_token"), expires_in: values.get("expires_in"), token_type: values.get("token_type") }));
      notify("Authentication completed");
      navigate("/profile", { replace: true });
    }
  }, [navigate, notify]);
  return <StandardPage className="narrow-page"><EmptyState icon={<ShieldCheck />} title="Completing sign in…" text="If nothing happens, return to the sign-in page and try again." action={<Link to="/auth" className="btn btn-primary">Back to sign in</Link>} /></StandardPage>;
}

export function NotFoundPage() {
  return <StandardPage className="not-found-page"><div className="not-found-art"><span>4</span><SmartImage src={`${DUCK_ASSETS}/duck.webp`} alt="Lost duck" /><span>4</span></div><EmptyState icon={<Search />} title="This page waddled away" text="The link may be old, the game may have moved, or the address may be misspelled." action={<div className="button-row"><Link to="/" className="btn btn-primary">Back to all games</Link><Link to="/links" className="btn btn-secondary">Quick links</Link></div>} /></StandardPage>;
}
