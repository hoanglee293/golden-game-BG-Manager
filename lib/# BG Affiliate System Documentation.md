# BG Affiliate System Documentation

## Tổng quan
Hệ thống BG (Big Guy) Affiliate cho phép quản lý cấu trúc affiliate đa cấp với commission phân cấp. Mỗi BG có thể tạo cây affiliate riêng và quản lý commission của các thành viên trong tuyến dưới.

## Cấu trúc Database

### Bảng `bg_affiliate_trees`
- `bat_id`: ID duy nhất của cây affiliate
- `bat_root_wallet_id`: ID của wallet root BG (sở hữu cây)
- `bat_total_commission_percent`: Tổng commission mà root BG nhận được (mặc định 70%)
- `bat_created_at`: Thời gian tạo cây

### Bảng `bg_affiliate_nodes`
- `ban_id`: ID duy nhất của node
- `ban_tree_id`: Tham chiếu đến cây affiliate
- `ban_wallet_id`: ID của wallet thành viên
- `ban_parent_wallet_id`: ID của wallet giới thiệu trực tiếp
- `ban_commission_percent`: Phần trăm commission mà node nhận được
- `ban_status`: Trạng thái hoạt động của node (TRUE = active, FALSE = inactive)
- `ban_effective_from`: Thời gian node có hiệu lực



```http
POST /admin/bg-affiliate/nodes
Content-Type: application/json

{
  "treeId": 1,
  "walletId": 1002,
  "parentWalletId": 1001,
  "commissionPercent": 35.00
}
```





### User APIs

#### 1. Cập nhật commission percent của node con
```http
PUT /bg-ref/nodes/commission
Content-Type: application/json

{
  "toWalletId": 1002,
  "newPercent": 30.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật commission percent thành công",
  "fromWallet": {
    "walletId": 1001,
    "solanaAddress": "ABC123...",
    "nickName": "BG001",
    "ethAddress": "0x123..."
  },
  "toWallet": {
    "walletId": 1002,
    "solanaAddress": "DEF456...",
    "nickName": "Member001",
    "ethAddress": "0x456..."
  },
  "oldPercent": 35.00,
  "newPercent": 30.00
}
```

#### 2. Lấy thông tin BG affiliate của wallet hiện tại
```http
GET /bg-ref/my-bg-affiliate-status
```

**Response:**
```json
{
  "isBgAffiliate": true,
  "currentWallet": {
    "walletId": 1001,
    "solanaAddress": "ABC123...",
    "nickName": "BG001",
    "ethAddress": "0x123..."
  },
  "bgAffiliateInfo": {
    "treeId": 1,
    "parentWalletId": null,
    "commissionPercent": 70.00,
    "level": 0
  }
}
```

#### 3. Lấy cây affiliate của wallet hiện tại
```http
GET /bg-ref/trees
```

**Response:**
```json
{
  "isBgAffiliate": true,
  "treeInfo": {
    "treeId": 1,
    "referrer": null,
    "totalCommissionPercent": 70.00,
    "createdAt": "2024-01-01T10:00:00Z"
  },
  "downlineNodes": [
    {
      "nodeId": 2,
      "solanaAddress": "DEF456...",
      "commissionPercent": 35.00,
      "effectiveFrom": "2024-01-01T11:00:00Z",
      "level": 1,
      "walletInfo": {
        "nickName": "Member001",
        "solanaAddress": "DEF456...",
        "ethAddress": "0x456..."
      }
    }
  ]
}
```

## Logic tính toán hoa hồng

### Quy tắc tính toán:
1. **Chỉ tính cho tuyến trên**: Khi có giao dịch, chỉ tính commission cho các node trong tuyến trên của trader
2. **Chỉ tính cho nodes active**: Chỉ tính commission cho các node có `ban_status = true`
3. **Commission phân cấp**: Mỗi node nhận commission theo `ban_commission_percent` của mình

### Ví dụ:
```
Root BG (Wallet 1001): 70% commission
├── Level 1 (Wallet 1002): 35% commission (status: true)
│   └── Level 2 (Wallet 1003): 17.5% commission ← Trader thực hiện giao dịch $1000
```

**Kết quả tính toán:**
- **Wallet 1002**: `$1000 × 1% × 35% = $3.50`
- **Wallet 1001 (Root BG)**: `$1000 × 1% × 70% = $7.00`

## Quy tắc validation

### 1. Commission percent:
- Phải từ 0 đến 100
- Không được vượt quá commission của parent
- Root BG có thể set bất kỳ commission nào nếu không có tuyến dưới

### 2. Trạng thái node:
- Root BG không thể bị tắt trạng thái (`ban_status = false`)
- Nodes bị tắt sẽ không nhận commission
- Nodes bị tắt sẽ không xuất hiện trong các API lấy thông tin

### 3. Quan hệ parent-child:
- Mỗi node chỉ có 1 parent
- Root node có `ban_parent_wallet_id = null`
- Không được tạo cycle trong quan hệ

## Migration

### Thêm trường ban_status:
```sql
-- Thêm trường ban_status với giá trị mặc định là TRUE (active)
ALTER TABLE bg_affiliate_nodes 
ADD COLUMN ban_status BOOLEAN NOT NULL DEFAULT TRUE;

-- Thêm comment để giải thích trường này
COMMENT ON COLUMN bg_affiliate_nodes.ban_status IS 'Trạng thái hoạt động của node: TRUE = active, FALSE = inactive';

-- Tạo index để tối ưu truy vấn theo trạng thái
CREATE INDEX idx_bg_affiliate_nodes_status ON bg_affiliate_nodes(ban_status);

-- Tạo index composite để tối ưu truy vấn theo tree_id và status
CREATE INDEX idx_bg_affiliate_nodes_tree_status ON bg_affiliate_nodes(ban_tree_id, ban_status);
``` 