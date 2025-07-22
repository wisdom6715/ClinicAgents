"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { ChevronDown, Link as iconLink} from "lucide-react"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Link from "next/link"

import { auth, db } from "../../lib/firebaseConfig"
import { 
  createUserWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

export default function RequestDemo() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "",
    organization: ""
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            console.log("User already registered, redirecting to dashboard")
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

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setIsLoading(true)
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      console.log("Account created successfully!")
      
      // Save user data to Firestore
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        role: formData.role,
        organization: formData.organization,
        userId: user?.uid,
        createdAt: new Date().toISOString()
      }
      
      await setDoc(doc(db, "users", user.uid), userData)
      console.log("User profile saved to database")
      
      // Redirect to dashboard
      router.push("/dashboard")
      
    } catch (error: any) {
      console.error("Error during signup process:", error.message)
      if (error.code === "auth/email-already-in-use") {
        alert("An account with this email already exists. Please sign in instead.")
      } else {
        alert(`Sign up failed: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading indicator while checking auth state
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
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Sign Up</h1>
        <p className="mx-auto mb-12 max-w-2xl text-gray-700">
          Create an account to request a demo. Upon request, we can have AI experts from companies like Google, and Chief Medical Officers from major health systems available for your call.
        </p>

        {/* Form */}
        <div className="mx-auto max-w-2xl rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* First Name */}
              <div className="space-y-2 text-left">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Ex: Jane"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2 text-left">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Ex: Smith"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2 text-left">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="Ex: 555-555-5555"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

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
            </div>

            {/* Password */}
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {/* Your Role */}
            <div className="space-y-2 text-left">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                name="role"
                placeholder="Ex: Physician, Chief Medical Officer, etc"
                value={formData.role}
                onChange={handleChange}
                required
              />
            </div>

            {/* Organization Name */}
            <div className="space-y-2 text-left">
              <Label htmlFor="organization">Organization Name</Label>
              <Input
                id="organization"
                name="organization"
                placeholder="Which medical practice or health system do you work at?"
                value={formData.organization}
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
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </div>
            
            {/* Sign In Link */}
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}