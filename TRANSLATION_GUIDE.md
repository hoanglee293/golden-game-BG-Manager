# Translation System Guide

## Overview

This application supports 4 languages:
- **English (en)** - Default language
- **Vietnamese (vi)** - Tiếng Việt
- **Korean (kr)** - 한국어
- **Japanese (jp)** - 日本語

## File Structure

```
app/lang/
├── index.ts                 # Main language configuration
├── LangProvider.tsx         # React context provider
├── useLang.tsx             # Custom hooks for translations
├── LangChange.tsx          # Language switcher component
├── README.md               # Language detection documentation
└── locales/
    ├── en.json             # English translations
    ├── vi.json             # Vietnamese translations
    ├── kr.json             # Korean translations
    └── jp.json             # Japanese translations
```

## Usage

### 1. Basic Translation

```tsx
import { useLang } from "@/app/lang"

function MyComponent() {
  const { t } = useLang()
  
  return (
    <div>
      <h1>{t("messages.welcome")}</h1>
      <p>{t("common.loading")}</p>
    </div>
  )
}
```

### 2. Translation with Parameters

```tsx
const { t } = useLang()

// In translation file: "Hello {name}, you have {count} messages"
const message = t("greeting", { name: "John", count: 5 })
// Result: "Hello John, you have 5 messages"
```

### 3. Array Translations

```tsx
const { tArray } = useLang()

// In translation file: ["Line 1", "Line 2", "Line 3"]
const lines = tArray("multiline.text")
// Result: ["Line 1", "Line 2", "Line 3"]
```

### 4. Language Switching

```tsx
import { useLang } from "@/app/lang"

function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  
  return (
    <div>
      <button onClick={() => setLang("en")}>English</button>
      <button onClick={() => setLang("vi")}>Tiếng Việt</button>
      <button onClick={() => setLang("kr")}>한국어</button>
      <button onClick={() => setLang("jp")}>日本語</button>
    </div>
  )
}
```

## Translation Keys Structure

### Common UI Elements
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "refresh": "Refresh",
    "copy": "Copy",
    "copied": "Copied!",
    "noData": "No data available",
    "loadingData": "Loading data...",
    "retry": "Retry",
    "confirm": "Confirm",
    "yes": "Yes",
    "no": "No"
  }
}
```

### Authentication
```json
{
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "logoutSuccess": "Logged out successfully",
    "connectWallet": "Connect Wallet",
    "profile": "Profile",
    "settings": "Settings",
    "user": "User",
    "regularUser": "Regular User",
    "bgAffiliate": "BG Affiliate",
    "level": "Level",
    "telegramId": "Telegram ID",
    "email": "Email",
    "wallet": "Wallet",
    "solana": "Solana",
    "ethereum": "Ethereum"
  }
}
```

### Dashboard
```json
{
  "dashboard": {
    "title": "MemePump Affiliate",
    "bgAffiliateDashboard": "BG Affiliate Dashboard",
    "downlineStats": "Downline Statistics",
    "commissionHistory": "Commission History",
    "affiliateStats": "Affiliate Statistics",
    "affiliateTree": "Affiliate Tree",
    "updateCommission": "Update Downline Commission Percentage",
    "myStatus": "My Status"
  }
}
```

### Statistics
```json
{
  "stats": {
    "totalMembers": "Total Members",
    "activeMembers": "Active Members",
    "totalCommission": "Total Commission",
    "pendingCommission": "Pending Commission",
    "totalVolume": "Total Volume",
    "personalVolume": "Personal Volume",
    "teamVolume": "Team Volume",
    "commissionRate": "Commission Rate",
    "level": "Level",
    "status": "Status",
    "active": "Active",
    "inactive": "Inactive",
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected"
  }
}
```

### Commission
```json
{
  "commission": {
    "amount": "Amount",
    "percentage": "Percentage",
    "date": "Date",
    "status": "Status",
    "type": "Type",
    "description": "Description",
    "from": "From",
    "to": "To",
    "updateCommission": "Update Commission",
    "commissionRate": "Commission Rate",
    "newRate": "New Rate",
    "currentRate": "Current Rate",
    "updateSuccess": "Commission updated successfully",
    "updateError": "Failed to update commission",
    "invalidRate": "Invalid commission rate",
    "rateRequired": "Commission rate is required"
  }
}
```

### Affiliate
```json
{
  "affiliate": {
    "tree": "Affiliate Tree",
    "downline": "Downline",
    "upline": "Upline",
    "referrer": "Referrer",
    "referred": "Referred",
    "member": "Member",
    "members": "Members",
    "directReferrals": "Direct Referrals",
    "totalReferrals": "Total Referrals",
    "referralCode": "Referral Code",
    "referralLink": "Referral Link",
    "joinDate": "Join Date",
    "lastActivity": "Last Activity",
    "lastTransaction": "Last Transaction",
    "walletAddress": "Wallet Address",
    "solanaAddress": "Solana Address",
    "ethAddress": "Ethereum Address",
    "copyAddress": "Copy Address",
    "addressCopied": "Address copied to clipboard"
  }
}
```

### Error Messages
```json
{
  "errors": {
    "networkError": "Network error occurred",
    "serverError": "Server error occurred",
    "unauthorized": "Unauthorized access",
    "forbidden": "Access forbidden",
    "notFound": "Resource not found",
    "validationError": "Validation error",
    "invalidInput": "Invalid input",
    "required": "This field is required",
    "invalidFormat": "Invalid format",
    "connectionFailed": "Connection failed",
    "timeout": "Request timeout",
    "unknownError": "Unknown error occurred"
  }
}
```

### Messages
```json
{
  "messages": {
    "welcome": "Welcome to MemePump Affiliate",
    "loginRequired": "Please login to continue",
    "accessDenied": "Access denied. BG Affiliate status required.",
    "sessionExpired": "Your session has expired. Please login again.",
    "dataUpdated": "Data updated successfully",
    "dataDeleted": "Data deleted successfully",
    "dataCreated": "Data created successfully",
    "operationFailed": "Operation failed",
    "pleaseWait": "Please wait...",
    "processing": "Processing...",
    "completed": "Completed",
    "failed": "Failed"
  }
}
```

## Browser Language Detection

The system automatically detects the user's browser language and sets the appropriate language:

- `ko`, `ko-KR` → Korean (kr)
- `en`, `en-US`, `en-GB` → English (en)
- `vi`, `vi-VN` → Vietnamese (vi)
- `ja`, `ja-JP` → Japanese (jp)

## Language Priority

1. **localStorage** - Previously saved language preference
2. **initialLang** - Language passed from props
3. **Browser Language** - Detected from navigator.language
4. **Default** - Korean (kr)

## Adding New Translations

1. Add the translation key to all language files in `app/lang/locales/`
2. Use the key in your component with `t("your.key")`
3. Follow the nested structure for organization

## Demo Page

Visit `/demo` to see all translations in action and test the language switcher.

## Components

### LangSwitcher
A dropdown component for switching languages with flag icons.

### LangChange
A full language selection component with detailed information.

### useLang Hook
Provides:
- `t(key, params?)` - Get translated string
- `tArray(key)` - Get translated array
- `lang` - Current language code
- `setLang(code)` - Change language
- `langConfig` - Language configuration

## Best Practices

1. **Use descriptive keys**: `auth.login` instead of `login`
2. **Group related translations**: All auth-related keys under `auth`
3. **Keep translations consistent**: Use the same key structure across languages
4. **Test all languages**: Ensure translations work in all supported languages
5. **Use parameters for dynamic content**: `t("welcome", { name: userName })`
6. **Handle missing translations gracefully**: The system falls back to the key name

## Troubleshooting

### Translation not showing
- Check if the key exists in all language files
- Verify the key path is correct
- Ensure LangProvider is wrapping your component

### Language not switching
- Check if the language code is valid (en, vi, kr, jp)
- Verify localStorage is working
- Check browser console for errors

### Missing translations
- Add the missing key to all language files
- Use a fallback value in the translation function
- Consider using a translation management system for larger projects 