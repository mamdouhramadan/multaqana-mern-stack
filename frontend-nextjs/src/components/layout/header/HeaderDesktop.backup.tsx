import { siteConfig } from "../../../config/site";
import { HeaderSearch } from "./HeaderSearch";
import { ThemeToggle } from "@/components/layout/header/ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTheme } from "@/providers/ThemeProvider";
import { useSettings } from "@/providers/SettingsProvider";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
function logoUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  return base ? `${base}${path.startsWith("/") ? "" : "/"}${path}` : path;
}

const HeaderDesktop = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { getString } = useSettings();
  const siteLogo = getString("site_logo");
  const logoSrc = siteLogo
    ? logoUrl(siteLogo)
    : isDark
      ? siteConfig.logos.white
      : siteConfig.logos.dark;

  return (
    <div className="header-desktop hidden lg:block z-40 relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
      <div className="header-top">
        <div className="container">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="header-logo logos flex items-center gap-4">
              <div className="logo-item">
                <a href="/" className="logo block">
                  <img
                    src={logoSrc}
                    alt="logo"
                    className="h-16"
                  />
                  <span className="sr-only">Logo</span>
                </a>
              </div>
            </div>

            <div className="header-top-right flex items-center gap-2">
              <HeaderSearch />
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderDesktop;
