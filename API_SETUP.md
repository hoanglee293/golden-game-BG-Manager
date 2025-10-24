# BG Affiliate Dashboard - API Setup Guide

## Tổng quan

Ứng dụng BG Affiliate Dashboard đã được cập nhật để sử dụng API thực tế dựa trên tài liệu API BG Affiliate System. Ứng dụng hỗ trợ cả API thực tế và fallback mock data cho development.

**Tính năng bảo mật:**
- ✅ JWT Authentication cho tất cả API calls
- ✅ Ẩn thông tin nhạy cảm (private keys, passwords)
- ✅ Chỉ hiển thị địa chỉ ví public (Solana/Ethereum)
- ✅ Protected routes cho BG Affiliate users
- ✅ Telegram-based authentication
- ✅ Google OAuth integration

## Cấu hình API

### 1. Environment Variables

Tạo file `.env.local` trong thư mục gốc của dự án:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Telegram Bot Configuration
NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/your_bot_username?start

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 2. API Endpoints

Ứng dụng sử dụng các endpoint sau từ module `bg-ref`:

- `GET /bg-ref/commission-history` - Lịch sử hoa hồng
- `GET /bg-ref/my-bg-affiliate-status` - Trạng thái BG affiliate của tôi
- `GET /bg-ref/bg-affiliate-stats` - Thống kê BG affiliate
- `GET /bg-ref/trees` - Thông tin cây affiliate
- `GET /bg-ref/downline-stats` - Thống kê tuyến dưới
- `PUT /bg-ref/nodes/commission` - Cập nhật phần trăm hoa hồng
- `GET /bg-ref/bg-affiliate-status/:targetWalletId` - Kiểm tra status BG affiliate

### 3. Authentication

Ứng dụng sử dụng JWT Authentication với Telegram và Google OAuth. Token được lấy từ:
- `localStorage.getItem('auth_token')` (persistent)
- `sessionStorage.getItem('auth_token')` (session only)

**Cấu hình Authentication:**

```typescript
// Trong hooks/useAuth.ts (Zustand Store)
const login = async (token?: string) => {
  try {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.setItem("auth_token", "true");
    }
    
    // Call BG Affiliate API to get status
    const bgData = await checkBgAffiliateStatusWithToken();
    
    if (bgData) {
      const userData: User = {
        walletId: bgData.currentWallet?.walletId || 0,
        solanaAddress: bgData.currentWallet?.solanaAddress || '',
        nickName: bgData.currentWallet?.nickName || 'User',
        ethAddress: bgData.currentWallet?.ethAddress || '',
        isBgAffiliate: bgData.isBgAffiliate || false,
        level: bgData.bgAffiliateInfo?.level,
        commissionPercent: bgData.bgAffiliateInfo?.commissionPercent
      };
      
      set({ user: userData, isAuthenticated: true, isLoading: false });
    }
  } catch (error) {
    console.error('Failed to login:', error);
  }
}
```

**Telegram Authentication Flow:**
1. User click "Đăng nhập với Telegram"
2. Redirect đến Telegram Bot với start parameter
3. Bot xử lý authentication và redirect về `/tglogin` với `id` và `code`
4. Frontend gọi `TelegramWalletService.login()` với Telegram data
5. Backend verify và trả về JWT token trong `res.token`
6. Frontend store token trong localStorage
7. Frontend gọi `/bg-ref/my-bg-affiliate-status` để kiểm tra BG Affiliate status
8. Frontend cập nhật user data với BG Affiliate info
9. Frontend gọi `login()` để set user state và redirect

**Google OAuth Flow:**
1. User click "Kết nối qua Google"
2. Redirect đến Google OAuth consent screen
3. User authorize và Google redirect về callback URL
4. Backend xử lý OAuth code và trả về JWT token
5. Frontend store token và sử dụng cho API calls

## Cấu trúc API

### 1. API Layer (`lib/api.ts`)

- **Real API functions**: Gọi trực tiếp đến backend
- **Fallback functions**: Sử dụng mock data khi API fails
- **Type safety**: Sử dụng TypeScript interfaces từ `lib/types.ts`

### 2. TypeScript Interfaces (`lib/types.ts`)

Định nghĩa các interface cho:
- `CommissionEntry` - Lịch sử hoa hồng
- `MyStatusData` - Trạng thái BG affiliate
- `BgAffiliateStatsData` - Thống kê affiliate
- `AffiliateTreeData` - Cây affiliate
- `DownlineStatsData` - Thống kê tuyến dưới

## Sử dụng

### 1. Development Mode

Khi API backend chưa sẵn sàng, ứng dụng sẽ tự động fallback về mock data:

```typescript
// Sử dụng fallback functions
import { getCommissionHistoryWithFallback } from "@/lib/api"

const data = await getCommissionHistoryWithFallback()
```

### 2. Production Mode

Khi API backend đã sẵn sàng, sử dụng real API functions:

```typescript
// Sử dụng real API functions
import { getCommissionHistory } from "@/lib/api"

const data = await getCommissionHistory()
```

## Tính năng mới

### 1. Authentication & Security

- **Telegram-based Login**: Kết nối Telegram Bot để đăng nhập
- **Google OAuth Integration**: Đăng nhập qua Google account
- **JWT Authentication**: Tất cả API calls yêu cầu JWT token
- **Protected Routes**: Chỉ BG Affiliate users mới truy cập được
- **Data Privacy**: Ẩn thông tin nhạy cảm, chỉ hiển thị địa chỉ ví public

### 2. User Interface

- **Header Component**: Hiển thị thông tin user và navigation
- **User Dropdown**: Profile, settings, logout
- **Login Page**: Wallet connection và demo login
- **Unauthorized Page**: Thông báo khi không có quyền truy cập

### 3. Cập nhật phần trăm hoa hồng

Component `UpdateCommission` cho phép:
- Cập nhật phần trăm hoa hồng cho thành viên tuyến dưới trực tiếp
- Validation input (0-100%)
- Toast notifications cho success/error
- Loading states

### 4. Error Handling

- API errors được catch và hiển thị toast notifications
- Fallback tự động về mock data khi API fails
- Console warnings cho debugging

### 5. Type Safety

- Tất cả API responses được type với TypeScript
- Compile-time error checking
- Better IDE support và autocomplete

## Deployment

### 1. Environment Configuration

Đảm bảo set đúng `NEXT_PUBLIC_API_URL` cho production:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### 2. Authentication Setup

Implement authentication system để set token vào localStorage/sessionStorage:

```javascript
// Sau khi login thành công
localStorage.setItem('auth_token', 'your-jwt-token')
```

### 3. CORS Configuration

Đảm bảo backend cho phép CORS từ frontend domain:

```javascript
// Backend CORS config
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}))
```

## Troubleshooting

### 1. API Connection Issues

- Kiểm tra `NEXT_PUBLIC_API_BASE_URL` có đúng không
- Kiểm tra backend server có đang chạy không
- Kiểm tra CORS configuration

### 2. Authentication Issues

- Kiểm tra JWT token có hợp lệ không
- Kiểm tra token có được set đúng trong localStorage không
- Kiểm tra backend JWT validation

### 3. Type Errors

- Chạy `npm run build` để kiểm tra TypeScript errors
- Cập nhật interfaces trong `lib/types.ts` nếu API response thay đổi

## Development Workflow

1. **Setup environment**: Tạo `.env.local` với API URL
2. **Start development**: `npm run dev`
3. **Test with mock data**: Ứng dụng sẽ fallback về mock data
4. **Connect to real API**: Set up backend và authentication
5. **Test real API**: Ứng dụng sẽ sử dụng real API endpoints

## BG Affiliate Integration

**BG Affiliate Status Check:**
- Frontend gọi `/bg-ref/my-bg-affiliate-status` để xác định user có phải BG Affiliate không
- Nếu `isBgAffiliate: true`, user có thể truy cập BG Affiliate dashboard
- Nếu `isBgAffiliate: false`, user bị redirect đến unauthorized page
- Protected routes chỉ cho phép BG Affiliate users truy cập

**User Data Flow:**
1. User đăng nhập qua Telegram/Google
2. JWT token được store trong localStorage
3. Auth context decode token và lấy basic user info
4. **Ngay lập tức** gọi BG Affiliate API để check status và update user data
5. User data được cập nhật với `isBgAffiliate`, `level`, `commissionPercent`
6. User interface hiển thị BG Affiliate level và commission percent
7. Protected routes kiểm tra `user.isBgAffiliate` để cho phép truy cập
8. Nếu `isBgAffiliate: false` → user bị redirect đến unauthorized page

**BG Affiliate API Integration:**
- Function `checkBgAffiliateStatusWithToken()` được gọi ngay sau khi login thành công
- API endpoint: `GET /bg-ref/my-bg-affiliate-status`
- Response bao gồm: `isBgAffiliate`, `currentWallet`, `bgAffiliateInfo`
- User data được cập nhật với thông tin BG Affiliate (level, commission percent)

**API Implementation:**
- Sử dụng `axiosClient` với interceptors tự động thêm Authorization header
- Base URL: `${NEXT_PUBLIC_API_URL}/api/v1`
- Tất cả API calls đều sử dụng axiosClient thay vì fetch
- Error handling và response processing tự động 