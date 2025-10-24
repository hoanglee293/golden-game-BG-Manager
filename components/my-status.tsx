"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMyBgAffiliateStatusWithFallback } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { useLang } from "@/app/lang"

interface WalletInfo {
  walletId: number
  solanaAddress: string
  nickName: string
  ethAddress: string
}

interface BgAffiliateInfo {
  treeId: number
  parentWalletId: number
  commissionPercent: number
  level: number
}

interface MyStatusData {
  isBgAffiliate: boolean
  currentWallet: WalletInfo
  bgAffiliateInfo: BgAffiliateInfo
}

export default function MyBgAffiliateStatus() {
  const [status, setStatus] = useState<MyStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLang()

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getMyBgAffiliateStatusWithFallback()
        setStatus(data)
      } catch (err) {
        setError("Failed to fetch BG affiliate status.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStatus()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  if (!status) {
    return <div className="text-center text-muted-foreground py-8">{t("messages.noStatusData")}</div>
  }

  return (
    <Card className="border-none rounded-none h-full">
      <CardHeader>
        <CardTitle>{t("messages.myBgAffiliateStatus")}</CardTitle>
        <CardDescription>{t("messages.myBgAffiliateStatusDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* <div className="flex items-center justify-between">
          <span className="font-medium">Là BG Affiliate:</span>
          <span>{status.isBgAffiliate ? t("messages.yes") : t("messages.no")}</span>
        </div> */}
        <div className="grid gap-2">
          <h3 className="font-semibold text-lg">{t("messages.currentWalletInfo")}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="font-medium">{t("messages.walletId")}:</div>
            <div>{status.currentWallet.walletId}</div>
            <div className="font-medium">{t("messages.solanaAddress")}:</div>
            <div className="truncate">{status.currentWallet.solanaAddress.substring(0, 8)}...{status.currentWallet.solanaAddress.substring(status.currentWallet.solanaAddress.length - 4)}</div>
            <div className="font-medium">{t("messages.nickname")}:</div>
            <div>{status.currentWallet.nickName}</div>
            <div className="font-medium">{t("messages.ethAddress")}:</div>
            <div className="truncate">{status.currentWallet.ethAddress.substring(0, 8)}...{status.currentWallet.ethAddress.substring(status.currentWallet.ethAddress.length - 4)}</div>
          </div>
        </div>
        {status.isBgAffiliate && (
          <div className="grid gap-2">
            <h3 className="font-semibold text-lg">{t("messages.bgAffiliateInfo")}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="font-medium">{t("messages.treeId")}:</div>
              <div>{status.bgAffiliateInfo.treeId}</div>
              <div className="font-medium">{t("messages.parentWalletId")}:</div>
              <div>{status.bgAffiliateInfo.parentWalletId}</div>
              <div className="font-medium">{t("messages.commissionPercent")}:</div>
              <div>{status.bgAffiliateInfo.commissionPercent}%</div>
              <div className="font-medium">{t("messages.level")}:</div>
              <div>{status.bgAffiliateInfo.level}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
