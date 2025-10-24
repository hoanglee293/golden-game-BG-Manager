"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getBgAffiliateStatsWithFallback } from "@/lib/api"
import { Loader2, Sparkles, TreePine, Users, Wallet, Target, DollarSign, TrendingUp, Copy, Network, UserCheck, BarChart3, Hash } from "lucide-react"
import { useLang } from "@/app/lang"
import axiosClient from "@/utils/axiosClient"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function BgAffiliateStats() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLang()
  const { user } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getBgAffiliateStatsWithFallback()
        setStats(data)
      } catch (err) {
        setError(t("errors.networkError"))
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, []) // Removed t dependency to prevent infinite loop

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

  if (!stats) {
    return <div className="text-center text-muted-foreground py-8">{t("common.noData")}</div>
  }

  return (
    <Card className="border-none rounded-none h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">{t("dashboard.affiliateStats")}</CardTitle>
            <CardDescription className="text-sm sm:text-base">{t("messages.welcome")} {t("auth.bgAffiliate")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 md:mx-4 rounded-lg animate-in slide-in-from-bottom-2 duration-500 mx-0" style={{ boxShadow: "0px 3px 10px 9px #1f1f1f14" }}>
        {/* <div className="flex items-center justify-between">
          <span className="font-medium">{t("auth.bgAffiliate")}:</span>
          <span>{stats.isBgAffiliate ? t("common.yes") : t("common.no")}</span>
        </div> */}
        {/* Referral Link Box */}
        {user?.code && (
          <div className="grid gap-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded">
                <Users className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-orange-600 transition-colors">{t("affiliate.referralLink")}:</h3>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg border border-orange-200">
              <span className="font-mono text-sm text-orange-700 break-all min-w-0 flex-1 md:break-normal md:truncate">
                https://bitworld-mmp-fe-production.up.railway.app/?ref={user.code}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://bitworld-mmp-fe-production.up.railway.app/?ref=${user.code}`)
                  toast.success(t("messages.copiedToClipboard"))
                }}
                className="p-2 hover:bg-orange-100 rounded transition-all duration-200 hover:scale-110"
                title={t("common.copy")}
              >
                <Copy className="h-4 w-4 text-orange-500" />
              </button>
            </div>
            <p className="text-xs text-orange-600 opacity-75">
              {t("affiliate.shareThisLink")}
            </p>
          </div>
        )}

        {stats.treeInfo.rootWallet &&
          <div className="grid gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded">
                <TreePine className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">{t("affiliate.tree")} {t("common.view")}:</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-3 w-3 text-blue-500" />
                <span className="font-medium">{t("affiliate.treeId")}:</span>
              </div>
              <div className="font-mono bg-white/50 p-1 rounded text-blue-700">{stats.treeInfo.treeId}</div>

              <div className="flex items-center gap-2">
                <Wallet className="h-3 w-3 text-yellow-500" />
                <span className="font-medium">{t("affiliate.treeWalletAddress")}:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-white/50 p-1 rounded text-yellow-700 truncate">
                  {stats.treeInfo.rootWallet?.solanaAddress.substring(0, 7)}...{stats.treeInfo.rootWallet?.solanaAddress.substring(stats.treeInfo.rootWallet.solanaAddress.length - 4)}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(stats.treeInfo.rootWallet?.solanaAddress)}
                  className="p-1 hover:bg-yellow-100 rounded transition-all duration-200 hover:scale-110"
                >
                  <Copy className="h-3 w-3 text-yellow-500" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-green-500" />
                <span className="font-medium">{t("commission.totalCommission")} {t("commission.percentage")}:</span>
              </div>
              <div className="font-bold text-green-600 group-hover:text-green-700 transition-colors">{stats.treeInfo.totalCommissionPercent}%</div>
            </div>
          </div>
        }
        {stats?.currentWallet &&
          <div className="grid gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group animate-in slide-in-from-bottom-2 delay-200">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded">
                <Network className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors">{t("affiliate.profileInfo")}:</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-3 w-3 text-purple-500" />
                <span className="font-medium">BITWORLD UID:</span>
              </div>
              <div className="font-mono bg-[#009144]/70 py-1 px-2 font-semibold rounded text-white w-fit flex items-center gap-2">{stats.currentWallet.bittworldUid}  <button
                onClick={() => navigator.clipboard.writeText(stats.currentWallet?.bittworldUid)}
                className="p-1 hover:bg-purple-100 rounded transition-all duration-200 hover:scale-110"
              >
                <Copy className="h-3 w-3 text-white" />
              </button></div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-3 w-3 text-purple-500" />
                <span className="font-medium">{t("auth.email")}:</span>
              </div>
              <div className="font-mono cursor-pointer text-[#009144]/70 py-1 px-2 font-semibold rounded w-fit flex items-center gap-2 break-all md:break-normal md:truncate">{stats.currentWallet?.email}</div>

              <div className="flex items-center gap-2">
                <UserCheck className="h-3 w-3 text-purple-500" />
                <span className="font-medium">{t("auth.referralCode")}:</span>
              </div>
              <div onClick={() => navigator.clipboard.writeText(user?.code ?? "")} className="font-mono cursor-pointer bg-[#009144]/70 py-1 px-2 font-semibold rounded text-white w-fit flex items-center gap-2">{user?.code} <Copy className="h-3 w-3 text-white" /></div>

              <div className="flex items-center gap-2">
                <UserCheck className="h-3 w-3 text-purple-500" />
                <span className="font-medium">{t("commission.currentAlias")}:</span>
              </div>
              <div className="font-mono bg-[#009144]/70 py-1 px-2 font-semibold rounded text-white w-fit flex items-center gap-2">{stats.currentWallet.bgAlias ?? stats.currentWallet.nickName}</div>

              <div className="flex items-center gap-2">
                <UserCheck className="h-3 w-3 text-purple-500" />
                <span className="font-medium">{t("auth.wallet")}:</span>
              </div>
              <div className="flex items-center gap-2 bg-[#009144]/70 py-1 px-2 font-semibold w-fit rounded ">
                <span className="font-mono text-white truncate">
                  {stats.currentWallet?.solanaAddress.substring(0, 4)}...{stats.currentWallet?.solanaAddress.substring(stats.currentWallet.solanaAddress.length - 4)}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(stats.currentWallet?.solanaAddress)}
                  className="p-1 hover:bg-purple-100 rounded transition-all duration-200 hover:scale-110"
                >
                  <Copy className="h-3 w-3 text-white" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-green-500" />
                <span className="font-medium">{t("commission.commissionRate")}:</span>
              </div>
              <div className="font-bold text-green-600 group-hover:text-green-700 transition-colors">{stats.treeInfo.totalCommissionPercent}%</div>
            </div>
          </div>
        }
      </CardContent>
    </Card>
  )
}
