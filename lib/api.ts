// Real API implementation based on BG Affiliate System API Documentation
import axiosClient from '@/utils/axiosClient'
import {
  CommissionEntry,
  MyStatusData,
  BgAffiliateStatsData,
  AffiliateTreeData,
  DownlineStatsData,
  DownlineStatsFilters,
  UpdateCommissionRequest,
  BgAffiliateStatusResponse
} from './types'
import { TelegramWalletService } from '@/services/api'

// API_BASE_URL is now handled by axiosClient configuration

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }
  return null
}

// Helper function to make authenticated API calls
const apiCall = async <T>(endpoint: string, options: any = {}): Promise<T> => {
  const response = await axiosClient.get(endpoint, options)
  return response.data
}

// API functions based on bg-ref endpoints

const getCommissionHistory = async (): Promise<CommissionEntry[]> => {
  return apiCall<CommissionEntry[]>('/bg-ref/commission-history')
}

const getMyBgAffiliateStatus = async (): Promise<MyStatusData> => {
  return apiCall<MyStatusData>('/bg-ref/my-bg-affiliate-status')
}

const getBgAffiliateStats = async (): Promise<BgAffiliateStatsData> => {
  return apiCall<BgAffiliateStatsData>('/bg-ref/bg-affiliate-stats')
}

const getAffiliateTree = async (): Promise<AffiliateTreeData> => {
  return apiCall<AffiliateTreeData>('/bg-ref/trees')
}

const getDownlineStats = async (filters: DownlineStatsFilters = {}): Promise<DownlineStatsData> => {
  const queryParams = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value)
    }
  })

  const endpoint = `/bg-ref/downline-stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return apiCall<DownlineStatsData>(endpoint)
}

const updateCommissionPercent = async (toWalletId: number, newPercent: number): Promise<any> => {
  const response = await axiosClient.put('/bg-ref/nodes/commission', {
    toWalletId,
    newPercent
  })
  
  return response.data
}

const updateAlias = async (toWalletId: number, newAlias: string): Promise<any> => {
  const response = await axiosClient.put('/bg-ref/nodes/alias', {
    toWalletId,
    newAlias
  })
  
  return response.data
}

const checkBgAffiliateStatus = async (targetWalletId: number): Promise<BgAffiliateStatusResponse> => {
  return apiCall<BgAffiliateStatusResponse>(`/bg-ref/bg-affiliate-status/${targetWalletId}`)
}

// Fallback mock data for development/testing when API is not available
const mockCommissionHistory = [
  {
    bacr_id: 1,
    bacr_tree_id: 1,
    bacr_order_id: 12345,
    bacr_wallet: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    bacr_commission_amount: "25.500000",
    bacr_level: 1,
    bacr_created_at: "2024-01-15T10:30:00.000Z",
  },
  {
    bacr_id: 2,
    bacr_tree_id: 1,
    bacr_order_id: 12346,
    bacr_wallet: "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    bacr_commission_amount: "15.000000",
    bacr_level: 2,
    bacr_created_at: "2024-01-16T11:00:00.000Z",
  },
  {
    bacr_id: 3,
    bacr_tree_id: 1,
    bacr_order_id: 12347,
    bacr_wallet: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    bacr_commission_amount: "10.250000",
    bacr_level: 1,
    bacr_created_at: "2024-01-17T12:15:00.000Z",
  },
  {
    bacr_id: 4,
    bacr_tree_id: 1,
    bacr_order_id: 12348,
    bacr_wallet: "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    bacr_commission_amount: "5.750000",
    bacr_level: 3,
    bacr_created_at: "2024-01-18T13:45:00.000Z",
  },
  {
    bacr_id: 5,
    bacr_tree_id: 1,
    bacr_order_id: 12349,
    bacr_wallet: "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
    bacr_commission_amount: "32.750000",
    bacr_level: 1,
    bacr_created_at: "2024-01-19T09:20:00.000Z",
  },
  {
    bacr_id: 6,
    bacr_tree_id: 1,
    bacr_order_id: 12350,
    bacr_wallet: "GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456",
    bacr_commission_amount: "18.250000",
    bacr_level: 2,
    bacr_created_at: "2024-01-20T14:30:00.000Z",
  },
  {
    bacr_id: 7,
    bacr_tree_id: 1,
    bacr_order_id: 12351,
    bacr_wallet: "JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789",
    bacr_commission_amount: "8.500000",
    bacr_level: 3,
    bacr_created_at: "2024-01-21T16:45:00.000Z",
  },
  {
    bacr_id: 8,
    bacr_tree_id: 1,
    bacr_order_id: 12352,
    bacr_wallet: "MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012",
    bacr_commission_amount: "4.250000",
    bacr_level: 4,
    bacr_created_at: "2024-01-22T11:15:00.000Z",
  },
  {
    bacr_id: 9,
    bacr_tree_id: 1,
    bacr_order_id: 12353,
    bacr_wallet: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    bacr_commission_amount: "28.000000",
    bacr_level: 1,
    bacr_created_at: "2024-01-23T13:20:00.000Z",
  },
  {
    bacr_id: 10,
    bacr_tree_id: 1,
    bacr_order_id: 12354,
    bacr_wallet: "PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345",
    bacr_commission_amount: "12.750000",
    bacr_level: 2,
    bacr_created_at: "2024-01-24T15:30:00.000Z",
  },
  {
    bacr_id: 11,
    bacr_tree_id: 1,
    bacr_order_id: 12355,
    bacr_wallet: "STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345PQR678",
    bacr_commission_amount: "6.500000",
    bacr_level: 3,
    bacr_created_at: "2024-01-25T10:45:00.000Z",
  },
  {
    bacr_id: 12,
    bacr_tree_id: 1,
    bacr_order_id: 12356,
    bacr_wallet: "VWX234YZA567ABC123DEF456GHI789JKL012MNO345PQR678STU901",
    bacr_commission_amount: "3.250000",
    bacr_level: 4,
    bacr_created_at: "2024-01-26T12:00:00.000Z",
  },
  {
    bacr_id: 13,
    bacr_tree_id: 1,
    bacr_order_id: 12357,
    bacr_wallet: "YZA567ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    bacr_commission_amount: "1.750000",
    bacr_level: 5,
    bacr_created_at: "2024-01-27T14:15:00.000Z",
  },
  {
    bacr_id: 14,
    bacr_tree_id: 1,
    bacr_order_id: 12358,
    bacr_wallet: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    bacr_commission_amount: "35.000000",
    bacr_level: 1,
    bacr_created_at: "2024-01-28T16:30:00.000Z",
  },
  {
    bacr_id: 15,
    bacr_tree_id: 1,
    bacr_order_id: 12359,
    bacr_wallet: "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
    bacr_commission_amount: "20.500000",
    bacr_level: 2,
    bacr_created_at: "2024-01-29T09:45:00.000Z",
  },
  {
    bacr_id: 16,
    bacr_tree_id: 1,
    bacr_order_id: 12360,
    bacr_wallet: "GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456",
    bacr_commission_amount: "9.750000",
    bacr_level: 3,
    bacr_created_at: "2024-01-30T11:20:00.000Z",
  },
  {
    bacr_id: 17,
    bacr_tree_id: 1,
    bacr_order_id: 12361,
    bacr_wallet: "JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789",
    bacr_commission_amount: "5.000000",
    bacr_level: 4,
    bacr_created_at: "2024-01-31T13:40:00.000Z",
  },
  {
    bacr_id: 18,
    bacr_tree_id: 1,
    bacr_order_id: 12362,
    bacr_wallet: "MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012",
    bacr_commission_amount: "2.500000",
    bacr_level: 5,
    bacr_created_at: "2024-02-01T15:55:00.000Z",
  },
  {
    bacr_id: 19,
    bacr_tree_id: 1,
    bacr_order_id: 12363,
    bacr_wallet: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    bacr_commission_amount: "42.250000",
    bacr_level: 1,
    bacr_created_at: "2024-02-02T17:10:00.000Z",
  },
  {
    bacr_id: 20,
    bacr_tree_id: 1,
    bacr_order_id: 12364,
    bacr_wallet: "PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345",
    bacr_commission_amount: "22.000000",
    bacr_level: 2,
    bacr_created_at: "2024-02-03T19:25:00.000Z",
  },
]

const mockMyBgAffiliateStatus = {
  isBgAffiliate: true,
  currentWallet: {
    walletId: 123456,
    solanaAddress: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    nickName: "CurrentUser",
    ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
  },
  bgAffiliateInfo: {
    treeId: 1,
    parentWalletId: 789012,
    commissionPercent: 25.0,
    level: 1,
  },
}

const mockBgAffiliateStats = {
  isBgAffiliate: true,
  treeInfo: {
    treeId: 1,
    rootWallet: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    totalCommissionPercent: 70.0,
  },
  nodeInfo: {
    treeId: 1,
    parentWallet: "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    commissionPercent: 25.0,
    level: 1,
  },
  totalEarnings: 125.5,
}

const mockAffiliateTree = {
  "isBgAffiliate": true,
  "treeInfo": {
      "treeId": 2,
      "totalCommissionPercent": "78.00",
      "createdAt": "2025-07-11T09:25:20.912Z"
  },
  "downlineStructure": [
      {
          "nodeId": 5,
          "solanaAddress": "EBuWA9nftomxAgFauFnfKvjTcPcfDPcVM5HFBKwPDuRS",
          "commissionPercent": "19.00",
          "effectiveFrom": "2025-07-11T16:35:15.838Z",
          "walletInfo": {
              "walletId": 3252745,
              "nickName": "코",
              "solanaAddress": "EBuWA9nftomxAgFauFnfKvjTcPcfDPcVM5HFBKwPDuRS",
              "ethAddress": "0x2DbDe07a6d9E571C2Cb3be3D79906a3307f6ce3e"
          },
          "children": [
              {
                  "nodeId": 6,
                  "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                  "commissionPercent": "50.00",
                  "effectiveFrom": "2025-07-11T16:40:19.875Z",
                  "walletInfo": {
                      "walletId": 3260520,
                      "nickName": "haxaki2",
                      "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                      "ethAddress": "0x991548110b8fAB5B4deC75a69b87C1DA764D3acc"
                  },
                  "children": [
                    {
                      "nodeId": 6,
                      "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                      "commissionPercent": "50.00",
                      "effectiveFrom": "2025-07-11T16:40:19.875Z",
                      "walletInfo": {
                          "walletId": 3260520,
                          "nickName": "haxaki2",
                          "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                          "ethAddress": "0x991548110b8fAB5B4deC75a69b87C1DA764D3acc"
                      },
                      "children": []
                    }
                  ]
              },
              {
                "nodeId": 6,
                "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                "commissionPercent": "50.00",
                "effectiveFrom": "2025-07-11T16:40:19.875Z",
                "walletInfo": {
                    "walletId": 3260520,
                    "nickName": "haxaki2",
                    "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                    "ethAddress": "0x991548110b8fAB5B4deC75a69b87C1DA764D3acc"
                },
                "children": [
                  {
                    "nodeId": 6,
                    "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                    "commissionPercent": "50.00",
                    "effectiveFrom": "2025-07-11T16:40:19.875Z",
                    "walletInfo": {
                        "walletId": 3260520,
                        "nickName": "haxaki2",
                        "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                        "ethAddress": "0x991548110b8fAB5B4deC75a69b87C1DA764D3acc"
                    },
                    "children": []
                  },
                  {
                    "nodeId": 6,
                    "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                    "commissionPercent": "50.00",
                    "effectiveFrom": "2025-07-11T16:40:19.875Z",
                    "walletInfo": {
                        "walletId": 3260520,
                        "nickName": "haxaki2",
                        "solanaAddress": "91Y9DWX3APSi7HEu2kirw2tgrrgERz5iU5dzG6sEJPnq",
                        "ethAddress": "0x991548110b8fAB5B4deC75a69b87C1DA764D3acc"
                    },
                    "children": []
                  }
                ]
            }
          ]
      },
      {
          "nodeId": 8,
          "solanaAddress": "GYbsR7pcZ1nLwajupk35QSuhDoue5xCREM4xVZtyet5o",
          "commissionPercent": "80.00",
          "effectiveFrom": "2025-07-14T11:35:18.222Z",
          "walletInfo": {
              "walletId": 3253560,
              "nickName": "hehehe",
              "solanaAddress": "GYbsR7pcZ1nLwajupk35QSuhDoue5xCREM4xVZtyet5o",
              "ethAddress": "0x53433c35f71989dCb29e697cB98B66fd7EB9ad00"
          },
          "children": []
      }
  ]
}

const mockDownlineStats = {
  isBgAffiliate: true,
  totalMembers: 18,
  membersByLevel: {
    level1: 3,
    level2: 4,
    level3: 3,
    level4: 3,
    level5: 3,
    level6: 2,
  },
  totalCommissionEarned: 1250.75,
  totalVolume: 25000.0,
  totalTransactions: 125,
  stats: {
    level1: {
      count: 3,
      totalCommission: 450.0,
      totalVolume: 9000.0,
      totalTransactions: 45,
    },
    level2: {
      count: 4,
      totalCommission: 320.0,
      totalVolume: 6400.0,
      totalTransactions: 32,
    },
    level3: {
      count: 3,
      totalCommission: 180.0,
      totalVolume: 3600.0,
      totalTransactions: 18,
    },
    level4: {
      count: 3,
      totalCommission: 150.0,
      totalVolume: 3000.0,
      totalTransactions: 15,
    },
    level5: {
      count: 3,
      totalCommission: 100.0,
      totalVolume: 2000.0,
      totalTransactions: 10,
    },
    level6: {
      count: 2,
      totalCommission: 50.75,
      totalVolume: 1000.0,
      totalTransactions: 5,
    },
  },
  detailedMembers: [
    // Level 1 Members
    {
      walletId: 789012,
      level: 1,
      commissionPercent: 25.0,
      totalCommission: 150.0,
      totalVolume: 3000.0,
      totalTransactions: 15,
      lastTransactionDate: "2024-01-15T10:30:00.000Z",
      walletInfo: {
        nickName: "User1",
        solanaAddress: "JKL012MASDSADASU901VWX234YZA567ABC123DEF456GHI789",
        ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
      },
    },
    {
      walletId: 123457,
      level: 1,
      commissionPercent: 30.0,
      totalCommission: 180.0,
      totalVolume: 3000.0,
      totalTransactions: 15,
      lastTransactionDate: "2024-01-16T11:00:00.000Z",
      walletInfo: {
        nickName: "User2",
        solanaAddress: "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
        ethAddress: "0xABC123DEF456789ABC123DEF456789ABC123DEF4",
      },
    },
    {
      walletId: 123458,
      level: 1,
      commissionPercent: 20.0,
      totalCommission: 120.0,
      totalVolume: 3000.0,
      totalTransactions: 15,
      lastTransactionDate: "2024-01-17T12:00:00.000Z",
      walletInfo: {
        nickName: "User3",
        solanaAddress: "JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789",
        ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
      },
    },
    // Level 2 Members
    {
      walletId: 123459,
      level: 2,
      commissionPercent: 15.0,
      totalCommission: 90.0,
      totalVolume: 1600.0,
      totalTransactions: 8,
      lastTransactionDate: "2024-01-18T13:00:00.000Z",
      walletInfo: {
        nickName: "User4",
        solanaAddress: "PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345",
        ethAddress: "0xABC123DEF456789ABC123DEF456789ABC123DEF4",
      },
    },
    {
      walletId: 123460,
      level: 2,
      commissionPercent: 12.0,
      totalCommission: 72.0,
      totalVolume: 1600.0,
      totalTransactions: 8,
      lastTransactionDate: "2024-01-19T14:00:00.000Z",
      walletInfo: {
        nickName: "User5",
        solanaAddress: "VWX234YZA567ABC123DEF456GHI789JKL012MNO345PQR678STU901",
        ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
      },
    },
    {
      walletId: 123461,
      level: 2,
      commissionPercent: 10.0,
      totalCommission: 80.0,
      totalVolume: 1600.0,
      totalTransactions: 8,
      lastTransactionDate: "2024-01-20T15:00:00.000Z",
      walletInfo: {
        nickName: "User6",
        solanaAddress: "YZA567ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
        ethAddress: "0xABC123DEF456789ABC123DEF456789ABC123DEF4",
      },
    },
    {
      walletId: 123462,
      level: 2,
      commissionPercent: 8.0,
      totalCommission: 78.0,
      totalVolume: 1600.0,
      totalTransactions: 8,
      lastTransactionDate: "2024-01-21T16:00:00.000Z",
      walletInfo: {
        nickName: "User7",
        solanaAddress: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
        ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
      },
    },
    // Level 3 Members
    {
      walletId: 123463,
      level: 3,
      commissionPercent: 8.0,
      totalCommission: 64.0,
      totalVolume: 1200.0,
      totalTransactions: 6,
      lastTransactionDate: "2024-01-22T17:00:00.000Z",
      walletInfo: {
        nickName: "User8",
        solanaAddress: "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
        ethAddress: "0xABC123DEF456789ABC123DEF456789ABC123DEF4",
      },
    },
    {
      walletId: 123464,
      level: 3,
      commissionPercent: 6.0,
      totalCommission: 60.0,
      totalVolume: 1200.0,
      totalTransactions: 6,
      lastTransactionDate: "2024-01-23T18:00:00.000Z",
      walletInfo: {
        nickName: "User9",
        solanaAddress: "GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456",
        ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
      },
    },
    {
      walletId: 123465,
      level: 3,
      commissionPercent: 5.0,
      totalCommission: 56.0,
      totalVolume: 1200.0,
      totalTransactions: 6,
      lastTransactionDate: "2024-01-24T19:00:00.000Z",
      walletInfo: {
        nickName: "User10",
        solanaAddress: "JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789",
        ethAddress: "0xABC123DEF456789ABC123DEF456789ABC123DEF4",
      },
    },
    // Level 4 Members
    {
      walletId: 123466,
      level: 4,
      commissionPercent: 5.0,
      totalCommission: 50.0,
      totalVolume: 1000.0,
      totalTransactions: 5,
      lastTransactionDate: "2024-01-25T20:00:00.000Z",
      walletInfo: {
        nickName: "User11",
        solanaAddress: "MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012",
        ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
      },
    },
    {
      walletId: 123467,
      level: 4,
      commissionPercent: 4.0,
      totalCommission: 52.0,
      totalVolume: 1000.0,
      totalTransactions: 5,
      lastTransactionDate: "2024-01-26T21:00:00.000Z",
      walletInfo: {
        nickName: "User12",
        solanaAddress: "PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345",
        ethAddress: "0xABC123DEF456789ABC123DEF456789ABC123DEF4",
      },
    },
    {
      walletId: 123468,
      level: 4,
      commissionPercent: 3.0,
      totalCommission: 48.0,
      totalVolume: 1000.0,
      totalTransactions: 5,
      lastTransactionDate: "2024-01-27T22:00:00.000Z",
      walletInfo: {
        nickName: "User13",
        solanaAddress: "STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345PQR678",
        ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
      },
    },
    // Level 5 Members
    {
      walletId: 123469,
      level: 5,
      commissionPercent: 3.0,
      totalCommission: 36.0,
      totalVolume: 700.0,
      totalTransactions: 4,
      lastTransactionDate: "2024-01-28T23:00:00.000Z",
      walletInfo: {
        nickName: "User14",
        solanaAddress: "VWX234YZA567ABC123DEF456GHI789JKL012MNO345PQR678STU901",
        ethAddress: "0xABC123DEF456789ABC123DEF456789ABC123DEF4",
      },
    },
    {
      walletId: 123470,
      level: 5,
      commissionPercent: 2.5,
      totalCommission: 32.0,
      totalVolume: 700.0,
      totalTransactions: 4,
      lastTransactionDate: "2024-01-29T00:00:00.000Z",
      walletInfo: {
        nickName: "User15",
        solanaAddress: "YZA567ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
        ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
      },
    },
    {
      walletId: 123471,
      level: 5,
      commissionPercent: 2.0,
      totalCommission: 32.0,
      totalVolume: 600.0,
      totalTransactions: 2,
      lastTransactionDate: "2024-01-30T01:00:00.000Z",
      walletInfo: {
        nickName: "User16",
        solanaAddress: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
        ethAddress: "0xABC123DEF456789ABC123DEF456789ABC123DEF4",
      },
    },
    // Level 6 Members
    {
      walletId: 123472,
      level: 6,
      commissionPercent: 2.0,
      totalCommission: 26.0,
      totalVolume: 500.0,
      totalTransactions: 3,
      lastTransactionDate: "2024-01-31T02:00:00.000Z",
      walletInfo: {
        nickName: "User17",
        solanaAddress: "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
        ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A",
      },
    },
    {
      walletId: 123473,
      level: 6,
      commissionPercent: 1.5,
      totalCommission: 24.75,
      totalVolume: 500.0,
      totalTransactions: 2,
      lastTransactionDate: "2024-02-01T03:00:00.000Z",
      walletInfo: {
        nickName: "User18",
        solanaAddress: "GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456",
        ethAddress: "0xABC123DEF456789ABC123DEF456789ABC123DEF4",
      },
    },
  ],
}

// Fallback function to use mock data when API fails
const simulateApiCall = <T,>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 500) // Simulate network delay
  })
}

// Enhanced API functions with fallback to mock data
export const getCommissionHistoryWithFallback = async () => {
  try {
    // fake data
    return await getCommissionHistory()
    // return mockCommissionHistory
  } catch (error) {
    return simulateApiCall(mockCommissionHistory)
  }
}

export const getMyBgAffiliateStatusWithFallback = async () => {
  try {
    // fake data
    return await getMyBgAffiliateStatus()
    // return mockMyBgAffiliateStatus
  } catch (error) {
    return simulateApiCall(mockMyBgAffiliateStatus)
  }
}

export const getBgAffiliateStatsWithFallback = async () => {
  try {
    // fake data
    return await getBgAffiliateStats()
    // return mockBgAffiliateStats
  } catch (error) {
    return simulateApiCall(mockBgAffiliateStats)
  }
}

export const getAffiliateTreeWithFallback = async () => {
  try {
    // fake data
    return await getAffiliateTree()
    // return mockAffiliateTree
  } catch (error) {
    return simulateApiCall(mockAffiliateTree)
  }
}

export const getDownlineStatsWithFallback = async (filters: any = {}) => {
  try {
    // fake data
    return await getDownlineStats(filters)
    // return mockDownlineStats
  } catch (error) {
    return simulateApiCall(mockDownlineStats)
  }
}

// Helper function to check BG Affiliate status with token
const checkBgAffiliateStatusWithToken = async (): Promise<MyStatusData | null> => {
  try {
    // Temporarily set token for this request
    // const originalToken = localStorage.getItem('auth_token')
    // localStorage.setItem('auth_token', token)
    
    const response = await axiosClient.get('/bg-ref/my-bg-affiliate-status')
    
    // Restore original token
    // if (originalToken) {
    //   localStorage.setItem('auth_token', originalToken)
    // } else {
    //   localStorage.removeItem('auth_token')
    // }
    
    return response.data
  } catch (error) {
    return null
  }
}

// BG Affiliate Withdrawal API functions
const createWithdrawRequest = async (): Promise<any> => {
  const response = await axiosClient.post('/bg-ref/withdraw')
  return response.data
}

const retryWithdrawRequest = async (withdrawId: number): Promise<any> => {
  const response = await axiosClient.post(`/bg-ref/withdraw/${withdrawId}/retry`)
  return response.data
}

const getWithdrawHistory = async (): Promise<any> => {
  return apiCall<any>('/bg-ref/withdraw-history')
}

const getAvailableWithdrawal = async (): Promise<any> => {
  return apiCall<any>('/bg-ref/available-withdrawal')
}

const getTraditionalReferralRewards = async (): Promise<any> => {
  return apiCall<any>('/bg-ref/traditional-referral-rewards')
}

// Mock data for withdrawal features
const mockAvailableWithdrawal = {
  totalUSD: 2500.75,
  totalSOL: 42.15,
  breakdown: {
    walletRefRewardsUSD: 500.75,
    walletRefRewardsCount: 12,
    bgAffiliateRewardsUSD: 2000.00,
    bgAffiliateRewardsCount: 45
  }
}

const mockWithdrawHistory = [
  {
    rwh_id: 2,
    rwh_wallet_id: 3253750,
    rwh_amount: "0.000005",
    rwh_hash: null,
    rwh_status: "retry",
    rwh_date: "2025-07-15T09:08:46.146Z",
    rwh_created_at: "2025-07-15T08:38:21.215Z",
    rwh_updated_at: "2025-07-15T08:38:35.701Z"
  },
  {
    rwh_id: 1,
    rwh_wallet_id: 3253750,
    rwh_amount: "0.000000",
    rwh_hash: null,
    rwh_status: "retry",
    rwh_date: "2025-07-15T08:56:46.489Z",
    rwh_created_at: "2025-07-15T08:26:21.538Z",
    rwh_updated_at: "2025-07-15T08:38:35.613Z"
  },
  {
    rwh_id: 3,
    rwh_wallet_id: 3253750,
    rwh_amount: "0.001500",
    rwh_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    rwh_status: "completed",
    rwh_date: "2025-07-14T10:30:00.000Z",
    rwh_created_at: "2025-07-14T10:00:00.000Z",
    rwh_updated_at: "2025-07-14T10:35:00.000Z"
  },
  {
    rwh_id: 4,
    rwh_wallet_id: 3253750,
    rwh_amount: "0.002000",
    rwh_hash: null,
    rwh_status: "pending",
    rwh_date: "2025-07-13T15:20:00.000Z",
    rwh_created_at: "2025-07-13T15:00:00.000Z",
    rwh_updated_at: "2025-07-13T15:00:00.000Z"
  }
]

const mockTraditionalReferralRewards = {
  walletId: 456,
  totalRewards: 500.75,
  rewardsCount: 12,
  walletInfo: {
    solanaAddress: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    nickName: "My Wallet",
    ethAddress: "0x123456789ABCDEF123456789ABCDEF123456789A"
  }
}

// Fallback functions for withdrawal features
export const getAvailableWithdrawalWithFallback = async () => {
  try {
    return await getAvailableWithdrawal()
  } catch (error) {
    return simulateApiCall(mockAvailableWithdrawal)
  }
}

export const getWithdrawHistoryWithFallback = async () => {
  try {
    return await getWithdrawHistory()
  } catch (error) {
    return simulateApiCall(mockWithdrawHistory)
  }
}

export const createWithdrawRequestWithFallback = async () => {
  try {
    return await createWithdrawRequest()
  } catch (error) {
    // Simulate successful withdrawal request
    return simulateApiCall({
      success: true,
      message: "Tạo yêu cầu rút tiền thành công",
      data: {
        withdrawId: 124,
        amountUSD: 2500.75,
        amountSOL: 42.15,
        breakdown: {
          bgAffiliateRewards: 2000.00,
          traditionalReferralRewards: 500.75,
          totalUSD: 2500.75,
          totalSOL: 42.15
        }
      }
    })
  }
}

export const retryWithdrawRequestWithFallback = async (withdrawId: number) => {
  try {
    return await retryWithdrawRequest(withdrawId)
  } catch (error) {
    // Simulate successful retry
    return simulateApiCall({
      success: true,
      message: "Thử lại rút tiền thành công",
      data: {
        withdrawId: withdrawId,
        status: "pending"
      }
    })
  }
}

export const getTraditionalReferralRewardsWithFallback = async () => {
  try {
    return await getTraditionalReferralRewards()
  } catch (error) {
    return simulateApiCall(mockTraditionalReferralRewards)
  }
}

// Export both real and fallback versions
export {
  getCommissionHistory,
  getMyBgAffiliateStatus,
  getBgAffiliateStats,
  getAffiliateTree,
  getDownlineStats,
  updateCommissionPercent,
  updateAlias,
  checkBgAffiliateStatus,
  checkBgAffiliateStatusWithToken,
  // Withdrawal APIs
  createWithdrawRequest,
  retryWithdrawRequest,
  getWithdrawHistory,
  getAvailableWithdrawal,
  getTraditionalReferralRewards,
}
