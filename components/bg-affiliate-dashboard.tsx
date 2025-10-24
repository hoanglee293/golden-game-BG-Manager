"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLang } from "@/app/lang"
import { useResponsive } from "@/hooks/use-mobile"
import CommissionHistory from "./commission-history"
import MyBgAffiliateStatus from "./my-status"
import BgAffiliateStats from "./affiliate-stats"
import AffiliateTree from "./affiliate-tree"
import DownlineStats from "./downline-stats"
import UpdateCommission from "./update-commission"
import Withdraw from "./withdraw"

export default function BgAffiliateDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLang()

  // Get active tab from URL query parameter, default to "downline-stats"
  const activeTab = searchParams.get("tab") || "downline-stats"

  const tabOptions = [
    { value: "downline-stats", label: t("dashboard.downlineTransactionStats") },
    { value: "commission-history", label: t("dashboard.commissionHistory") },
    { value: "affiliate-stats", label: t("dashboard.personalProfile") },
    { value: "affiliate-tree", label: t("dashboard.downlineProfileStats") },
    { value: "withdraw", label: t("dashboard.withdraw") },
  ]

  const handleTabChange = (value: string) => {
    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    
    // Navigate to the same path with updated query parameters
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="w-full h-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full">
        {/* Mobile & Tablet: Dropdown select */}
        <div className="lg:hidden w-full bg-background border-b sticky top-12 z-30 py-4" style={{ zIndex: 10 }}>
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full max-w-sm mx-auto">
              <SelectValue placeholder={t("dashboard.selectTab")} />
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Vertical sidebar */}
        <div className="hidden lg:block lg:fixed top-20 left-0 w-[300px] z-20 h-full bg-[#009144] " style={{borderTopRightRadius: "100px"}}>
          <TabsList className="flex flex-col justify-around mt-12 items-start bg-transparent w-full h-fit p-4 pl-0 space-y-2">
            {tabOptions.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="w-full text-left justify-start rounded-tr-full rounded-br-full text-sm xl:text-base text-white cursor-pointer"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="lg:ml-[300px] lg:w-auto w-full h-full">
          <TabsContent className="border-none p-3 sm:p-4 h-full overflow-y-scroll" value="commission-history">
            <CommissionHistory />
          </TabsContent>
          <TabsContent className="border-none p-3 sm:p-4 h-full overflow-y-scroll" value="my-status">
            <MyBgAffiliateStatus />
          </TabsContent>
          <TabsContent className="border-none p-3 sm:p-4 h-full overflow-y-scroll" value="affiliate-stats">
            <BgAffiliateStats />
          </TabsContent>
          <TabsContent className="border-none p-3 sm:p-4 h-full overflow-y-scroll" value="affiliate-tree">
            <AffiliateTree />
          </TabsContent>
          <TabsContent className="border-none p-3 sm:p-4 h-[calc(100vh-56px)] overflow-y-scroll" value="downline-stats">
            <DownlineStats />
          </TabsContent>
          <TabsContent className="border-none p-3 sm:p-4 h-[calc(100vh-56px)] overflow-y-scroll" value="withdraw">
            <Withdraw />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
