// TypeScript interfaces for BG Affiliate System API

export interface WalletInfo {
  walletId: number
  solanaAddress: string
  nickName: string
  ethAddress: string
  refCode: string
}

export interface CommissionEntry {
  bacr_id: number
  bacr_tree_id: number
  bacr_order_id: number
  bacr_wallet: string
  bacr_commission_amount: string
  bacr_level: number
  bacr_created_at: string
  bittworldUid?: string
}

export interface BgAffiliateInfo {
  treeId: number
  parentWalletId: number
  commissionPercent: number
  level: number
}

export interface MyStatusData {
  isBgAffiliate: boolean
  currentWallet: WalletInfo
  bgAffiliateInfo: BgAffiliateInfo
}

export interface TreeInfo {
  treeId: number
  rootWallet: string
  totalCommissionPercent: number
}

export interface NodeInfo {
  treeId: number
  parentWallet: string
  commissionPercent: number
  level: number
}

export interface BgAffiliateStatsData {
  isBgAffiliate: boolean
  treeInfo: TreeInfo
  nodeInfo: NodeInfo
  totalEarnings: number
}

export interface ReferrerInfo {
  solanaAddress: string
  nickName: string
}

export interface AffiliateTreeInfo {
  treeId: number
  referrer: ReferrerInfo
  totalCommissionPercent: number
  createdAt: string
}

export interface DownlineNodeWalletInfo {
  nickName: string
  solanaAddress: string
  ethAddress: string
}

export interface DownlineNode {
  nodeId: number
  solanaAddress: string
  commissionPercent: number
  effectiveFrom: string
  level: number
  walletInfo: DownlineNodeWalletInfo
}

export interface AffiliateTreeData {
  isBgAffiliate: boolean
  treeInfo: AffiliateTreeInfo
  downlineNodes: DownlineNode[]
}

export interface DetailedMember {
  walletId: number
  level: number
  commissionPercent: number
  totalCommission: number
  totalVolume: number
  totalTransactions: number
  lastTransactionDate: string
  walletInfo: DownlineNodeWalletInfo
}

export interface DownlineStatsData {
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

export interface DownlineStatsFilters {
  startDate?: string
  endDate?: string
  minCommission?: string
  maxCommission?: string
  minVolume?: string
  maxVolume?: string
  level?: string
  sortBy?: string
  sortOrder?: string
}

export interface UpdateCommissionRequest {
  toWalletId: number
  newPercent: number
}

export interface BgAffiliateStatusResponse {
  hasPermission: boolean
  isTargetInDownline: boolean
  fromWallet: WalletInfo
  targetWallet: WalletInfo
  targetBgAffiliateInfo: BgAffiliateInfo
  relationship: {
    level: number
    commissionPercent: number
    effectiveFrom: string
  }
} 