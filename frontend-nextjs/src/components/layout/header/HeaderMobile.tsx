import { MediumLogoIcon } from "@phosphor-icons/react";
import { siteConfig } from "../../../config/site";
import { useSettings } from "@/providers/SettingsProvider";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
function logoUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  return base ? `${base}${path.startsWith("/") ? "" : "/"}${path}` : path;
}

const HeaderMobile = () => {
  const { getString } = useSettings();
  const siteLogo = getString("site_logo");
  const logoSrc = siteLogo ? logoUrl(siteLogo) : siteConfig.logos.dark;

  return (
    <div className="header-mobile lg:hidden bg-white z-40 relative">
      {/* Top Bar */}
      <div className="header-top py-3 border-b border-gray-100">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="header-logo logos flex items-center gap-3">
              <div className="logo-item">
                <a href="/" className="logo block"> <img src={logoSrc} alt="logo" className="h-12" /> <span className="sr-only">Logo</span> </a>
              </div>
            </div>
            <div className="header-top-right">
              <div>
                <div className="flex items-center gap-3">
                  <button className="hamburger-icon text-gray-700 hover:text-primary-600">
                    <MediumLogoIcon />
                    <span className="sr-only">Toggle main menu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderMobile;
