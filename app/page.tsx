"use client"

import Header from "@/components/header"
import BgAffiliateDashboard from "@/components/bg-affiliate-dashboard"
import ProtectedRoute from "@/components/protected-route"

export default function HomePage() {
  return (
    <ProtectedRoute >
      <div className="h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex">
          <BgAffiliateDashboard />
        </main>
      </div>
    </ProtectedRoute>
  )
}
