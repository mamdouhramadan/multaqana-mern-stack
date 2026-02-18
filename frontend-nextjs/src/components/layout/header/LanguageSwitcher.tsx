"use client"

import { Globe } from "@phosphor-icons/react"
import { useTranslation } from 'react-i18next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation()

  const currentLang = i18n.resolvedLanguage || i18n.language || 'en'

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(newLang)
  }

  const nextLanguage = currentLang === 'en' ? t('language.arabic') : t('language.english')

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-gray-800 dark:hover:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            onClick={toggleLanguage}
            aria-label={t('language.switchTo')}
          >
            <Globe size={24} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('language.switchTo')} ({nextLanguage})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
