import logoDark from '../assets/logos/logo-dark.png';
import logoWhite from '../assets/logos/logo-white.png';
import imagePlaceholder from '../assets/image-placeholder.jpg';
import { FacebookLogo, TwitterLogo, YoutubeLogo, InstagramLogo, LinkedinLogo } from "@phosphor-icons/react";

export const siteConfig = {
  name: "Multaqana",
  siteUrl: "https://multaqana.mohesr.gov.ae",
  description: "Multaqana Application",
  /** Fallback image for missing or failed magazine/news/file thumbnails */
  images: {
    placeholder: imagePlaceholder,
  },
  logos: {
    dark: logoDark,
    white: logoWhite,
  },
  socialMedia: [
    {
      id: 'facebook',
      label: 'Facebook',
      url: '#',
      icon: FacebookLogo,
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      url: '#',
      icon: TwitterLogo,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      url: '#',
      icon: InstagramLogo,
    },
    {
      id: 'youtube',
      label: 'YouTube',
      url: '#',
      icon: YoutubeLogo,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: '#',
      icon: LinkedinLogo,
    }
  ]
};
