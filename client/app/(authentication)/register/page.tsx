import RegisterForm from "./register-form"
import { getDictionary } from "@/locales/dictionary"

export default async function Page() {
  const dict = await getDictionary()

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{dict.signup.title}</h1>
            <p className="text-muted-foreground">{dict.signup.description}</p>
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-primary flex items-center justify-center">
          <div className="text-center text-primary-foreground px-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to Yapa Hub</h2>
            <p className="mb-6">
              Join our customer experience platform and harness the power of Artificial Intelligence to transform your
              business.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

