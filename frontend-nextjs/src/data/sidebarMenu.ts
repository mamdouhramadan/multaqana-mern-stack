import {
  List,
  SquaresFour,
  MagnifyingGlass,
  CalendarBlank,
  Stack,

  Translate,
  Question,
  FolderOpen,
  Phone,
  ShareNetwork,
  BookOpen,
  Video,
  Image,
  Users,
} from "@phosphor-icons/react";

export type SidebarItemType = "action" | "link" | "modal";

export interface SidebarItem {
  id: string;
  labelKey: string;
  icon: any; // Using any for Phosphor icon component type convenience
  type: SidebarItemType;
  href?: string;
  modalId?: string;
  action?: string;
}

export const SIDEBAR_MENU: SidebarItem[] = [
  {
    id: "menu",
    labelKey: "sidebar.mainMenu",
    icon: List,
    type: "modal",
    modalId: "main-menu",
  },
  {
    id: "featured-apps",
    labelKey: "sidebar.featuredApps",
    icon: SquaresFour,
    type: "modal",
    modalId: "featured-apps",
  },
  {
    id: "search",
    labelKey: "sidebar.search",
    icon: MagnifyingGlass,
    type: "link",
    href: "/search",
  },
  {
    id: "magazines",
    labelKey: "sidebar.magazines",
    icon: BookOpen,
    type: "link",
    href: "/magazines",
  },
  {
    id: "videos",
    labelKey: "sidebar.videos",
    icon: Video,
    type: "link",
    href: "/videos",
  },
  {
    id: "photos",
    labelKey: "sidebar.photos",
    icon: Image,
    type: "link",
    href: "/photos",
  },
  {
    id: "employees",
    labelKey: "sidebar.employees",
    icon: Users,
    type: "link",
    href: "/employees",
  },
  {
    id: "events",
    labelKey: "sidebar.eventsCalendar",
    icon: CalendarBlank,
    type: "modal",
    modalId: "events-calendar",
  },
  {
    id: "applications",
    labelKey: "sidebar.applications",
    icon: Stack,
    type: "link",
    href: "/applications",
  },
  {
    id: "language",
    labelKey: "sidebar.language",
    icon: Translate,
    type: "action",
    action: "switchLanguage",
  },
  {
    id: "faqs",
    labelKey: "sidebar.faqs",
    icon: Question,
    type: "link",
    href: "/faqs",
  },
  {
    id: "files",
    labelKey: "sidebar.importantFiles",
    icon: FolderOpen,
    type: "link",
    href: "/files",
  },
  {
    id: "contact",
    labelKey: "sidebar.contactUs",
    icon: Phone,
    type: "modal",
    modalId: "contact-us",
  },
  {
    id: "social",
    labelKey: "sidebar.followUs",
    icon: ShareNetwork,
    type: "modal",
    modalId: "social-media",
  },
];
