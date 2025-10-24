"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getAffiliateTreeWithFallback, updateCommissionPercent, updateAlias } from "@/lib/api"
import { Loader2, Users, User, Crown, TrendingUp, CheckCircle, Sparkles, TreePine, Network, Target, DollarSign, Calendar, Hash, Copy, BarChart3, UserPlus, Activity, Wallet } from "lucide-react"
import { format } from "date-fns"
import { useLang } from "@/app/lang"
import { toast } from "sonner"

interface ReferrerInfo {
  solanaAddress: string
  nickName: string
  bgAlias: string
}

interface TreeInfo {
  treeId: number
  referrer: ReferrerInfo | null
  totalCommissionPercent: number
  createdAt: string
}

interface WalletInfo {
  nickName: string
  bgAlias: string
  solanaAddress: string
  ethAddress: string
  walletId: number
  bittworldUid: string
}

interface DownlineNode {
  nodeId: number
  solanaAddress: string
  commissionPercent: string
  effectiveFrom: string
  totalVolume: number
  totalReward: number
  totalTrans: number
  walletInfo: WalletInfo
  bgAlias: string
  children: DownlineNode[]
}

interface AffiliateTreeData {
  isBgAffiliate: boolean
  treeInfo: TreeInfo
  downlineStructure: DownlineNode[]
}

// Update Commission Modal Component
function UpdateCommissionModal({
  node,
  isOpen,
  treeParent,
  onClose,
  onSuccess
}: {
  node: DownlineNode
  isOpen: boolean
  treeParent: TreeInfo
  onClose: () => void
  onSuccess: () => void
}) {
  const [newPercent, setNewPercent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState("")
  const { t } = useLang()

  const validateInput = (value: string) => {
    if (!value) {
      setValidationError(t("commission.rateRequired"))
      return false
    }

    const percent = parseFloat(value)
    if (isNaN(percent)) {
      setValidationError(t("commission.invalidRate"))
      return false
    }

    if (percent < 0) {
      setValidationError(t("commission.rateTooLow"))
      return false
    }

    if (percent > 100) {
      setValidationError(t("commission.rateTooHigh"))
      return false
    }

    if (percent > parseFloat(node.commissionPercent)) {
      setValidationError(`${t("commission.rateExceedsCurrent")} (${node.commissionPercent}%)`)
      return false
    }

    if (percent > treeParent.totalCommissionPercent) {
      setValidationError(t("commission.rateExceedsParent", { percent: treeParent.totalCommissionPercent }))
      return false
    }

    setValidationError("")
    return true
  }
  console.log(treeParent)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPercent(value)
    if (value) {
      validateInput(value)
    } else {
      setValidationError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)

    try {
      const percent = parseFloat(newPercent)
      await updateCommissionPercent(node.walletInfo.walletId, percent)
      setSuccess(true)
      toast.success(t("commission.updateSuccess"))
      setNewPercent("")
      setValidationError("")
      onSuccess()
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (error: any) {
      console.error("Failed to update commission:", error)
      // Check if the error message contains the commission limit error
      if (error.response?.data?.message?.includes("Commission percent cannot exceed")) {
        // Extract the percentage from the error message or use treeParent.totalCommissionPercent
        const maxPercent = treeParent.totalCommissionPercent
        toast.error(t("commission.rateExceedsParent", { percent: maxPercent }))
      } else {
        toast.error(error.response?.data?.message || t("commission.updateError"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setNewPercent("")
      setValidationError("")
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto animate-in slide-in-from-bottom-2 duration-300">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-lg">{t("commission.updateCommission")}</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            {t("commission.updateCommission")} {t("affiliate.downline")}: {node.walletInfo.bgAlias ?? node.walletInfo.nickName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPercent" className="text-sm flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {t("commission.currentRate")} (%)
            </Label>
            <Input
              id="currentPercent"
              type="number"
              value={node.commissionPercent}
              disabled
              className="bg-gray-50 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPercent" className="text-sm flex items-center gap-1">
              <Target className="h-3 w-3" />
              {t("commission.newRate")} (%)
            </Label>
            <Input
              id="newPercent"
              type="number"
              value={newPercent}
              onChange={handleInputChange}
              placeholder={t("commission.percentage") + " (0-100)"}
              disabled={isLoading}
              className={`text-sm transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]`}
            />

          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto transition-all duration-200 hover:scale-105">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto min-w-[100px] transition-all duration-200 hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("messages.processing")}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t("common.save")}
                </>
              )}
            </Button>
          </div>
        </form>

        {success && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-300">
            <CheckCircle className="h-5 w-5 text-green-600 animate-pulse" />
            <span className="text-green-800 text-sm">{t("messages.dataUpdated")}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Update Alias Modal Component
function UpdateAliasModal({
  node,
  isOpen,
  onClose,
  onSuccess
}: {
  node: DownlineNode
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [newAlias, setNewAlias] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState("")
  const { t } = useLang()

  const validateInput = (value: string) => {
    if (!value.trim()) {
      setValidationError(t("commission.aliasRequired"))
      return false
    }

    if (value.length > 255) {
      setValidationError(t("commission.aliasTooLong"))
      return false
    }

    setValidationError("")
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewAlias(value)
    if (value) {
      validateInput(value)
    } else {
      setValidationError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)

    try {
      await updateAlias(node.walletInfo.walletId, newAlias.trim())
      setSuccess(true)
      toast.success(t("commission.aliasUpdateSuccess"))
      setNewAlias("")
      setValidationError("")
      onSuccess()
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (error: any) {
      console.error("Failed to update alias:", error)
      toast.error(error.response?.data?.message || t("commission.aliasUpdateError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setNewAlias("")
      setValidationError("")
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto animate-in slide-in-from-bottom-2 duration-300">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded">
              <User className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-lg">{t("commission.updateAlias")}</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            {t("commission.updateAliasFor")}: {node.bgAlias ?? node.walletInfo.nickName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentAlias" className="text-sm flex items-center gap-1">
              <User className="h-3 w-3" />
              {t("commission.currentAlias")}
            </Label>
            <Input
              id="currentAlias"
              type="text"
              value={node.bgAlias ?? node.walletInfo.nickName}
              disabled
              className="bg-gray-50 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newAlias" className="text-sm flex items-center gap-1">
              <User className="h-3 w-3" />
              {t("commission.newAlias")}
            </Label>
            <Input
              id="newAlias"
              type="text"
              value={newAlias}
              onChange={handleInputChange}
              placeholder={t("commission.enterNewAlias")}
              disabled={isLoading}
              className={`text-sm transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02] ${validationError ? 'border-red-500' : ''}`}
            />
            {validationError && (
              <p className="text-red-500 text-xs">{validationError}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto transition-all duration-200 hover:scale-105">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto min-w-[100px] transition-all duration-200 hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("messages.processing")}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t("common.save")}
                </>
              )}
            </Button>
          </div>
        </form>

        {success && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-300">
            <CheckCircle className="h-5 w-5 text-green-600 animate-pulse" />
            <span className="text-green-800 text-sm">{t("messages.dataUpdated")}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Helper function to flatten the tree structure
function flattenTree(nodes: DownlineNode[], level: number = 1): Array<DownlineNode & { level: number }> {
  const result: Array<DownlineNode & { level: number }> = []

  for (const node of nodes) {
    result.push({ ...node, level })
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, level + 1))
    }
  }

  return result
}

// Tree Node Component
function TreeNodeComponent({
  node,
  level,
  onUpdateCommission,
  onUpdateAlias
}: {
  node: DownlineNode
  level: number
  onUpdateCommission: (node: DownlineNode & { level: number }) => void
  onUpdateAlias: (node: DownlineNode & { level: number }) => void
}) {
  const { t } = useLang()

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800"
      case 2: return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800"
      case 3: return "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800"
      case 4: return "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-800"
      default: return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-800"
    }
  }

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1: return <Crown className="h-4 w-4" />
      case 2: return <Users className="h-4 w-4" />
      case 3: return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-3">
      {/* Parent Node */}
      <div
        className="flex flex-col lg:flex-row items-start lg:items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all hover:scale-[1.02] hover:shadow-lg group animate-in slide-in-from-bottom-2 duration-500"
        style={{ marginLeft: `${(level - 1) * 16}px` }}
      >
        {/* Node content */}
        <div className={`flex items-center gap-2 p-2 rounded-md w-full md:w-fit border ${getLevelColor(level)}  min-w-0 transition-all duration-200 hover:scale-105`}>
          <div className="p-1 bg-white/50 rounded">
            {getLevelIcon(level)}
          </div>
          <div className="flex flex-col min-w-0 ">
            <div className="font-medium truncate text-sm sm:text-sm group-hover:text-blue-600 transition-colors">{node?.bgAlias ?? node.walletInfo.nickName}</div>
            <div className="text-xs opacity-75 truncate flex items-center gap-1">
              <Wallet className="h-2 w-2" />
              <span className="sm:hidden">{node.solanaAddress.substring(0, 6)}...{node.solanaAddress.substring(node.solanaAddress.length - 4)}</span>
              <span className="hidden sm:inline">{node.solanaAddress.substring(0, 8)}...{node.solanaAddress.substring(node.solanaAddress.length - 6)}</span>
            </div>
            <div className="text-xs font-semibold">Bittworld UID: {node.walletInfo.bittworldUid}</div>
          </div>
        </div>

        {/* Transaction Statistics */}
        <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 flex-shrink-0 flex-wrap xl:flex-nowrap flex-1">
          <div className="flex items-center gap-1 text-xs bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded">
            <DollarSign className="h-3 w-3 text-green-500" />
            <span className="text-gray-700 font-medium">{t("stats.totalReward")}:</span>
            <span className="font-bold text-green-600">{node.totalReward.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-xs bg-gradient-to-r from-blue-50 to-cyan-50 px-2 py-1 rounded">

              <BarChart3 className="h-3 w-3 text-blue-500" />
              <span className="text-gray-700 font-medium">{t("stats.totalVolume")}:</span>
              <span className="font-bold text-blue-600">{node.totalVolume.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1 text-xs bg-gradient-to-r from-purple-50 to-pink-50 px-2 py-1 rounded">
              <Activity className="h-3 w-3 text-purple-500" />
              <span className="text-gray-700 font-medium">{t("stats.totalTransactions")}:</span>
              <span className="font-bold text-purple-600">{node.totalTrans.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Commission badge and action */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full lg:w-auto justify-between lg:justify-end flex-wrap sm:flex-nowrap">
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs sm:text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none">
              <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              {node.commissionPercent}%
            </Badge>
            <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none">
              <Target className="h-2 w-2 mr-1" />
              {t("auth.level")}.{level}
            </Badge>
          </div>

          {level === 1 && (
            <Button
              size="sm"
              className="bg-[#0bcd66] text-white text-xs px-2 py-1 sm:px-3 sm:py-2 transition-all duration-200 hover:scale-105"
              onClick={() => onUpdateCommission({ ...node, level })}
            >
              <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              <span className="hidden sm:inline">{t("commission.updatePercentCommission")}</span>
              <span className="sm:hidden">{t("commission.updatePercentCommission")}</span>
            </Button>
          )}
           <Button
              size="sm"
              className="bg-[#0bcd66] text-white text-xs px-2 py-1 sm:px-3 sm:py-2 transition-all duration-200 hover:scale-105"
              onClick={() => onUpdateAlias({ ...node, level })}
            >
              <User className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              <span className="sm:hidden">{t("commission.updateAlias")}</span>
              <span className="hidden sm:inline">{t("commission.updateAlias")}</span>
            </Button>
        </div>
      </div>

      {/* Children Nodes */}
      {node.children && node.children.length > 0 && (
        <div className="ml-4 sm:ml-6 border-l-2 border-dashed border-gray-300 pl-4 sm:pl-6">
          {node.children.map((childNode) => (
            <TreeNodeComponent
              key={childNode.nodeId}
              node={childNode}
              level={level + 1}
              onUpdateCommission={onUpdateCommission}
              onUpdateAlias={onUpdateAlias}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AffiliateTree() {
  const [treeData, setTreeData] = useState<AffiliateTreeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<DownlineNode & { level: number } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAliasNode, setSelectedAliasNode] = useState<DownlineNode & { level: number } | null>(null)
  const [isAliasModalOpen, setIsAliasModalOpen] = useState(false)
  const { t, lang } = useLang()

  useEffect(() => {
    const fetchTree = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getAffiliateTreeWithFallback()
        setTreeData(data as unknown as AffiliateTreeData)
      } catch (err) {
        setError(t("errors.networkError"))
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTree()
  }, [])

  const handleUpdateCommission = (node: DownlineNode & { level: number }) => {
    setSelectedNode(node)
    setIsModalOpen(true)
  }

  const handleUpdateAlias = (node: DownlineNode & { level: number }) => {
    setSelectedAliasNode(node)
    setIsAliasModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedNode(null)
  }

  const handleAliasModalClose = () => {
    setIsAliasModalOpen(false)
    setSelectedAliasNode(null)
  }

  const handleUpdateSuccess = () => {
    // Refresh the tree data after successful update
    const fetchTree = async () => {
      try {
        const data = await getAffiliateTreeWithFallback()
        setTreeData(data as unknown as AffiliateTreeData)
      } catch (err) {
        console.error(err)
      }
    }
    fetchTree()
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

  if (!treeData || !treeData.isBgAffiliate) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {t("messages.accessDenied")}
      </div>
    )
  }

  // Flatten the tree structure and group nodes by level for statistics
  const flattenedNodes = flattenTree(treeData.downlineStructure || [])
  const nodesByLevel = flattenedNodes.reduce((acc: Record<number, number>, node) => {
    acc[node.level] = (acc[node.level] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return (
    <div className="space-y-4 sm:space-y-6 border-l-4 sm:border-none rounded-none p-2 sm:p-4 h-full">
      {/* Tree Info Card */}
      <Card className="border-none animate-in slide-in-from-bottom-2 duration-500" style={{ boxShadow: "0px 3px 10px 9px #1f1f1f14" }}>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
              <TreePine className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
                {t("stats.overview")}
              </CardTitle>
              <CardDescription className="text-sm">
                {t("affiliate.treeDescription")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-blue-500 group-hover:animate-pulse" />
                <div className="text-lg sm:text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">{treeData.treeInfo.treeId}</div>
              </div>
              <div className="text-xs sm:text-sm text-blue-600">{t("common.id")}</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-500 group-hover:animate-bounce" />
                <div className="text-lg sm:text-2xl font-bold text-green-600 group-hover:text-green-700 transition-colors">{flattenedNodes.length}</div>
              </div>
              <div className="text-xs sm:text-sm text-green-600">{t("stats.totalMembers")}</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-yellow-500 group-hover:animate-pulse" />
                <div className="text-lg sm:text-2xl font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors">{treeData.treeInfo.totalCommissionPercent}%</div>
              </div>
              <div className="text-xs sm:text-sm text-yellow-600">{t("affiliate.yourCommissionPercent")}</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-500 group-hover:animate-pulse" />
                <div className="text-lg sm:text-2xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors">{Object.keys(nodesByLevel).length}</div>
              </div>
              <div className="text-xs sm:text-sm text-purple-600">{t("affiliate.totalLevels")}</div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-md group">
            <h4 className="font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
              <Network className="h-4 w-4 text-gray-600" />
              {t("affiliate.referrer")}:
            </h4>
            {treeData.treeInfo.referrer ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-medium text-sm sm:text-base group-hover:text-blue-600 transition-colors">{treeData.treeInfo.referrer.nickName}</span>
                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-none">
                    <Wallet className="h-2 w-2 mr-1" />
                    <span className="sm:hidden">{treeData.treeInfo.referrer.solanaAddress.substring(0, 6)}...</span>
                    <span className="hidden sm:inline">{treeData.treeInfo.referrer.solanaAddress.substring(0, 8)}...</span>
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-muted-foreground text-sm sm:text-base">{t("affiliate.noReferrer")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tree Structure Card */}
      <Card className="border-none animate-in slide-in-from-bottom-2 duration-500 delay-200" style={{ boxShadow: "0px 3px 10px 9px #1f1f1f14" }}>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                {t("affiliate.treeStructure")}
              </CardTitle>
              <CardDescription className="text-sm">
                {t("affiliate.structureDescription")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {(treeData.downlineStructure?.length || 0) === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center animate-pulse">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500" />
              </div>
              <p className="text-sm sm:text-base">{t("affiliate.noDownlineMembers")}</p>
              <p className="text-xs sm:text-sm flex items-center gap-1 justify-center mt-2">
                <UserPlus className="h-3 w-3" />
                {t("affiliate.startInviting")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Level Statistics */}
              <div className="flex gap-2 mb-0 sm:mb-2 overflow-x-auto pb-2">
                {Object.entries(nodesByLevel).map(([level, count], index) => (
                  <Badge
                    key={level}
                    variant="secondary"
                    className="text-xs whitespace-nowrap bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none transition-all duration-200 hover:scale-105 animate-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Target className="h-2 w-2 mr-1" />
                    {t("auth.level")} {level}: {count} <span className="hidden sm:inline">{t("affiliate.members")}</span>
                  </Badge>
                ))}
              </div>

              {/* Tree Structure */}
              <div className="border rounded-lg p-2 sm:p-4 bg-gradient-to-br from-white to-gray-50">
                {treeData.downlineStructure.map((node, index) => (
                  <TreeNodeComponent
                    key={node.nodeId}
                    node={node}
                    level={1}
                    onUpdateCommission={handleUpdateCommission}
                    onUpdateAlias={handleUpdateAlias}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedNode && (
        <UpdateCommissionModal
          node={selectedNode}
          isOpen={isModalOpen}
          treeParent={treeData.treeInfo}
          onClose={handleModalClose}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {selectedAliasNode && (
        <UpdateAliasModal
          node={selectedAliasNode}
          isOpen={isAliasModalOpen}
          onClose={handleAliasModalClose}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  )
}
