"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getCommissionHistoryWithFallback } from "@/lib/api"
import { CommissionEntry } from "@/lib/types"
import { format } from "date-fns"
import { Loader2, Wallet, Calendar, DollarSign, Hash, TrendingUp, Sparkles, Receipt, Clock, Target, BarChart3, Copy, Activity } from "lucide-react"
import { useLang } from "@/app/lang"
import { useResponsive } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export default function CommissionHistory() {
  const [history, setHistory] = useState<CommissionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, lang } = useLang()
  const { isMobile, isTablet } = useResponsive()

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getCommissionHistoryWithFallback()
        setHistory(data)
      } catch (err) {
        setError(t("errors.networkError"))
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // Get date format based on current language
  const getDateFormat = () => {
    switch (lang) {
      case 'vi':
        return 'dd/MM/yyyy'
      case 'kr':
        return 'yyyy/MM/dd'
      case 'jp':
        return 'yyyy/MM/dd'
      default:
        return 'MM/dd/yyyy'
    }
  }

  // Format wallet address for display
  const formatWalletAddress = (wallet: string) => {
    if (wallet.length <= 8) return wallet
    return `${wallet.substring(0, 4)}...${wallet.substring(wallet.length - 4)}`
  }

  // Format commission amount
  const formatAmount = (amount: string) => {
    const num = Number.parseFloat(amount)
    return `$${num.toFixed(6)}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <Sparkles className="h-4 w-4 animate-pulse text-yellow-400 absolute -top-1 -right-1" />
          </div>
          <span className="sr-only">{t("common.loading")}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{t("errors.networkError")}</div>
  }

  // Mobile Card Layout
  if (isMobile || isTablet) {
    return (
      <Card className="border-none rounded-none h-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">{t("commission.history")}</CardTitle>
              <CardDescription className="text-sm sm:text-base">{t("commission.historyDescription")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 mx-4 rounded-lg pb-0 animate-in slide-in-from-bottom-2 duration-500" style={{ boxShadow: "0px 3px 10px 9px #1f1f1f14" }}>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center animate-pulse">
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-muted-foreground">{t("commission.noHistory")}</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {history.map((entry, index) => (
                <Card 
                  key={entry.bittworldUid} 
                  className="border border-border/50 hover:border-green-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group animate-in slide-in-from-bottom-2 "
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded">
                          <Hash className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-blue-600 transition-colors">#{entry.bacr_order_id}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none flex items-center gap-1">
                        <Target className="h-2 w-2" />
                        {t("auth.level")} {entry.bacr_level}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Wallet Address */}
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded transition-all duration-200 hover:scale-105">
                        <Wallet className="w-4 h-4 text-yellow-500 group-hover:animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-2 w-2" />
                            {t("commission.receivingWallet")}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-yellow-500 font-semibold truncate">
                              {formatWalletAddress(entry.bacr_wallet)}
                            </p>
                            <button 
                              onClick={() => navigator.clipboard.writeText(entry.bacr_wallet)}
                              className="p-1 hover:bg-yellow-100 rounded transition-all duration-200 hover:scale-110"
                            >
                              <Copy className="h-3 w-3 text-yellow-500" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Commission Amount */}
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded transition-all duration-200 hover:scale-105">
                        <DollarSign className="w-4 h-4 text-green-500 group-hover:animate-bounce" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Activity className="h-2 w-2" />
                            {t("commission.amount")}
                          </p>
                          <p className="text-lg font-bold text-green-500 group-hover:text-green-600 transition-colors">
                            {formatAmount(entry.bacr_commission_amount)}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded transition-all duration-200 hover:scale-105">
                        <Calendar className="w-4 h-4 text-blue-500 group-hover:animate-pulse" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2 w-2" />
                            {t("commission.date")}
                          </p>
                          <p className="text-sm group-hover:text-blue-600 transition-colors">
                            {format(new Date(entry.bacr_created_at), getDateFormat() + " HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Desktop Table Layout
  return (
    <Card className="border-none rounded-none h-full px-4">
      <CardHeader className="px-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">{t("commission.history")}</CardTitle>
            <CardDescription className="text-sm sm:text-base">{t("commission.historyDescription")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="m-0 p-0 rounded-lg pb-0 animate-in slide-in-from-bottom-2 duration-500 delay-200" style={{ boxShadow: "0px 3px 10px 9px #1f1f1f14" }}>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center animate-pulse">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-muted-foreground">{t("commission.noHistory")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="relative">
              <Table className="w-full relative">
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow className="bg-gradient-to-r from-green-500/50 to-emerald-600/50">
                    <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2 rounded-tl-xl">
                      <div className="inline-flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        BITWORLD UID
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">
                      <div className="inline-flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        {t("commission.orderId")}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">
                      <div className="inline-flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        {t("commission.receivingWallet")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">
                      <div className="inline-flex items-center justify-end gap-1">
                        <DollarSign className="h-3 w-3" />
                        {t("commission.amount")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Target className="h-3 w-3" />
                        {t("auth.level")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2 rounded-tr-xl">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3" />
                        {t("commission.date")}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="max-h-[80vh] overflow-y-auto">
                  {history.map((entry, index) => (
                    <TableRow 
                      key={entry.bittworldUid} 
                      className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 animate-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="font-mono text-sm px-1 sm:px-3 py-2">
                        <div className="inline-flex items-center gap-1">
                          <Hash className="h-3 w-3 text-blue-500" />
                          {entry?.bittworldUid ?? entry.bacr_id}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm px-1 sm:px-3 py-2 hover:text-blue-600 transition-colors">
                        <div className="inline-flex items-center gap-1">
                          <Receipt className="h-3 w-3 text-purple-500" />
                          #{entry.bacr_order_id}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-yellow-500 font-semibold px-1 sm:px-3 py-2">
                        <div className="inline-flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          <span>{formatWalletAddress(entry.bacr_wallet)}</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(entry.bacr_wallet)}
                            className="p-1 hover:bg-yellow-100 rounded transition-all duration-200 hover:scale-110"
                          >
                            <Copy className="h-2 w-2" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right sticky right-0 bg-background font-bold text-green-500 px-1 sm:px-3 py-2">
                        <div className="inline-flex items-center justify-end gap-1">
                          {formatAmount(entry.bacr_commission_amount)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-1 sm:px-3 py-2">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none">
                            <Target className="h-2 w-2 mr-1" />
                            {entry.bacr_level}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm px-1 sm:px-3 py-2">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          {format(new Date(entry.bacr_created_at), getDateFormat() + " HH:mm")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
