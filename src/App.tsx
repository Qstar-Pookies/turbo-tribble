import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Footer, ScrollToTop } from "./components";
import { DuckProvider } from "./store";
import { CategoryPage, FavoritesPage, HomePage } from "./pages/Home";
import { GameFullscreenPage, GamePage } from "./pages/Game";
import {
  AuthPage,
  ChangePasswordPage,
  OnboardingPage,
  ProfilePage,
  SettingsPage,
  StreakPage,
} from "./pages/AccountPages";
import {
  ChatPage,
  LeaderboardPage,
  ScrollFeedPage,
  ShopPage,
  UploadPage,
} from "./pages/CommunityPages";
import {
  AboutPage,
  AdvertisePage,
  AppsPage,
  AuthCallbackPage,
  BlogPage,
  DownloadPage,
  DownloadSvgPage,
  IframeCheckPage,
  LinksPage,
  NotFoundPage,
  PrivacyPage,
  TakedownPage,
  TermsPage,
  UGCPage,
} from "./pages/InfoPages";

export default function App() {
  return (
    <DuckProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/class2" element={<HomePage />} />
          <Route path="/class3" element={<HomePage />} />
          <Route path="/class/:title" element={<GamePage />} />
          <Route path="/class2/:title" element={<GameFullscreenPage />} />
          <Route path="/class3/:title" element={<GameFullscreenPage minimal />} />
          <Route path="/class2/category/:category" element={<CategoryPage />} />
          <Route path="/class3/category/:category" element={<CategoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/streak" element={<StreakPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/cache" element={<ShopPage />} />
          <Route path="/scroll-feed" element={<ScrollFeedPage />} />
          <Route path="/chad" element={<ChatPage />} />
          <Route path="/join-chad.html" element={<ChatPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/more/apps" element={<AppsPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/cloud" element={<LinksPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/ugc" element={<UGCPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/download-svg" element={<DownloadSvgPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/takedown" element={<TakedownPage />} />
          <Route path="/iframeCheck" element={<IframeCheckPage />} />
          <Route path="/:category" element={<CategoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </DuckProvider>
  );
}
