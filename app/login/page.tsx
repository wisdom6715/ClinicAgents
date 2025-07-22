"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import Link from "next/link"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { auth, db } from "../../lib/firebaseConfig"
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            console.log("User authenticated, redirecting to dashboard")
            router.push("/dashboard")
          } else {
            console.log("User authenticated but needs to complete profile")
          }
        } catch (error) {
          console.error("Error checking user profile:", error)
        }
      }
      setIsCheckingAuth(false)
    })
    
    // Setup persistence
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Session persistence set to local')
      })
      .catch((error) => {
        console.error('Error setting persistence:', error)
      })
      
    // Clean up subscription
    return () => unsubscribe()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setIsLoading(true)
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      console.log("Signed in successfully!")
      
      // Redirect to dashboard
      router.push("/dashboard")
      
    } catch (error: any) {
      console.error("Error during signin process:", error.message)
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        alert("Invalid email or password. Please try again.")
      } else {
        alert(`Sign in failed: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 bg-cover">
      {/* Navigation */}
      <nav className="mx-auto mt-2 flex max-w-6xl items-center justify-between rounded-full bg-gray-900 p-3 px-6">
        <div className="flex items-center gap-2">
          <div className={
                  "flex items-center gap-2"
                }>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                    <span className="text-sm font-bold">AI</span>
                  </div>
                  <span className="text-lg font-semibold text-white">ClinicAgent</span>
                </div>
        </div>
        <div className="flex items-center gap-8">
          <Button className="rounded-full bg-blue-500 px-6 hover:bg-blue-600">Get Started</Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Sign In</h1>
        <p className="mx-auto mb-12 max-w-2xl text-gray-700">
          Create an account to request a demo. Upon request, we can have AI experts from companies like Google, and Chief Medical Officers from major health systems available for your call.
        </p>

        {/* Form */}
        <div className="mx-auto max-w-2xl rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2 text-left">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ex: test@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
            </div>

            {/* Password */}
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full rounded-full bg-blue-500 py-6 text-lg font-medium hover:bg-blue-600 md:w-auto md:px-12"
                disabled={isLoading}
              >
                {isLoading ? "Loading...." : "Sign In"}
              </Button>
            </div>
            
            {/* Sign Up Link */}
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}