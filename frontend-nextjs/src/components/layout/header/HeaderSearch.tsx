"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { MagnifyingGlass, X } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/utils"

export const HeaderSearch = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    // Implement search navigation logic here
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      {!isOpen && (
        <button
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
          onClick={() => setIsOpen(true)}
          aria-label={t('header.search')}
        >
          <MagnifyingGlass size={24} />
        </button>
      )}

      <div
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 ease-in-out bg-white dark:bg-gray-800",
          isOpen ? "w-[300px] opacity-100 visible z-50" : "w-0 opacity-0 invisible -z-10"
        )}
      >
        <form onSubmit={handleSearch} className="relative w-full flex items-center">
          <MagnifyingGlass size={18} className="absolute left-3 text-gray-400" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={t('header.searchPlaceholder')}
            className="pl-9 pr-8 h-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 h-10 w-8 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setIsOpen(false)
              setSearchQuery("")
            }}
          >
            <X size={16} />
          </Button>
        </form>
      </div>
    </div>
  )
}
