// TypeScript interfaces for BG Affiliate System API

export interface WalletInfo {
  walletId: number
  solanaAddress: string
  nickName: string
  ethAddress: string
  refCode: string
}

export interface OrderUser {
  id: number
  username: string
  email: string
  fullname: string
}

export interface ParentUser {
  id: number
  username: string
  email: string
  fullname: string
}

export interface CommissionEntry {
  id: number
  tree_id: number
  order_id: number
  parent_id: number
  commission_amount: number
  level: number
  created_at: string
  withdraw_status: boolean
  withdraw_id: number | null
  wallet_address: string
  alias: string
  order_user: OrderUser
  parent_user: ParentUser
  // Legacy fields for backward compatibility
  bacr_id?: number
  bacr_tree_id?: number
  bacr_order_id?: number
  bacr_wallet?: string
  bacr_commission_amount?: string
  bacr_level?: number
  bacr_created_at?: string
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

// New API response types (actual API format)
export interface UserInfo {
  id: number
  username: string
  email: string
  fullname: string
  referral_code: string
}

export interface DownlineStats {
  total_reward: number
  total_transactions: number
}

export interface DownlineNodeNew {
  user_id: number
  parent_user_id: number
  commission_percent: string
  alias: string
  effective_from: string
  level: number
  user: UserInfo
  stats: DownlineStats
  children: DownlineNodeNew[]
}

export interface TreeInfoNew {
  tree_id: number
  root_user_id: number
  total_commission_percent: string
  alias: string | null
  created_at: string
}

export interface AffiliateTreeDataNew {
  is_bg_affiliate: boolean
  tree_info: TreeInfoNew
  downline_structure: DownlineNodeNew[]
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
  minCommission?: string
  maxCommission?: string
  minTransactions?: string
  maxTransactions?: string
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

// Withdraw History Types
export interface WithdrawHistoryFilters {
  page?: string
  limit?: string
  search?: string
  status?: 'pending' | 'success' | 'failed' | 'retry'
  dateFrom?: string
  dateTo?: string
}

export interface WithdrawHistoryItem {
  id: number
  username: string
  amount: number
  amount_usd: number
  address: string
  hash: string | null
  status: 'pending' | 'success' | 'failed' | 'retry'
  created_at: string
}

export interface WithdrawHistoryResponse {
  success: boolean
  message: string
  data: WithdrawHistoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Available Withdrawal Types (API Response)
export interface AvailableWithdrawalResponse {
  success: boolean
  message: string
  data: {
    user_id: number
    username: string
    referral_code: string
    available_amount_mmp: number
    rewards_count: number
    has_wallet: boolean
    wallet_address: string
  }
}

// Withdraw Request Types
export interface WithdrawRequestResponse {
  success: boolean
  message: string
  data: {
    user_id: number
    username: string
    referral_code: string
    total_withdrawn_mmp: number
    rewards_count: number
    withdraw_id: string | number
    status: 'pending' | 'success' | 'failed'
    hash: string | null
    address: string
    created_at: string
  }
} 