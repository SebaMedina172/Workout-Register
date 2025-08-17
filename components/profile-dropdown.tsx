"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, ChevronDown } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import SignOutButton from "@/components/sign-out-button"

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-full">
          <User className="h-4 w-4 text-white" />
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* Language and Theme Row */}
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <div className="flex-1">
                <LanguageSwitcher mobile={true} />
              </div>
              <div className="flex-1">
                <ThemeToggle mobile={true} />
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="px-3 py-2">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  )
}
