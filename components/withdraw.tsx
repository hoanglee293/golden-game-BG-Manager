"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getAvailableWithdrawalWithFallback,
  getWithdrawHistoryWithFallback,
  createWithdrawRequestWithFallback,
  retryWithdrawRequestWithFallback
} from "@/lib/api"
import {
  Loader2,
  Search,
  CalendarIcon,
  DollarSign,
  TrendingUp,
  Activity,
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  Clock,
  UserPlus,
  Wallet,
  Coins,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { format } from "date-fns"
import { truncateString } from "@/lib/utils"
import { useLang } from "@/app/lang"
import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-mobile"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface WalletInfo {
  solanaAddress: string
  nickName: string
  ethAddress: string
}

interface AvailableWithdrawalData {
  totalUSD: number
  totalSOL: number
  breakdown: {
    walletRefRewardsUSD: number
    walletRefRewardsCount: number
    bgAffiliateRewardsUSD: number
    bgAffiliateRewardsCount: number
  }
}

interface WithdrawHistoryItem {
  rwh_id: number
  rwh_wallet_id: number
  rwh_amount: string
  rwh_hash: string | null
  rwh_status: 'pending' | 'success' | 'failed' | 'retry'
  rwh_date: string
  rwh_created_at: string
  rwh_updated_at: string
}

interface WithdrawHistoryData {
  success: boolean
  message: string
  data: WithdrawHistoryItem[]
}

export default function Withdraw() {
  const [availableWithdrawal, setAvailableWithdrawal] = useState<AvailableWithdrawalData | null>(null)
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [retryingIds, setRetryingIds] = useState<Set<number>>(new Set())
  const [isPolling, setIsPolling] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Set<number>>(new Set())
  const [isWithdrawConfirmationOpen, setIsWithdrawConfirmationOpen] = useState(false)
  const { t, lang } = useLang()
  const { isMobile, isTablet, isDesktop } = useResponsive()

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [availableData, historyData] = await Promise.all([
        getAvailableWithdrawalWithFallback(),
        getWithdrawHistoryWithFallback()
      ])

      // Safe access with validation
      const available = availableData.data || availableData
      const history = historyData.data || historyData

      // Validate available withdrawal data
      if (available && typeof available === 'object') {
        setAvailableWithdrawal({
          totalUSD: Number(available.totalUSD) || 0,
          totalSOL: Number(available.totalSOL) || 0,
          breakdown: {
            walletRefRewardsUSD: Number(available.breakdown?.walletRefRewardsUSD) || 0,
            walletRefRewardsCount: Number(available.breakdown?.walletRefRewardsCount) || 0,
            bgAffiliateRewardsUSD: Number(available.breakdown?.bgAffiliateRewardsUSD) || 0,
            bgAffiliateRewardsCount: Number(available.breakdown?.bgAffiliateRewardsCount) || 0
          }
        })
      } else {
        // Set default values if no data
        setAvailableWithdrawal({
          totalUSD: 0,
          totalSOL: 0,
          breakdown: {
            walletRefRewardsUSD: 0,
            walletRefRewardsCount: 0,
            bgAffiliateRewardsUSD: 0,
            bgAffiliateRewardsCount: 0
          }
        })
      }

      // Validate history data
      if (Array.isArray(history)) {
        setWithdrawHistory(history.map(item => ({
          rwh_id: item.rwh_id || 0,
          rwh_wallet_id: item.rwh_wallet_id || 0,
          rwh_amount: item.rwh_amount || "0",
          rwh_hash: item.rwh_hash || null,
          rwh_status: item.rwh_status || 'pending',
          rwh_date: item.rwh_date || new Date().toISOString(),
          rwh_created_at: item.rwh_created_at || new Date().toISOString(),
          rwh_updated_at: item.rwh_updated_at || new Date().toISOString()
        })))
      } else {
        setWithdrawHistory([])
      }
    } catch (err) {
      setError(t("errors.networkError"))
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Separate function to fetch only withdraw history for polling
  const fetchWithdrawHistory = async () => {
    setIsPolling(true)
    try {
      const historyData = await getWithdrawHistoryWithFallback()
      const history = historyData.data || historyData

      if (Array.isArray(history)) {
        setWithdrawHistory(history.map(item => ({
          rwh_id: item.rwh_id || 0,
          rwh_wallet_id: item.rwh_wallet_id || 0,
          rwh_amount: item.rwh_amount || "0",
          rwh_hash: item.rwh_hash || null,
          rwh_status: item.rwh_status || 'pending',
          rwh_date: item.rwh_date || new Date().toISOString(),
          rwh_created_at: item.rwh_created_at || new Date().toISOString(),
          rwh_updated_at: item.rwh_updated_at || new Date().toISOString()
        })))
        setLastUpdate(new Date())
      }
    } catch (err) {
      console.error('Polling error:', err)
      // Don't show error for polling, just log it
    } finally {
      setIsPolling(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Polling effect for withdraw history - 1 minute 3 seconds (63 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWithdrawHistory()
    }, 63000) // 63 seconds = 1 minute 3 seconds

    return () => clearInterval(interval)
  }, [])

  // Effect to update relative time every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update relative time
      setLastUpdate(prev => new Date(prev.getTime()))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleWithdrawClick = () => {
    if (!availableWithdrawal || (availableWithdrawal.totalUSD || 0) <= 0) {
      setError(t("withdraw.noAmountToWithdraw"))
      return
    }
    setIsWithdrawConfirmationOpen(true)
  }

  const handleWithdrawConfirm = async () => {
    setIsWithdrawing(true)
    setError(null)
    setSuccessMessage(null)
    setIsWithdrawConfirmationOpen(false)

    try {
      const response = await createWithdrawRequestWithFallback()

      if (response.success) {
        setSuccessMessage(t("withdraw.withdrawalRequestSuccess"))
        // Refresh data after successful withdrawal
        setTimeout(() => {
          fetchData()
        }, 1000)
      } else {
        setError(response.message || t("withdraw.withdrawalRequestError"))
      }
    } catch (err) {
      setError(t("withdraw.withdrawalRequestError"))
      console.error(err)
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleWithdrawCancel = () => {
    setIsWithdrawConfirmationOpen(false)
  }

  const handleRetry = async (withdrawId: number) => {
    setRetryingIds(prev => new Set(prev).add(withdrawId))
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await retryWithdrawRequestWithFallback(withdrawId)

      if (response.success) {
        setSuccessMessage(t("withdraw.retrySuccess"))
        // Refresh data after successful retry
        setTimeout(() => {
          fetchData()
        }, 1000)
      } else {
        setError(t("withdraw.retryError"))
      }
    } catch (err) {
      setError(t("withdraw.retryError"))
      console.error(err)
    } finally {
      setRetryingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(withdrawId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 transition-all duration-300 hover:scale-105 group">
            <Clock className="w-3 h-3 mr-1 group-hover:animate-spin" />
            {t("withdraw.pending")}
          </Badge>
        )
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 transition-all duration-300 hover:scale-105 group">
            <CheckCircle className="w-3 h-3 mr-1 group-hover:animate-pulse" />
            {t("withdraw.success")}
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 transition-all duration-300 hover:scale-105 group">
            <XCircle className="w-3 h-3 mr-1 group-hover:animate-bounce" />
            {t("withdraw.failed")}
          </Badge>
        )
      case 'retry':
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 transition-all duration-300 hover:scale-105 group">
            <Sparkles className="w-3 h-3 mr-1 group-hover:animate-pulse" />
            {t("withdraw.retryStatus")}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="transition-all duration-300 hover:scale-105">
            {status}
          </Badge>
        )
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleHistoryItem = (itemId: number) => {
    setExpandedHistoryItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Helper function to format small amounts
  const formatAmount = (amount: number) => {
    if (amount < 0.01 && amount > 0) {
      return amount.toFixed(6) // Show more decimals for very small amounts
    }
    return amount.toFixed(2)
  }

  // Helper function to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds}${t("withdraw.seconds")} ${t("withdraw.ago")}`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}${t("withdraw.minutes")} ${t("withdraw.ago")}`
    } else {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}${t("withdraw.hours")} ${t("withdraw.ago")}`
    }
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
    return (
      <Card className="!border-none rounded-none">
        <CardHeader className="px-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">{t("withdraw.error")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="!border-none rounded-none">
      <CardHeader className="px-3 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg group">
              <BarChart3 className="h-6 w-6 text-white group-hover:animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl group-hover:text-blue-800 transition-colors">{t("withdraw.title")}</CardTitle>
              <CardDescription className="group-hover:text-blue-600 transition-colors hidden sm:block">{t("withdraw.description")}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {isPolling ? (
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                ) : (
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                )}
                <span className="hidden sm:inline">{t("withdraw.autoRefresh")}</span>
                <span className="sm:hidden">{t("withdraw.auto")}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs">{t("withdraw.lastUpdate")}: {formatRelativeTime(lastUpdate)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="transition-all duration-300 hover:scale-105 hover:shadow-md w-full sm:w-auto"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">{t("withdraw.refresh")}</span>
              <span className="sm:hidden">{t("withdraw.refresh")}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 px-3 sm:px-6">
        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md group">
            <CheckCircle className="h-4 w-4 text-green-600 group-hover:animate-pulse flex-shrink-0" />
            <AlertDescription className="text-green-800 group-hover:text-green-900 transition-colors text-sm sm:text-base">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Available Withdrawal Section */}
        {availableWithdrawal && (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-blue-600 truncate">{t("withdraw.totalAvailable")}</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-900 group-hover:text-blue-800 transition-colors truncate">${formatAmount(availableWithdrawal.totalUSD || 0)} USD</p>
                    <p className="text-xs sm:text-sm text-blue-700 truncate">{formatAmount(availableWithdrawal.totalSOL || 0)} SOL</p>
                  </div>
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 group-hover:animate-pulse flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-green-600 truncate">{t("withdraw.bgAffiliateRewards")}</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-900 group-hover:text-green-800 transition-colors truncate">${formatAmount(availableWithdrawal.breakdown?.bgAffiliateRewardsUSD || 0)}</p>
                    <p className="text-xs sm:text-sm text-green-700 truncate">{availableWithdrawal.breakdown?.bgAffiliateRewardsCount || 0} {t("stats.transactions")}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 group-hover:animate-pulse flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-purple-600 truncate">{t("withdraw.traditionalReferral")}</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-900 group-hover:text-purple-800 transition-colors truncate">${formatAmount(availableWithdrawal.breakdown?.walletRefRewardsUSD || 0)}</p>
                    <p className="text-xs sm:text-sm text-purple-700 truncate">{availableWithdrawal.breakdown?.walletRefRewardsCount || 0} {t("stats.transactions")}</p>
                  </div>
                  <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 group-hover:animate-pulse flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-orange-600 truncate">{t("withdraw.totalWithdrawalHistory")}</p>

                    <p className="text-lg sm:text-2xl font-bold text-orange-900 group-hover:text-orange-800 transition-colors truncate">
                      {(withdrawHistory.length || 0)}
                    </p>
                  </div>
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 group-hover:animate-pulse flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdraw Action */}
        {availableWithdrawal && (
          <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 group-hover:text-blue-800 transition-colors">{t("withdraw.readyToWithdraw")}</h3>
                  <div className="flex gap-2">
                    <p className="text-xs sm:text-sm text-blue-700 group-hover:text-blue-600 transition-colors">
                      {t("withdraw.youCanWithdraw", { amount: `$${formatAmount(availableWithdrawal.totalUSD || 0)}`, solAmount: formatAmount(availableWithdrawal.totalSOL || 0) })}
                    </p>
                    <span className="text-xs sm:text-sm text-red-500 group-hover:text-red-600 transition-colors">({t("withdraw.minimumAmount")})</span>
                  </div>
                </div>
                <Button
                  onClick={handleWithdrawClick}
                  disabled={isWithdrawing || (availableWithdrawal && (availableWithdrawal.totalUSD || 0) < 10)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">{t("withdraw.processing")}</span>
                      <span className="sm:hidden">{t("withdraw.processing")}</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                      <span className="hidden sm:inline">{t("withdraw.withdrawNow")}</span>
                      <span className="sm:hidden">{t("withdraw.withdrawNow")}</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Withdrawal History */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              {t("withdraw.withdrawalHistory")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawHistory.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-500/50 to-purple-600/50">
                        <TableHead className="font-semibold text-gray-950">ID</TableHead>
                        <TableHead className="font-semibold text-gray-950">{t("withdraw.amount")}</TableHead>
                        <TableHead className="font-semibold text-gray-950">{t("withdraw.status")}</TableHead>
                        <TableHead className="font-semibold text-gray-950">{t("withdraw.createdDate")}</TableHead>
                        <TableHead className="font-semibold text-gray-950">{t("withdraw.updatedDate")}</TableHead>
                        <TableHead className="font-semibold text-gray-950">{t("withdraw.details")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawHistory.map((item, index) => (
                        <TableRow
                          key={item.rwh_id}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all animate-in slide-in-from-bottom-2 duration-500"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-mono text-sm font-semibold text-blue-600">#{item.rwh_id || 0}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold text-green-600 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${formatAmount(Number(item.rwh_amount) || 0)}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Coins className="h-3 w-3" />
                                {formatAmount(Number(item.rwh_amount) || 0)} SOL
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item.rwh_status || 'pending')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(new Date(item.rwh_created_at || new Date()), 'dd/MM/yyyy HH:mm')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.rwh_updated_at ? (
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {format(new Date(item.rwh_updated_at), 'dd/MM/yyyy HH:mm')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-2">
                              {item.rwh_hash ? (
                                <div className="flex gap-2 items-center">
                                  <span className="text-muted-foreground">{t("withdraw.transactionHash")}:</span>
                                  <div className="flex items-center gap-1">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="font-medium truncate max-w-xs text-blue-600" title={item.rwh_hash}>
                                            {truncateString(item.rwh_hash || '', 10)}...
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{item.rwh_hash}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => copyToClipboard(item.rwh_hash || '')}
                                      className="h-6 w-6 transition-all duration-200 hover:scale-110 hover:bg-blue-100"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}

                              {/* Retry Button for failed transactions */}
                              {item.rwh_status === 'failed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRetry(item.rwh_id || 0)}
                                  disabled={retryingIds.has(item.rwh_id || 0)}
                                  className="w-full transition-all duration-300 hover:scale-105"
                                >
                                  {retryingIds.has(item.rwh_id || 0) ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                      {t("withdraw.retrying")}
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="h-3 w-3 mr-2" />
                                      {t("withdraw.retry")}
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-3">
                  {withdrawHistory.map((item, index) => (
                    <Collapsible key={item.rwh_id} open={expandedHistoryItems.has(item.rwh_id || 0)}>
                      <Card
                        className="transition-all duration-300 hover:shadow-md animate-in slide-in-from-bottom-2 duration-500"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-blue-600">#{item.rwh_id || 0}</span>
                                {getStatusBadge(item.rwh_status || 'pending')}
                              </div>
                              <CollapsibleTrigger
                                onClick={() => toggleHistoryItem(item.rwh_id || 0)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                {expandedHistoryItems.has(item.rwh_id || 0) ? (
                                  <ChevronUp className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                )}
                              </CollapsibleTrigger>
                            </div>

                            {/* Amount */}
                            <div className="space-y-1">
                              <p className="font-semibold text-green-600 flex items-center gap-1 text-lg">
                                <DollarSign className="h-4 w-4" />
                                ${formatAmount(Number(item.rwh_amount) || 0)}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Coins className="h-3 w-3" />
                                {formatAmount(Number(item.rwh_amount) || 0)} SOL
                              </p>
                            </div>

                            {/* Created Date */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{t("withdraw.createdDate")}: {format(new Date(item.rwh_created_at || new Date()), 'dd/MM/yyyy HH:mm')}</span>
                            </div>

                            {/* Collapsible Details */}
                            <Collapsible open={expandedHistoryItems.has(item.rwh_id || 0)}>
                              <CollapsibleContent className="space-y-3 pt-2 border-t border-gray-100">
                                {/* Updated Date */}
                                {item.rwh_updated_at && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{t("withdraw.updatedDate")}: {format(new Date(item.rwh_updated_at), 'dd/MM/yyyy HH:mm')}</span>
                                  </div>
                                )}

                                {/* Hash */}
                                {item.rwh_hash && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">{t("withdraw.transactionHash")}:</p>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                                      <span className="font-mono text-blue-600 flex-1 truncate" title={item.rwh_hash}>
                                        {item.rwh_hash}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyToClipboard(item.rwh_hash || '')}
                                        className="h-6 w-6 transition-all duration-200 hover:scale-110 hover:bg-blue-100"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Retry Button for failed transactions */}
                                {item.rwh_status === 'failed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRetry(item.rwh_id || 0)}
                                    disabled={retryingIds.has(item.rwh_id || 0)}
                                    className="w-full transition-all duration-300 hover:scale-105"
                                  >
                                    {retryingIds.has(item.rwh_id || 0) ? (
                                      <>
                                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                        {t("withdraw.retrying")}
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw className="h-3 w-3 mr-2" />
                                        {t("withdraw.retry")}
                                      </>
                                    )}
                                  </Button>
                                )}
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        </CardContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50 animate-pulse" />
                <p>{t("withdraw.noWithdrawalHistory")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>

      {/* Withdrawal Confirmation Modal */}
      <Dialog open={isWithdrawConfirmationOpen} onOpenChange={setIsWithdrawConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              {t("withdraw.confirmWithdrawal")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("withdraw.confirmWithdrawalDescription", {
                amount: `$${formatAmount(availableWithdrawal?.totalUSD || 0)}`,
                solAmount: formatAmount(availableWithdrawal?.totalSOL || 0)
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">{t("withdraw.totalAmount")}</p>
                  <p className="text-lg font-bold text-blue-600">${formatAmount(availableWithdrawal?.totalUSD || 0)} USD</p>
                  <p className="text-sm text-blue-700">{formatAmount(availableWithdrawal?.totalSOL || 0)} SOL</p>
                </div>
                <Coins className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{t("withdraw.confirmInfo1")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{t("withdraw.confirmInfo2")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{t("withdraw.confirmInfo3")}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleWithdrawCancel}
              className="w-full sm:w-auto"
            >
              {t("withdraw.cancel")}
            </Button>
            <Button
              onClick={handleWithdrawConfirm}
              disabled={isWithdrawing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("withdraw.processing")}
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  {t("withdraw.confirmWithdraw")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
