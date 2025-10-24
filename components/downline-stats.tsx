"use client"

import React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDownlineStatsWithFallback } from "@/lib/api"
import { Copy, Loader2, Search, CalendarIcon, Users, DollarSign, TrendingUp, Activity, ChevronRight, Sparkles, Target, BarChart3, Clock, UserPlus } from "lucide-react"
import { format } from "date-fns"
import { truncateString } from "@/lib/utils"
import { useLang } from "@/app/lang"
import { cn } from "@/lib/utils"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "@/styles/datepicker.css"

interface WalletInfo {
  nickName: string
  solanaAddress: string
  ethAddress: string
  createdAt: string,
  bittworldUid: string
}

interface DetailedMember {
  walletId: number
  level: number
  commissionPercent: number
  totalCommission: number
  totalVolume: number
  totalTransactions: number
  lastTransactionDate: string
  bgAlias: string
  walletInfo: WalletInfo
}

interface DownlineStatsData {
  isBgAffiliate: boolean
  totalMembers: number
  membersByLevel: { [key: string]: number }
  totalCommissionEarned: number
  totalVolume: number
  totalTransactions: number
  stats: {
    [key: string]: {
      count: number
      totalCommission: number
      totalVolume: number
      totalTransactions: number
    }
  }
  detailedMembers: DetailedMember[]
}

interface Filters {
  startDate: string
  endDate: string
  minCommission: string
  maxCommission: string
  minVolume: string
  maxVolume: string
  level: string
  sortBy: string
  sortOrder: string
}

export default function DownlineStats() {
  const [stats, setStats] = useState<DownlineStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, lang } = useLang()
  const [filters, setFilters] = useState<Filters>({
    startDate: "",
    endDate: "",
    minCommission: "",
    maxCommission: "",
    minVolume: "",
    maxVolume: "",
    level: "",
    sortBy: "commission",
    sortOrder: "desc",
  })

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getDownlineStatsWithFallback(filters)
      setStats(data as DownlineStatsData)
    } catch (err) {
      setError(t("errors.networkError"))
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, []) // Initial fetch

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: 'startDate' | 'endDate', date: Date | null) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd')
      setFilters((prev) => ({ ...prev, [name]: formattedDate }))
    } else {
      setFilters((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleApplyFilters = () => {
    fetchStats()
  }

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      minCommission: "",
      maxCommission: "",
      minVolume: "",
      maxVolume: "",
      level: "",
      sortBy: "commission",
      sortOrder: "desc",
    })
    // Gọi API ngay sau khi reset filters
    setTimeout(() => {
      fetchStats()
    }, 100)
  }

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

  // Get locale for react-datepicker
  const getDatePickerLocale = () => {
    switch (lang) {
      case 'vi':
        return 'vi'
      case 'kr':
        return 'ko'
      case 'jp':
        return 'ja'
      default:
        return 'en'
    }
  }

  // Custom input component for date picker
  const CustomDateInput = React.forwardRef<HTMLButtonElement, any>(({ value, onClick, placeholder }, ref) => (
    <Button
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
        !value && "text-muted-foreground"
      )}
      onClick={onClick}
      ref={ref}
    >
      <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
      {value || placeholder}
    </Button>
  ))
  CustomDateInput.displayName = "CustomDateInput"

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

  if (!stats || !stats.isBgAffiliate) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {t("messages.accessDenied")}
      </div>
    )
  }

  return (
    <Card className="!border-none rounded-none">
      <CardHeader className="px-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">{t("dashboard.downlineTransactionStats")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:gap-6 px-3 sm:px-6">
        {/* Overview Section */}
        <div className="flex flex-col gap-3 sm:gap-4 rounded-xl p-3 sm:p-4 animate-in slide-in-from-bottom-2 duration-500" style={{ boxShadow: "0px 3px 10px 9px #1f1f1f14" }}>
          <div className="grid gap-3 sm:gap-4 mt-0">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-base sm:text-lg lg:text-xl">{t("stats.overview")}:</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card className="p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-none flex justify-between flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg group" style={{ boxShadow: "0px 0px 10px 0px #1f1f1f14" }}>
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("stats.totalMembers")}</div>
                  <Users className="h-4 w-4 text-blue-600 group-hover:animate-bounce" />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors">{stats.totalMembers}</div>
              </Card>
              <Card className="p-2 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-none flex justify-between flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("commission.totalCommission")}</div>
                  <DollarSign className="h-4 w-4 text-green-600 group-hover:animate-pulse" />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 group-hover:text-green-800 transition-colors">${stats.totalCommissionEarned.toFixed(6)}</div>
              </Card>
              <Card className="p-2 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-none flex justify-between flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("stats.totalVolume")}</div>
                  <TrendingUp className="h-4 w-4 text-purple-600 group-hover:animate-pulse" />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700 group-hover:text-purple-800 transition-colors">${stats.totalVolume.toFixed(6)}</div>
              </Card>
              <Card className="p-2 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 border-none flex justify-between flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-muted-foreground">{t("stats.totalTransactions")}</div>
                  <Activity className="h-4 w-4 text-orange-600 group-hover:animate-pulse" />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-700 group-hover:text-orange-800 transition-colors">{stats.totalTransactions}</div>
              </Card>
            </div>
          </div>

          {/* By Level Section */}
          <div className="grid gap-3 sm:gap-4 mt-0">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-base sm:text-lg lg:text-xl">{t("stats.byLevel")}:</h3>
            </div>
            {Object.keys(stats.stats).length === 0 ? (
              <p className="text-muted-foreground text-sm sm:text-base">{t("stats.noLevelStats")}</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                {Object.entries(stats.stats).map(([level, data], index) => (
                  <Card key={level} className="p-2 sm:p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg group animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded">
                        <Target className="h-3 w-3 text-white" />
                      </div>
                      <CardTitle className="text-sm sm:text-base lg:text-lg capitalize">{level.replace("level", t("auth.level") + " ")}</CardTitle>
                    </div>
                    <div className="grid gap-1 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{t("stats.count")}:</span> {data.count}
                      </div>
                      <div className="flex items-center gap-2 group-hover:text-green-600 transition-colors">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">{t("commission.totalCommission")}:</span> ${data.totalCommission.toFixed(6)}
                      </div>
                      <div className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">{t("stats.totalVolume")}:</span> ${data.totalVolume.toFixed(6)}
                      </div>
                      <div className="flex items-center gap-2 group-hover:text-orange-600 transition-colors">
                        <Activity className="h-3 w-3" />
                        <span className="font-medium">{t("stats.totalTransactions")}:</span> {data.totalTransactions}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="rounded-xl p-3 sm:p-4 animate-in slide-in-from-bottom-2 duration-500 delay-200" style={{ boxShadow: "0px 3px 10px 9px #1f1f1f14" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Start Date */}
            <div>
              <label
                htmlFor="startDate"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block flex items-center gap-1"
              >
                <CalendarIcon className="h-3 w-3" />
                {t("dateTime.startDate")}
              </label>
              <DatePicker
                selected={filters.startDate ? new Date(filters.startDate) : null}
                onChange={(date) => handleDateChange('startDate', date)}
                customInput={<CustomDateInput />}
                placeholderText={t("dateTime.startDate")}
                dateFormat={getDateFormat()}
                locale={getDatePickerLocale()}
                className="w-full"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="endDate"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block flex items-center gap-1"
              >
                <CalendarIcon className="h-3 w-3" />
                {t("dateTime.endDate")}
              </label>
              <DatePicker
                selected={filters.endDate ? new Date(filters.endDate) : null}
                onChange={(date) => handleDateChange('endDate', date)}
                customInput={<CustomDateInput />}
                placeholderText={t("dateTime.endDate")}
                dateFormat={getDateFormat()}
                locale={getDatePickerLocale()}
                className="w-full"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />
            </div>

            {/* Min Commission */}
            <div>
              <label
                htmlFor="minCommission"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block flex items-center gap-1"
              >
                <DollarSign className="h-3 w-3" />
                {t("commission.minCommission")}
              </label>
              <Input
                type="number"
                id="minCommission"
                name="minCommission"
                value={filters.minCommission}
                onChange={handleFilterChange}
                placeholder={t("commission.minCommission")}
                className="text-xs sm:text-sm h-8 sm:h-10 transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"
              />
            </div>

            {/* Max Commission */}
            <div>
              <label
                htmlFor="maxCommission"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block flex items-center gap-1"
              >
                <DollarSign className="h-3 w-3" />
                {t("commission.maxCommission")}
              </label>
              <Input
                type="number"
                id="maxCommission"
                name="maxCommission"
                value={filters.maxCommission}
                onChange={handleFilterChange}
                placeholder={t("commission.maxCommission")}
                className="text-xs sm:text-sm h-8 sm:h-10 transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"
              />
            </div>

            {/* Min Volume */}
            <div>
              <label
                htmlFor="minVolume"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                {t("stats.minVolume")}
              </label>
              <Input
                type="number"
                id="minVolume"
                name="minVolume"
                value={filters.minVolume}
                onChange={handleFilterChange}
                placeholder={t("stats.minVolume")}
                className="text-xs sm:text-sm h-8 sm:h-10 transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"
              />
            </div>

            {/* Max Volume */}
            <div>
              <label
                htmlFor="maxVolume"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                {t("stats.maxVolume")}
              </label>
              <Input
                type="number"
                id="maxVolume"
                name="maxVolume"
                value={filters.maxVolume}
                onChange={handleFilterChange}
                placeholder={t("stats.maxVolume")}
                className="text-xs sm:text-sm h-8 sm:h-10 transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"
              />
            </div>

            {/* Level */}
            <div>
              <label
                htmlFor="level"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block flex items-center gap-1"
              >
                <Target className="h-3 w-3" />
                {t("auth.level")}
              </label>
              <Input
                type="number"
                id="level"
                name="level"
                value={filters.level}
                onChange={handleFilterChange}
                placeholder={t("auth.level")}
                className="text-xs sm:text-sm h-8 sm:h-10 transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"
              />
            </div>

            {/* Sort By */}
            <div>
              <label
                htmlFor="sortBy"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block flex items-center gap-1"
              >
                <BarChart3 className="h-3 w-3" />
                {t("common.sort")} {t("common.by")}
              </label>
              <Select value={filters.sortBy} onValueChange={(value) => handleSelectChange("sortBy", value)}>
                <SelectTrigger id="sortBy" className="text-xs sm:text-sm h-8 sm:h-10 transition-all duration-200 hover:scale-[1.02]">
                  <SelectValue placeholder={t("common.sort")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commission">{t("commission.commission")}</SelectItem>
                  <SelectItem value="volume">{t("stats.volume")}</SelectItem>
                  <SelectItem value="transactions">{t("stats.transactions")}</SelectItem>
                  <SelectItem value="level">{t("auth.level")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <label
                htmlFor="sortOrder"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block flex items-center gap-1"
              >
                <ChevronRight className="h-3 w-3" />
                {t("common.sortOrder")}
              </label>
              <Select value={filters.sortOrder} onValueChange={(value) => handleSelectChange("sortOrder", value)}>
                <SelectTrigger id="sortOrder" className="text-xs sm:text-sm h-8 sm:h-10 transition-all duration-200 hover:scale-[1.02]">
                  <SelectValue placeholder={t("common.sortOrder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">{t("common.ascending")}</SelectItem>
                  <SelectItem value="desc">{t("common.descending")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apply Filters Button */}
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row items-end md:gap-[5%] mt-4 sm:mt-0 gap-2">
              <Button onClick={handleApplyFilters} className="w-full text-xs sm:text-sm h-8 sm:h-10 transition-all duration-200 hover:scale-105 hover:shadow-lg bg-[#009144]">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-pulse" />
                {t("common.applyFilters")}
              </Button>
              <Button onClick={handleResetFilters} className="w-3/5 px-6 text-xs sm:text-sm h-8 sm:h-10 transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700">
                {t("common.reset")}
              </Button>
            </div>
          </div>

          {/* Detailed Members Section */}
          <div className="grid gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-base sm:text-lg lg:text-xl">{t("affiliate.detailedMembers")}:</h3>
            </div>
            {stats.detailedMembers.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm sm:text-base">{t("affiliate.noMembersFound")}</p>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="block lg:hidden space-y-3">
                  {stats.detailedMembers.map((member, index) => (
                    <Card key={member.walletId} className="p-3 sm:p-4 transition-all hover:scale-[1.02] hover:shadow-lg group animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="space-y-2 sm:space-y-3">
                        {/* Header Row */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-muted-foreground">#{member.walletInfo?.bittworldUid}</span>
                              <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                                <Target className="h-2 w-2" />
                                {t("auth.level")} {member.level}
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm sm:text-base group-hover:text-blue-600 transition-colors">{member?.bgAlias || member.walletInfo?.nickName}</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-green-500 font-semibold text-sm sm:text-base flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {member.commissionPercent}%
                            </div>
                            <div className="text-[#f472b6] font-semibold text-sm sm:text-base flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              ${member.totalCommission.toFixed(6)}
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-2 rounded transition-all duration-200 hover:scale-105">
                            <div className="text-muted-foreground flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {t("stats.totalVolume")}
                            </div>
                            <div className="font-semibold">${member.totalVolume.toFixed(6)}</div>
                          </div>
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-2 rounded transition-all duration-200 hover:scale-105">
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {t("stats.totalTransactions")}
                            </div>
                            <div className="font-semibold">{member.totalTransactions}</div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {t("affiliate.lastTransaction")}
                            </div>
                            <div className="font-medium">
                              {member.lastTransactionDate ? format(new Date(member.lastTransactionDate), getDateFormat() + " HH:mm") : "---"}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              {t("affiliate.createdAccount")}
                            </div>
                            <div className="font-medium">
                              {member.walletInfo?.createdAt ? format(new Date(member.walletInfo?.createdAt), getDateFormat() + " HH:mm") : "---"}
                            </div>
                          </div>
                        </div>

                        {/* Solana Address */}
                        <div className="pt-2 border-t">
                          <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {t("affiliate.solanaAddress")}
                          </div>
                          <div className="flex items-center gap-2 w-fit">
                            <span className="text-[#ffb300] font-semibold text-xs sm:text-sm flex-1 break-all">
                              {member.walletInfo.solanaAddress.slice(0, 8)}...{member.walletInfo.solanaAddress.slice(-8)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigator.clipboard.writeText(member.walletInfo.solanaAddress)}
                              className="h-6 w-6 flex-shrink-0 transition-all duration-200 hover:scale-110 hover:bg-yellow-100"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden lg:block overflow-x-auto border-t border-b rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#0bcd66]">
                        <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">BITWORLD UID</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">{t("affiliate.nickname")}</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">{t("auth.level")}</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">{t("commission.percentage")}</TableHead>
                        <TableHead className="text-right font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">{t("commission.commission")}</TableHead>
                        <TableHead className="text-right font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">{t("stats.totalVolume")}</TableHead>
                        <TableHead className="text-right font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">{t("stats.totalTransactions")}</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">{t("affiliate.lastTransaction")}</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">{t("affiliate.createdAccount")}</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm text-gray-950 px-1 sm:px-3 py-2">{t("affiliate.solanaAddress")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.detailedMembers.map((member, index) => (
                        <TableRow key={member.walletId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 30}ms` }}>
                          <TableCell className="text-xs sm:text-sm px-1 sm:px-3 py-2"><div className="flex items-center gap-1 cursor-pointer" onClick={() => navigator.clipboard.writeText(member.walletInfo?.bittworldUid)}>{member.walletInfo?.bittworldUid} <Copy className="h-3 w-3" /></div></TableCell>
                          <TableCell className="text-xs sm:text-sm px-1 sm:px-3 py-2 hover:text-blue-600 transition-colors">{member?.bgAlias || member.walletInfo?.nickName}</TableCell>
                          <TableCell className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs inline-flex items-center gap-1">
                              <Target className="h-2 w-2" />
                              {member.level}
                            </span>
                          </TableCell>
                          <TableCell className="text-green-500 text-xs sm:text-sm px-1 sm:px-3 py-2 font-semibold">
                            <div className="inline-flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {member.commissionPercent}%
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs sm:text-sm px-1 sm:px-3 py-2 text-[#f472b6] font-semibold">
                            <div className="inline-flex items-center justify-end gap-1">
                              <TrendingUp className="h-3 w-3" />
                              ${member.totalCommission.toFixed(6)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs sm:text-sm px-1 sm:px-3 py-2">
                            <div className="inline-flex items-center justify-end gap-1">
                              <TrendingUp className="h-3 w-3 text-purple-600" />
                              ${member.totalVolume.toFixed(6)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs sm:text-sm px-1 sm:px-3 py-2">
                            <div className="inline-flex items-center justify-end gap-1">
                              <Activity className="h-3 w-3 text-orange-600" />
                              {member.totalTransactions}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                            <div className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-500" />
                              {member.lastTransactionDate ? format(new Date(member.lastTransactionDate), getDateFormat() + " HH:mm") : "---"}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                            <div className="inline-flex items-center gap-1">
                              <UserPlus className="h-3 w-3 text-gray-500" />
                              {member.walletInfo?.createdAt ? format(new Date(member.walletInfo?.createdAt), getDateFormat() + " HH:mm") : "---"}
                            </div>
                          </TableCell>
                          <TableCell className="truncate max-w-[80px] sm:max-w-[120px] text-[#ffb300] font-semibold text-xs sm:text-sm px-1 sm:px-3 py-2">
                            <div className="inline-flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              <span>{truncateString(member.walletInfo.solanaAddress, 8)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigator.clipboard.writeText(member.walletInfo.solanaAddress)}
                                className="h-6 w-6 sm:h-8 sm:w-8 transition-all duration-200 hover:scale-110 hover:bg-yellow-100"
                              >
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
