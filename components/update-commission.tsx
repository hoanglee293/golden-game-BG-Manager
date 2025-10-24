"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCommissionPercent } from "@/lib/api"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useLang } from "@/app/lang"

export default function UpdateCommission() {
  const [toWalletId, setToWalletId] = useState("")
  const [newPercent, setNewPercent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { t } = useLang()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!toWalletId || !newPercent) {
      toast.error(t("commission.rateRequired"))
      return
    }

    const percent = parseFloat(newPercent)
    if (isNaN(percent) || percent < 0 || percent > 100) {
      toast.error(t("commission.invalidRate"))
      return
    }

    setIsLoading(true)
    setSuccess(false)

    try {
      await updateCommissionPercent(parseInt(toWalletId), percent)
      setSuccess(true)
      toast.success(t("commission.updateSuccess"))
      setToWalletId("")
      setNewPercent("")
    } catch (error) {
      console.error("Failed to update commission:", error)
      toast.error(t("commission.updateError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-none rounded-none h-full">
      <CardHeader>
        <CardTitle>{t("commission.updateCommission")}</CardTitle>
        <CardDescription>
          {t("commission.updateCommission")} {t("affiliate.downline")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 mx-4 rounded-lg" style={{ boxShadow: "0px 3px 10px 9px #1f1f1f14" }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="toWalletId">{t("affiliate.walletAddress")} ID</Label>
            <Input
              id="toWalletId"
              type="number"
              value={toWalletId}
              onChange={(e) => setToWalletId(e.target.value)}
              placeholder={t("affiliate.walletAddress") + " ID"}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPercent">{t("commission.newRate")} (%)</Label>
            <Input
              id="newPercent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={newPercent}
              onChange={(e) => setNewPercent(e.target.value)}
              placeholder={t("commission.percentage") + " (0-100)"}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-fit min-w-[100px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("messages.processing")}
              </>
            ) : (
              t("common.save")
            )}
          </Button>
        </form>

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{t("messages.dataUpdated")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 