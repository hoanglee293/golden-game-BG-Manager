"use client"

import { useLang } from "@/app/lang"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export default function LangSwitcher() {
  const { t, lang, setLang, langConfig } = useLang()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("common.switchLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {langConfig.listLangs.map((langItem) => (
          <DropdownMenuItem
            key={langItem.code}
            onClick={() => setLang(langItem.code)}
            className={`cursor-pointer ${lang === langItem.code ? 'bg-accent' : ''}`}
          >
            <div className="flex items-center gap-2">
              <img
                src={langItem.flag}
                alt={langItem.name}
                className="w-4 h-3 object-cover rounded"
              />
              <span>{langItem.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 