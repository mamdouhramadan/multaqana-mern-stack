import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
      {t('footer.copyright', { year: new Date().getFullYear() })}
    </footer>
  );
};

export default Footer;
