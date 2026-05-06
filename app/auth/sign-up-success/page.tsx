import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Shield, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="relative">
              <Shield className="w-12 h-12 text-primary" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-success animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              SilentShield<span className="text-primary">AI</span>
            </h1>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                Check Your Email
              </CardTitle>
              <CardDescription>
                We&apos;ve sent you a confirmation link
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email inbox and click the confirmation link to activate your SilentShield account.
              </p>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or contact support.
                </p>
              </div>
              <Link 
                href="/auth/login"
                className="block w-full py-2.5 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Back to Sign In
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
