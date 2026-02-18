// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - DDA design system types may not be fully available
import { DdaStickyFooter } from "@dubai-design-system/components-react";
import { ThemeToggle } from "@/components/layout/header/ThemeToggle";
import icon04 from "@/assets/icons/04.svg";
import iconAI from "@/assets/icons/icon-ai.svg";
import iconChat from "@/assets/icons/chat-text.svg";
import iconGrid from "@/assets/icons/squares-four.svg";
import iconHappiness from "@/assets/icons/happy.svg";

const EMPTY_JSON_ARRAY = "[]";

const StickyFooter = () => {
  const rightLinks = JSON.stringify([
    {
      RightLinkTooltip: "Locations",
      href: "#",
      title: "Locations",
      itemId: "locationsID",
      ariaLabel: "See our locations",
      LinkText: "Locations",
      IconFamily: "material-icons",
      IconName: "location_on",
    },
    {
      RightLinkTooltip: "Media Center",
      href: "#",
      title: "Media Center",
      itemId: "mediaCenterID",
      ariaLabel: "Go to Media Center",
      LinkText: "Media Center",
      IconFamily: "material-icons",
      IconName: "feed",
    },
    {
      RightLinkTooltip: "Contact Us",
      href: "#",
      title: "Contact Us",
      itemId: "contactUsID",
      ariaLabel: "Get In Touch / Contact Us",
      LinkText: "Contact Us",
      IconFamily: "material-icons",
      IconName: "mail",
    },
  ]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 pointer-events-none *:pointer-events-auto">
      {/* Theme toggle on the left of the footer bar so it doesn't overlap DDA icons */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <ThemeToggle />
      </div>
      {/* DDA sticky footer fills the bar; content remains clickable */}
      <div className="absolute inset-0">
        <DdaStickyFooter
          happiness-icon-href="#"
          happiness-icon-id="Happiness"
          happiness-icon-src={iconHappiness ?? ""}
          happiness-icon-alt="Happiness Meter"
          happiness-icon-tooltip="Happiness Meter"
          happiness-icon-click=""
          accessibility-icon-href="#"
          accessibility-icon-id="voiceOfCustomer"
          accessibility-icon-src={icon04 ?? ""}
          accessibility-icon-alt="The Unified interactive platform - 04"
          accessibility-icon-tooltip="Voice of Customer - 04"
          accessibility-icon-click=""
          services-icon-href="#"
          services-icon-id="footerServices"
          services-icon-src={iconGrid ?? ""}
          services-icon-alt="Services"
          services-icon-tooltip="Services"
          services-icon-text="Services"
          services-icon-click=""
          hide-middle-section="true"
          middle-link={EMPTY_JSON_ARRAY}
          right-link={rightLinks}
          dubaiae-icon-href="#"
          dubaiae-icon-id="dubaiAEID"
          dubaiae-icon-src=""
          dubaiae-icon-small-src=""
          dubaiae-icon-alt="dubai.ae"
          dubaiae-icon-tooltip="dubai.ae"
          dubaiae-icon-on-click=""
          ai-icon-href="#"
          ai-icon-id="aiIconID"
          ai-icon-src={iconAI ?? ""}
          ai-icon-alt="Digital AI"
          ai-icon-tooltip="Digital AI"
          ai-icon-on-click=""
          chat-icon-href="#"
          chat-icon-id="chatID"
          chat-icon-src={iconChat ?? ""}
          chat-icon-alt="Online Chat"
          chat-icon-tooltip="Online Chat"
          chat-icon-on-click=""
          more-icon-family="material-icons"
          more-icon="more_horiz"
        />
      </div>
    </div>
  );
};

export default StickyFooter;
