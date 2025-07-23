"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { ArrowRight, Users, Shield, Zap, Star, Play, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
}

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Enterprise-grade security ensuring patient data protection and regulatory compliance.",
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Advanced machine learning algorithms provide actionable insights for better patient outcomes.",
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Access to AI experts from Google and Chief Medical Officers from major health systems.",
    },
  ]

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      organization: "Metropolitan Health System",
      content:
        "ClinicAgent has revolutionized how we approach patient care. The AI insights have improved our diagnostic accuracy by 40%.",
      rating: 5,
    },
    {
      name: "Dr. Michael Chen",
      role: "Emergency Physician",
      organization: "City General Hospital",
      content:
        "The real-time decision support has been invaluable in our emergency department. It's like having a specialist available 24/7.",
      rating: 5,
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Family Medicine",
      organization: "Community Health Center",
      content:
        "Our patient satisfaction scores have increased significantly since implementing ClinicAgent's AI solutions.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      {/* Navigation */}
      <div className="inset-0 top-5 fixed z-10">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto pd-20 mt-4 flex max-w-6xl items-center justify-between rounded-full bg-gray-900/95 backdrop-blur-sm p-3 px-6 shadow-xl"
        >
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
              <span className="text-sm font-bold text-white">AI</span>
            </div>
            <span className="text-xl font-bold text-white">ClinicAgent</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <motion.a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
            >
              Features
            </motion.a>
            <motion.a
              href="#testimonials"
              className="text-gray-300 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
            >
              Testimonials
            </motion.a>
            <motion.a href="#about" className="text-gray-300 hover:text-white transition-colors" whileHover={{ y: -2 }}>
              About
            </motion.a>
          </div>

          <Link href="/signup">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
        </motion.nav>
      </div>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-4 py-[8rem]">
        <motion.div
          className="text-center"
          variants={staggerContainer}
          initial="initial"
          animate={isVisible ? "animate" : "initial"}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 shadow-sm">
              <Zap className="mr-2 h-4 w-4" />
              AI-Powered Healthcare Solutions
            </span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="mb-6 text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
            Transform Healthcare with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 leading-relaxed">
            Empower your medical practice with cutting-edge AI technology. Get expert insights from Google AI
            specialists and Chief Medical Officers from leading health systems.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
                  Request Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
            >
              <Play className="h-5 w-5" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Hero Image/Video Placeholder */}
          <motion.div variants={scaleIn} className="relative mx-auto max-w-4xl">
            <div className="relative rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-1 shadow-2xl">
              <div className="rounded-xl bg-white p-8">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                    <p className="text-gray-600 font-medium">Watch ClinicAgent in Action</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.section
          id="features"
          className="py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Why Choose ClinicAgent?
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Advanced AI technology meets healthcare expertise to deliver unprecedented results
            </motion.p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          id="testimonials"
          className="py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Trusted by Healthcare Leaders
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              See what medical professionals are saying about ClinicAgent
            </motion.p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-blue-600 font-medium">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.organization}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 p-12 text-center shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Practice?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare professionals who are already using AI to improve patient outcomes and
              streamline operations.
            </p>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl hover:bg-gray-50 transition-all duration-300">
                  Get Started Today
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                <span className="text-sm font-bold">AI</span>
              </div>
              <span className="text-xl font-bold">ClinicAgent</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 ClinicAgent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}