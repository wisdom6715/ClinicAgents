"use client"

import { useState, useEffect } from "react"
import {
  Phone,
  Bell,
  ArrowLeft,
  Calendar,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import SideNav from "../../components/sideNav"
import { cn } from "@/lib/utils"
import Link from "next/link"
import useHospital from "@/services/useFetchCompany"
import { auth } from '@/lib/firebaseConfig'
import { onAuthStateChanged, User } from 'firebase/auth'
import axios, { AxiosError } from 'axios'

interface FormDataType {
  agent_name: string;
  agent_description: string;
  agent_type: string;
  channels: {
    sms: boolean;
    voice: boolean;
  };
  greeting_message: string;
  reminder_template: string;
  tone: string;
  follow_up: boolean;
  deployment: string;
  base_models: string;
  agent_specialty: string;
}

export default function MedicalReminderSetup() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [registrationError, setRegistrationError] = useState("")
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<FormDataType>({
    agent_name: "Medication Reminder Assistant",
    agent_description: "Helps patients keep track of their medication schedule with timely reminders and dosage information.",
    agent_type: "medication",
    channels: {
      sms: true,
      voice: true
    },
    greeting_message: "Hello! I'm your medication reminder assistant. I'll help you keep track of your medications and send you timely reminders.",
    reminder_template: "Hi [Patient Name], it's time to take your [Medication Name] ([Dosage]). Please remember to take it with food/water as directed.",
    tone: "friendly",
    follow_up: true,
    deployment: "immediate",
    base_models: "gpt-4-turbo", // Default model
    agent_specialty: "healthcare"
  })
    
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
    
  const { hospital } = useHospital({
    userId: user?.uid,
  });
  
  const totalSteps = 4

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChannelToggle = (channel: keyof FormDataType['channels'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }))
  }

  const handleDeployAgent = async () => {
    if (!hospital?.id) {
      setRegistrationError("Hospital ID is missing")
      return
    }

    setIsLoading(true)
    setRegistrationError("")

    try {
      const payload = {
        hospital_id: hospital.id,
        agent_name: formData.agent_name,
        agent_description: formData.agent_description,
        agent_type: formData.agent_type,
        base_models: formData.base_models,
        agent_specialty: formData.agent_specialty
      }

      const response = await axios.post('http://localhost:3030/registration/agent', payload)
      setRegistrationSuccess(true)
      console.log("Agent registered successfully:", response.data)
    } catch (error) {
      console.error("Error registering agent:", error)
      const axiosError = error as AxiosError
      setRegistrationError(
        axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data
          ? String(axiosError.response.data.error)
          : "Failed to register agent"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Same as dashboard */}
      <SideNav />

      {/* Main Content - Medical Reminder Setup */}
      <div className="flex-1 overflow-auto">
        <header className="flex h-14 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <span className="font-medium">{hospital?.organization}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Feedback
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
              <span className="text-sm font-medium">PP</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-6">
            <Button variant="ghost" className="mb-2 flex items-center gap-1 text-muted-foreground" asChild>
              <Link href="/templates">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Templates</span>
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Medical Reminder Agent Setup</h1>
                <p className="text-muted-foreground">Configure your medication reminder assistant</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={cn("h-2 w-8 rounded-full", i + 1 <= currentStep ? "bg-orange-500" : "bg-muted")}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Provide basic details about your medical reminder agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    placeholder="e.g., Medication Reminder Assistant"
                    value={formData.agent_name}
                    onChange={(e) => handleInputChange('agent_name', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This name will be displayed to users when they interact with your agent
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-description">Description</Label>
                  <Textarea
                    id="agent-description"
                    placeholder="Describe what your agent does..."
                    value={formData.agent_description}
                    onChange={(e) => handleInputChange('agent_description', e.target.value)}
                    className="min-h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Agent Type</Label>
                  <RadioGroup 
                    value={formData.agent_type} 
                    onValueChange={(value) => handleInputChange('agent_type', value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="medication" id="medication" className="peer sr-only" />
                      <Label
                        htmlFor="medication"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                      >
                        <Bell className="mb-3 h-6 w-6 text-orange-500" />
                        <div className="text-center">
                          <p className="font-medium">Medication Reminder</p>
                          <p className="text-sm text-muted-foreground">Track medications and dosages</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="appointment" id="appointment" className="peer sr-only" />
                      <Label
                        htmlFor="appointment"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                      >
                        <Calendar className="mb-3 h-6 w-6 text-orange-500" />
                        <div className="text-center">
                          <p className="font-medium">Appointment Reminder</p>
                          <p className="text-sm text-muted-foreground">Track medical appointments</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                  Back
                </Button>
                <Button onClick={handleNext}>Continue</Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Reminder Configuration */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Reminder Configuration</CardTitle>
                <CardDescription>Configure how your agent will send reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Reminder Channels</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-orange-100 p-2 text-orange-500">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">Send reminders via text message</p>
                        </div>
                      </div>
                      <Switch 
                        checked={formData.channels.sms} 
                        onCheckedChange={(checked) => handleChannelToggle('sms', checked)} 
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-orange-100 p-2 text-orange-500">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Voice Call</p>
                          <p className="text-sm text-muted-foreground">Call patients to remind them</p>
                        </div>
                      </div>
                      <Switch 
                        checked={formData.channels.voice} 
                        onCheckedChange={(checked) => handleChannelToggle('voice', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext}>Continue</Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 3: Personalization */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Personalization</CardTitle>
                <CardDescription>Customize how your agent interacts with users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="greeting-message">Greeting Message</Label>
                  <Textarea
                    id="greeting-message"
                    placeholder="Enter a greeting message..."
                    value={formData.greeting_message}
                    onChange={(e) => handleInputChange('greeting_message', e.target.value)}
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-message">Reminder Message Template</Label>
                  <Textarea
                    id="reminder-message"
                    placeholder="Enter a reminder message template..."
                    value={formData.reminder_template}
                    onChange={(e) => handleInputChange('reminder_template', e.target.value)}
                    className="min-h-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use [Patient Name], [Medication Name], [Dosage], and [Time] as placeholders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tone of Voice</Label>
                  <RadioGroup 
                    value={formData.tone} 
                    onValueChange={(value) => handleInputChange('tone', value)}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="friendly" id="friendly" className="peer sr-only" />
                      <Label
                        htmlFor="friendly"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Friendly</p>
                          <p className="text-sm text-muted-foreground">Warm and conversational</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="professional" id="professional" className="peer sr-only" />
                      <Label
                        htmlFor="professional"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Professional</p>
                          <p className="text-sm text-muted-foreground">Clear and clinical</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="motivational" id="motivational" className="peer sr-only" />
                      <Label
                        htmlFor="motivational"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Motivational</p>
                          <p className="text-sm text-muted-foreground">Encouraging and supportive</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="follow-up">Follow-up Confirmations</Label>
                    <Switch 
                      id="follow-up" 
                      checked={formData.follow_up}
                      onCheckedChange={(checked) => handleInputChange('follow_up', checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Ask users to confirm they've taken their medication</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext}>Continue</Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 4: Review & Deploy */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Deploy</CardTitle>
                <CardDescription>Review your agent configuration and deploy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border">
                  <div className="border-b bg-muted/50 p-4">
                    <h3 className="font-semibold">Agent Summary</h3>
                  </div>
                  <div className="p-4">
                    <dl className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Name</dt>
                        <dd className="col-span-2">{formData.agent_name}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Type</dt>
                        <dd className="col-span-2">
                          {formData.agent_type === "medication" ? "Medication Reminder" : "Appointment Reminder"}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Channels</dt>
                        <dd className="col-span-2">
                          {[
                            formData.channels.sms && "SMS",
                            formData.channels.voice && "Voice call"
                          ].filter(Boolean).join(", ")}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Tone</dt>
                        <dd className="col-span-2 capitalize">{formData.tone}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {registrationError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                      <div>
                        <h4 className="font-semibold text-red-700">Error</h4>
                        <p className="text-sm text-red-700">{registrationError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {registrationSuccess && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-green-700">Success</h4>
                        <p className="text-sm text-green-700">Agent was successfully registered!</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold text-orange-700">Before you deploy</h4>
                      <p className="text-sm text-orange-700">
                        This agent will need access to patient medication data. Make sure you have the necessary
                        permissions and data connections set up.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deployment Options</Label>
                  <RadioGroup 
                    value={formData.deployment}
                    onValueChange={(value) => handleInputChange('deployment', value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="immediate" id="immediate" className="peer sr-only" />
                      <Label
                        htmlFor="immediate"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Deploy Now</p>
                          <p className="text-sm text-muted-foreground">Make the agent available immediately</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="scheduled" id="scheduled" className="peer sr-only" />
                      <Label
                        htmlFor="scheduled"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Schedule Deployment</p>
                          <p className="text-sm text-muted-foreground">Set a specific date and time</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleDeployAgent} 
                  disabled={isLoading || registrationSuccess}
                >
                  {isLoading ? "Deploying..." : "Deploy Agent"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}