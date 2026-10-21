import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Clock3,
  Coins,
  Download,
  Eye,
  Flame,
  Gamepad2,
  Heart,
  Keyboard,
  LockKeyhole,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  User,
} from "lucide-react";
import {
  EmptyState,
  GameCard,
  PageHeading,
  SmartImage,
  StandardPage,
} from "../components";
import {
  categoryInfo,
  DEFAULT_ICON,
  formatTitle,
  popularCategoryOrder,
  SUPABASE_KEY,
  SUPABASE_URL,
} from "../data";
import { localDay, useDuck } from "../store";

function duration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function ProfilePage() {
  const { username } = useParams();
  const { state, games, level, levelProgress, updateProfile, notify } = useDuck();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(state.profile);
  const normalized = state.profile.username.toLowerCase().replace(/\s+/g, "-");
  const wrongProfile = username && username.toLowerCase() !== normalized && username.toLowerCase() !== state.profile.username.toLowerCase();
  const favorites = games.filter((game) => state.favorites.includes(String(game.id)));
  const recent = state.recentlyPlayed.map((entry) => ({ ...entry, game: games.find((game) => String(game.id) === entry.id) })).filter((entry) => entry.game);

  if (wrongProfile) {
    return <StandardPage><EmptyState icon={<User />} title="Profile not found" text={`No local public profile is available for “${username}”.`} action={<Link className="btn btn-primary" to="/profile">Open your profile</Link>} /></StandardPage>;
  }

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.username.trim()) return;
    updateProfile({ ...form, username: form.username.trim().slice(0, 28), bio: form.bio.trim().slice(0, 240) });
    setEditing(false);
    notify("Profile updated");
  };

  return (
    <StandardPage className="profile-page">
      <section className="profile-hero panel">
        <div className="profile-avatar-wrap"><SmartImage src={state.profile.icon} alt={state.profile.username} eager /><span>LVL {level}</span></div>
        <div className="profile-identity">
          <span className="page-eyebrow">DuckMath player profile</span>
          <h1>{state.profile.username}</h1>
          <p>{state.profile.bio || "No bio yet."}</p>
          <div className="xp-line"><div><span>Level {level}</span><span>{state.xp % 500} / 500 XP</span></div><progress value={levelProgress} max={100} /></div>
        </div>
        <button className="btn btn-secondary" onClick={() => { setForm(state.profile); setEditing(!editing); }}><User size={17} /> {editing ? "Cancel" : "Edit profile"}</button>
      </section>

      {editing && (
        <form className="panel profile-edit-form" onSubmit={save}>
          <div className="avatar-edit"><SmartImage src={form.icon} alt="Avatar preview" /><label className="btn btn-secondary">Upload image<input type="file" accept="image/*" hidden onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 2_000_000) return notify("Choose an image smaller than 2 MB");
            const reader = new FileReader();
            reader.onload = () => setForm((current) => ({ ...current, icon: String(reader.result) }));
            reader.readAsDataURL(file);
          }} /></label></div>
          <label>Display name<input value={form.username} maxLength={28} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></label>
          <label>Bio<textarea value={form.bio} maxLength={240} rows={3} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
          <button className="btn btn-primary" type="submit"><Save size={17} /> Save profile</button>
        </form>
      )}

      <div className="stats-grid">
        <Stat icon={<Coins />} label="Dabloons" value={state.coins.toLocaleString()} />
        <Stat icon={<Flame />} label="Current streak" value={`${state.streak} days`} />
        <Stat icon={<Clock3 />} label="Time played" value={duration(state.playSeconds)} />
        <Stat icon={<Gamepad2 />} label="Games explored" value={String(state.recentlyPlayed.length)} />
      </div>

      <div className="profile-columns">
        <section className="panel">
          <div className="section-heading"><div><span className="page-eyebrow">Your collection</span><h2>Favorite games</h2></div><Heart size={22} /></div>
          {favorites.length ? <ul className="mini-game-grid">{favorites.slice(0, 8).map((game) => <GameCard key={game.id} game={game} />)}</ul> : <EmptyState title="No favorites yet" text="Save a game from its play page and it will appear here." action={<Link to="/" className="text-link">Browse games <ArrowRight size={15} /></Link>} />}
        </section>
        <section className="panel">
          <div className="section-heading"><div><span className="page-eyebrow">Activity</span><h2>Recently played</h2></div><Clock3 size={22} /></div>
          {recent.length ? <div className="recent-list">{recent.slice(0, 8).map((entry) => <Link key={entry.id} to={`/class/${encodeURIComponent(entry.game!.title)}`}><SmartImage src={entry.game!.icon} alt="" /><span><strong>{formatTitle(entry.game!.title)}</strong><small>{new Date(entry.playedAt).toLocaleDateString()}</small></span><ArrowRight size={16} /></Link>)}</div> : <EmptyState title="No activity yet" text="Your recently played games will show up here." />}
        </section>
      </div>
      <section className="panel profile-details">
        <div><span>Member since</span><strong>{new Date(state.profile.joined).toLocaleDateString()}</strong></div>
        <div><span>Best streak</span><strong>{state.bestStreak} days</strong></div>
        <div><span>Items owned</span><strong>{state.owned.length}</strong></div>
        <div><span>Season XP</span><strong>{state.xp} XP</strong></div>
      </section>
    </StandardPage>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="stat-card panel"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong></div>;
}

type AuthMode = "signin" | "signup";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { updateProfile, notify } = useDuck();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint = mode === "signin" ? "/auth/v1/token?grant_type=password" : "/auth/v1/signup";
      const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signin" ? { email, password } : { email, password, data: { username } }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error_description || result.msg || result.message || "Authentication failed");
      if (result.access_token) localStorage.setItem("duckmath.auth.session", JSON.stringify(result));
      const displayName = result.user?.user_metadata?.username || username || email.split("@")[0];
      updateProfile({ username: displayName || "Duck Player" });
      notify(mode === "signin" ? "Signed in successfully" : "Account created. Check your email if confirmation is required.");
      navigate("/profile");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <StandardPage className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro">
          <SmartImage src={DEFAULT_ICON} alt="DuckMath" eager />
          <span className="page-eyebrow">Welcome to the pond</span>
          <h1>Your games, streaks, and rewards in one place.</h1>
          <p>Sign in with your DuckMath account or create one to keep your player identity. You can also continue with a browser-only guest profile.</p>
          <div className="auth-benefits"><span><Flame /> Daily streak rewards</span><span><Trophy /> Score submissions</span><span><Sparkles /> Seasonal cosmetics</span></div>
        </section>
        <section className="panel auth-card">
          <div className="auth-tabs"><button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button><button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button></div>
          <h2>{mode === "signin" ? "Sign in to DuckMath" : "Join DuckMath"}</h2>
          <p>{mode === "signin" ? "Use your email and password." : "Choose a display name and a secure password."}</p>
          <form onSubmit={submit}>
            {mode === "signup" && <label>Display name<input value={username} onChange={(event) => setUsername(event.target.value)} minLength={2} maxLength={28} required placeholder="Your player name" /></label>}
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="At least 6 characters" /></label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="btn btn-primary full-button" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}<ArrowRight size={17} /></button>
          </form>
          {mode === "signin" && <Link to="/change-password" className="auth-forgot">Forgot or need to change your password?</Link>}
          <div className="auth-divider"><span>or</span></div>
          <button className="btn btn-secondary full-button" onClick={() => { updateProfile({ username: username.trim() || "Guest Duck" }); notify("Continuing with a local guest profile"); navigate("/onboarding"); }}>Continue as guest</button>
          <small className="privacy-note"><ShieldCheck size={14} /> Passwords are sent directly to DuckMath’s authentication service and are never stored by this app.</small>
        </section>
      </div>
    </StandardPage>
  );
}

export function ChangePasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const session = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("duckmath.auth.session") || "null"); } catch { return null; }
  }, []);

  const recover = async (event: FormEvent) => {
    event.preventDefault();
    setError(""); setMessage("");
    const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (!response.ok) setError("The recovery email could not be sent. Check the address and try again.");
    else setMessage("If the account exists, a recovery email has been sent.");
  };

  const change = async (event: FormEvent) => {
    event.preventDefault();
    setError(""); setMessage("");
    if (password.length < 6) return setError("Use at least 6 characters.");
    if (password !== confirm) return setError("The passwords do not match.");
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { method: "PUT", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!response.ok) setError("Your session may have expired. Sign in again or use email recovery.");
    else setMessage("Your password has been updated.");
  };

  return (
    <StandardPage className="narrow-page">
      <PageHeading eyebrow="Account security" title={session?.access_token ? "Change password" : "Recover your password"} text={session?.access_token ? "Choose a new password for your DuckMath account." : "Enter your account email and we’ll ask the authentication service to send recovery instructions."} />
      <form className="panel stacked-form" onSubmit={session?.access_token ? change : recover}>
        {!session?.access_token ? <label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label> : <><label>New password<input type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Confirm new password<input type="password" minLength={6} required value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label></>}
        {error && <div className="form-error">{error}</div>}{message && <div className="form-success">{message}</div>}
        <button className="btn btn-primary"><LockKeyhole size={17} /> {session?.access_token ? "Update password" : "Send recovery email"}</button>
      </form>
    </StandardPage>
  );
}

export function StreakPage() {
  const { state, claimStreak } = useDuck();
  const claimedToday = state.lastClaim === localDay();
  const yesterday = localDay(new Date(Date.now() - 86_400_000));
  const nextStreak = state.lastClaim === yesterday ? state.streak + 1 : 1;
  const todayReward = Math.min(100, nextStreak * 10);
  return (
    <StandardPage className="streak-page">
      <PageHeading eyebrow="Daily reward" title="Keep your streak alive" text="Visit each day to claim dabloons and season XP. Missing a day starts your current streak over, but your best streak stays on your profile." />
      <section className="streak-hero panel">
        <div className="streak-flame"><Flame fill="currentColor" /></div>
        <span className="streak-number">{state.streak}</span>
        <h2>day streak</h2>
        <p>{claimedToday ? "Today’s reward is claimed. Come back tomorrow!" : `Claim day ${nextStreak} for ${todayReward} dabloons and 50 XP.`}</p>
        <button className="btn btn-primary" onClick={claimStreak} disabled={claimedToday}>{claimedToday ? <Check size={18} /> : <Flame size={18} />}{claimedToday ? "Claimed today" : "Claim daily streak"}</button>
      </section>
      <div className="week-streak">{Array.from({ length: 7 }, (_, index) => {
        const day = index + 1;
        const complete = day <= Math.min(state.streak, 7);
        const current = !claimedToday && day === Math.min(nextStreak, 7);
        return <div key={day} className={`${complete ? "complete" : ""}${current ? " current" : ""}`}><span>Day {day}</span>{complete ? <Check /> : <Coins />}<strong>{Math.min(100, day * 10)}</strong><small>dabloons</small></div>;
      })}</div>
      <div className="stats-grid three"><Stat icon={<Trophy />} label="Best streak" value={`${state.bestStreak} days`} /><Stat icon={<Coins />} label="Current balance" value={String(state.coins)} /><Stat icon={<Sparkles />} label="Season XP" value={String(state.xp)} /></div>
      <section className="panel streak-rules"><h2>How streaks work</h2><div><p><strong>1. Visit daily.</strong> Your claim resets at midnight on your device.</p><p><strong>2. Build momentum.</strong> Rewards grow by 10 dabloons each day, up to 100.</p><p><strong>3. Earn season XP.</strong> Every daily claim also adds 50 XP to your Medieval Times battlepass.</p></div><Link to="/" className="text-link">Play a game <ArrowRight size={16} /></Link></section>
    </StandardPage>
  );
}

export function SettingsPage() {
  const { state, updateSettings, resetLocalData, notify } = useDuck();
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "duckmath-local-data.json"; anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <StandardPage className="settings-page">
      <PageHeading eyebrow="Preferences" title="Settings" text="Customize the appearance, tab cloak, controls, and local data. Changes save automatically in this browser." />
      <div className="settings-layout">
        <section className="panel settings-section"><div className="settings-section-title"><Palette /><div><h2>Appearance</h2><p>Choose your backdrop and grid density.</p></div></div>
          <div className="theme-options">{(["emerald", "gold", "midnight"] as const).map((theme) => <button key={theme} className={`${theme} ${state.settings.background === theme ? "active" : ""}`} onClick={() => updateSettings({ background: theme })}><span /><strong>{formatTitle(theme)}</strong>{state.settings.background === theme && <Check />}</button>)}</div>
          <Toggle label="Compact game grid" text="Fit more small tiles on wide screens." checked={state.settings.compactGrid} onChange={(checked) => updateSettings({ compactGrid: checked })} />
          <Toggle label="Reduce motion" text="Disable hover and decoration animations." checked={state.settings.reduceMotion} onChange={(checked) => updateSettings({ reduceMotion: checked })} />
          <label>Pointer style<select value={state.settings.cursor} onChange={(event) => updateSettings({ cursor: event.target.value as "default" | "custom" })}><option value="default">System default</option><option value="custom">Equipped DuckMath cursor</option></select></label>
        </section>
        <section className="panel settings-section"><div className="settings-section-title"><Eye /><div><h2>Tab cloak</h2><p>Change this tab’s title and favicon.</p></div></div>
          <div className="cloak-options">{(["duck", "classroom", "quizlet", "drive"] as const).map((cloak) => <button key={cloak} className={state.settings.cloak === cloak ? "active" : ""} onClick={() => updateSettings({ cloak })}>{cloak === "duck" ? "DuckMath" : cloak === "classroom" ? "Google Classroom" : cloak === "drive" ? "Google Drive" : "Quizlet"}{state.settings.cloak === cloak && <Check size={16} />}</button>)}</div>
          <label>Quick-exit URL<input type="url" value={state.settings.panicUrl} onChange={(event) => updateSettings({ panicUrl: event.target.value })} /></label>
          <p className="setting-hint"><Keyboard size={15} /> Press the backtick key (`) at any time to open this URL in the current tab. Follow your local rules.</p>
        </section>
        <section className="panel settings-section"><div className="settings-section-title"><Download /><div><h2>Your local data</h2><p>Export or erase profile and activity data.</p></div></div>
          <div className="settings-data-summary"><span>{state.recentlyPlayed.length} recent games</span><span>{state.favorites.length} favorites</span><span>{state.scores.length} score submissions</span><span>{state.uploads.length} uploaded games</span></div>
          <div className="button-row"><button className="btn btn-secondary" onClick={exportData}><Download size={17} /> Export JSON</button><button className="btn btn-danger" onClick={() => { if (window.confirm("Reset your local profile, activity, inventory, and settings? This cannot be undone.")) resetLocalData(); }}><Trash2 size={17} /> Reset local data</button></div>
        </section>
        <section className="panel settings-section"><div className="settings-section-title"><Settings /><div><h2>Catalog & support</h2><p>Manage your game library and account.</p></div></div>
          <div className="settings-links"><Link to="/upload">Upload a browser game <ArrowRight /></Link><Link to="/auth">Sign in or switch account <ArrowRight /></Link><a href="mailto:support@duckmath.org">Contact DuckMath support <ArrowRight /></a><Link to="/privacy">Privacy policy <ArrowRight /></Link></div>
          <button className="text-link" onClick={() => notify("Settings are saved automatically in this browser")}><ShieldCheck size={15} /> Storage status: active</button>
        </section>
      </div>
    </StandardPage>
  );
}

function Toggle({ label, text, checked, onChange }: { label: string; text: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="toggle-row"><span><strong>{label}</strong><small>{text}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>;
}

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const { state, updateProfile } = useDuck();
  const navigate = useNavigate();
  const finish = () => {
    if (name.trim()) updateProfile({ username: name.trim() });
    localStorage.setItem("duckmath.onboarded", "true");
    localStorage.setItem("duckmath.favorite.categories", JSON.stringify(selected));
    navigate(selected[0] ? `/${selected[0]}` : "/");
  };
  return (
    <StandardPage className="onboarding-page narrow-page">
      <div className="onboarding-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      {step === 0 && <section className="panel onboarding-card"><SmartImage src={DEFAULT_ICON} alt="DuckMath" /><span className="page-eyebrow">Welcome to DuckMath</span><h1>Let’s set up your pond.</h1><p>Pick a player name and a few game categories. You can change everything later.</p><button className="btn btn-primary" onClick={() => setStep(1)}>Get started <ArrowRight /></button></section>}
      {step === 1 && <section className="panel onboarding-card"><span className="page-eyebrow">Step 1 of 2</span><h1>What should we call you?</h1><label>Display name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder={state.profile.username} maxLength={28} /></label><div className="button-row"><button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button><button className="btn btn-primary" onClick={() => setStep(2)}>Continue <ArrowRight /></button></div></section>}
      {step === 2 && <section className="panel onboarding-card"><span className="page-eyebrow">Step 2 of 2</span><h1>What do you like to play?</h1><p>Choose as many categories as you like.</p><div className="onboarding-categories">{popularCategoryOrder.map((item) => <button key={item} className={selected.includes(item) ? "active" : ""} onClick={() => setSelected((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}>{categoryInfo[item].label}{selected.includes(item) && <Check />}</button>)}</div><div className="button-row"><button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button><button className="btn btn-primary" onClick={finish}>Start playing <ArrowRight /></button></div></section>}
    </StandardPage>
  );
}
