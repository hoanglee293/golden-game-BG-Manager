"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLang } from "@/app/lang"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { t } = useLang()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-red-200">
          <CardHeader className="text-center flex flex-col items-center gap-2">
            <img src="/logo.png" alt="logo" className="rounded-lg w-16 h-16" />
            <CardTitle className="text-2xl text-red-800">{t("unauthorized.title")}</CardTitle>
            <CardDescription className="text-red-600">
              {t("unauthorized.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{t("unauthorized.onlyForBG")}</span>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">{t("unauthorized.howToTitle")}</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>{t("unauthorized.howTo1")}</li>
                  <li>{t("unauthorized.howTo2")}</li>
                  <li>{t("unauthorized.howTo3")}</li>
                  <li>{t("unauthorized.howTo4")}</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("unauthorized.back")}
              </Button>
              <Button 
                onClick={() => router.push('/login')}
                className="flex-1"
              >
                {t("unauthorized.loginOther")}
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>{t("unauthorized.ifError")}</p>
              <p>
                <a href="mailto:support@bg-affiliate.com" className="text-primary hover:underline">
                  {t("unauthorized.contactSupport")}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 