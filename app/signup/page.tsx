"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ChevronDown, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { auth, db } from "../../lib/firebaseConfig"
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.5, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
}

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "",
    organization: "",
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

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Session persistence set to local")
      })
      .catch((error) => {
        console.error("Error setting persistence:", error)
      })

    return () => unsubscribe()
  }, [router])

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
      if (!formData.email.trim()) newErrors.email = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    }

    if (step === 2) {
      if (!formData.password.trim()) newErrors.password = "Password is required"
      else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
      if (!formData.role.trim()) newErrors.role = "Role is required"
      if (!formData.organization.trim()) newErrors.organization = "Organization is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
    setErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(2)) return

    setIsLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        role: formData.role,
        organization: formData.organization,
        userId: user?.uid,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "users", user.uid), userData)

      // Success animation before redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error: any) {
      console.error("Error during signup process:", error.message)
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "An account with this email already exists" })
        setCurrentStep(1)
      } else {
        setErrors({ general: `Sign up failed: ${error.message}` })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mb-4 h-12 w-12 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <div className="h-full w-full rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </motion.div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      {/* Navigation */}
      <div className="inset-0 top-5 fixed z-10">
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto flex max-w-6xl items-center justify-between rounded-full bg-gray-900/95 backdrop-blur-sm p-3 px-6 shadow-xl"
          >
            <Link href="/">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                  <span className="text-sm font-bold text-white">AI</span>
                </div>
                <span className="text-xl font-bold text-white">ClinicAgent</span>
              </motion.div>
            </Link>

            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="text-white hover:text-blue-200">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </motion.div>
            </Link>
          </motion.nav>
      </div>

      {/* Main Content */}
      <main className="mx-auto  max-w-2xl px-4 py-[8rem]">
        <motion.div className="text-center mb-8" variants={staggerContainer} initial="initial" animate="animate">
          <motion.h1 variants={fadeInUp} className="mb-4 text-4xl md:text-5xl font-bold text-gray-900">
            Join ClinicAgent
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-lg mx-auto">
            Create your account to access AI-powered healthcare solutions and connect with medical experts.
          </motion.p>

          {/* Progress Indicator */}
          <motion.div variants={fadeInUp} className="flex items-center justify-center mt-8 mb-8">
            <div className="flex items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
                animate={{ scale: currentStep === 1 ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : "1"}
              </motion.div>
              <motion.div
                className={`w-16 h-1 mx-2 ${currentStep >= 2 ? "bg-blue-500" : "bg-gray-200"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: currentStep >= 2 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
                animate={{ scale: currentStep === 2 ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                2
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Form Card */}
        <motion.div variants={scaleIn} initial="initial" animate="animate">
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div key="step1" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Personal Information</h2>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div className="space-y-2" whileFocus={{ scale: 1.02 }}>
                          <Label htmlFor="firstName" className="text-gray-700 font-medium">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="Ex: Jane"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`transition-all duration-300 ${errors.firstName ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                          />
                          {errors.firstName && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm flex items-center gap-1"
                            >
                              <AlertCircle className="h-4 w-4" />
                              {errors.firstName}
                            </motion.p>
                          )}
                        </motion.div>

                        <motion.div className="space-y-2" whileFocus={{ scale: 1.02 }}>
                          <Label htmlFor="lastName" className="text-gray-700 font-medium">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Ex: Smith"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`transition-all duration-300 ${errors.lastName ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                          />
                          {errors.lastName && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm flex items-center gap-1"
                            >
                              <AlertCircle className="h-4 w-4" />
                              {errors.lastName}
                            </motion.p>
                          )}
                        </motion.div>
                      </div>

                      <motion.div className="space-y-2" whileFocus={{ scale: 1.02 }}>
                        <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            placeholder="Ex: 555-555-5555"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={`transition-all duration-300 ${errors.phoneNumber ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                          />
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.phoneNumber && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.phoneNumber}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div className="space-y-2" whileFocus={{ scale: 1.02 }}>
                        <Label htmlFor="email" className="text-gray-700 font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Ex: test@gmail.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={`transition-all duration-300 ${errors.email ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                        />
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.email}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-4">
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 py-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                        >
                          Continue
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="step2" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Professional Details</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div className="space-y-2" whileFocus={{ scale: 1.02 }}>
                        <Label htmlFor="password" className="text-gray-700 font-medium">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a secure password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`pr-12 transition-all duration-300 ${errors.password ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.password}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div className="space-y-2" whileFocus={{ scale: 1.02 }}>
                        <Label htmlFor="role" className="text-gray-700 font-medium">
                          Your Role
                        </Label>
                        <Input
                          id="role"
                          name="role"
                          placeholder="Ex: Physician, Chief Medical Officer, etc"
                          value={formData.role}
                          onChange={handleChange}
                          className={`transition-all duration-300 ${errors.role ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                        />
                        {errors.role && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.role}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div className="space-y-2" whileFocus={{ scale: 1.02 }}>
                        <Label htmlFor="organization" className="text-gray-700 font-medium">
                          Organization Name
                        </Label>
                        <Input
                          id="organization"
                          name="organization"
                          placeholder="Which medical practice or health system do you work at?"
                          value={formData.organization}
                          onChange={handleChange}
                          className={`transition-all duration-300 ${errors.organization ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                        />
                        {errors.organization && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.organization}
                          </motion.p>
                        )}
                      </motion.div>

                      {errors.general && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <p className="text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.general}
                          </p>
                        </motion.div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                          <Button
                            type="button"
                            onClick={handleBack}
                            variant="outline"
                            className="w-full rounded-full py-6 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300 bg-transparent"
                          >
                            Back
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 py-6 text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg disabled:opacity-50"
                          >
                            {isLoading ? (
                              <motion.div
                                className="flex items-center gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <motion.div
                                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                />
                                Creating Account...
                              </motion.div>
                            ) : (
                              "Create Account"
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sign In Link */}
              <motion.div
                className="text-center text-sm mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}