"use client"

import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/app/lang"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Wallet, Settings } from "lucide-react"
import { toast } from "sonner"
import LangSwitcher from "./lang-switcher"

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth()
  const { t } = useLang()

  const handleLogout = () => {
    logout()
    toast.success(t("auth.logoutSuccess"))
  }
  console.log("user", user)

  const formatWalletAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  if (!isAuthenticated) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-full h-auto max-w-[200px] rounded-lg flex items-center justify-center">
                <img src="/bitworld-logo-light.png" alt="logo" className="w-full h-auto" />
              </div>
            </div>
            <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 h-14 flex items-center justify-between">
      <div className="px-4 py-2  w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-full h-auto max-w-[200px] rounded-lg flex items-center justify-center">
              <img src="/bitworld-logo-light.png" alt="logo" className="w-full h-auto" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LangSwitcher />
            
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>{t("auth.solana")}: {formatWalletAddress(user.solanaAddress)}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.nickName ? user.nickName.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.nickName || t("auth.user")} &ensp; {user.isBgAffiliate && <Badge variant="outline" className="text-xs">{t("auth.bgAffiliateBadge")}</Badge>}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.telegramId ? `${t("auth.telegramId")}: ${user.telegramId}` : formatWalletAddress(user.solanaAddress)}
                        </p>
                        {user.email && (
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                        
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                   
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("auth.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/login'}>
                  {t("auth.login")}
                </Button>
                <Button size="sm" onClick={() => window.location.href = '/login'}>
                  {t("auth.connectWallet")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 