import LoginForm from "./login-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Page() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-primary flex items-center justify-center">
          <div className="text-center text-primary-foreground px-8">
            <h2 className="text-3xl font-bold mb-4">Sign Up</h2>
            <p className="mb-6">
              Sign up to Yapa Hub to enjoy our customer experience platform. A culture-provoking platform that harnesses
              the power of Artificial Intelligence.
            </p>
            <Button asChild size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              <Link href="/register">Register Now!</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
