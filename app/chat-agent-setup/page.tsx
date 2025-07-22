"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  FileIcon,
  Upload,
  AlertCircle,
  HelpCircle,
  Stethoscope,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

import SideNav from "../../components/sideNav"
import { cn } from "@/lib/utils"
import Link from "next/link"

import useHospital from "@/services/useFetchCompany"
import { auth } from '@/lib/firebaseConfig'

import { onAuthStateChanged, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'

// Define the form data interface
interface FormData {
  agent_name: string;
  agent_description: string;
  agent_type: string;
  base_models: string;
  agent_specialty: string[];
  knowledge_sources: {
    medical_guidelines: boolean;
    custom_knowledge: boolean;
  };
  response_style: string;
  settings: {
    citations: boolean;
    disclaimers: boolean;
    emergency_detection: boolean;
  };
  greeting_message: string;
  deployment_option: string;
}

export default function MedicalChatSetup() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formData, setFormData] = useState<FormData>({
    agent_name: "Patient Support Assistant",
    agent_description: "Answers common medical questions and provides guidance on non-emergency health concerns.",
    agent_type: "chat",
    base_models: "gpt4",
    agent_specialty: ["general", "cardiology"],
    knowledge_sources: {
      medical_guidelines: true,
      custom_knowledge: false
    },
    response_style: "balanced",
    settings: {
      citations: true,
      disclaimers: true,
      emergency_detection: true
    },
    greeting_message: "Hello! I'm your medical support assistant. I can answer questions about common health concerns and provide general medical information. Please note that I'm not a replacement for professional medical advice.",
    deployment_option: "immediate"
  })

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

  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const { hospital } = useHospital({
    userId: user?.uid,
  });

  // Input change handlers
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleSpecialtyToggle = (specialty: string, checked: boolean) => {
    let updatedSpecialties = [...formData.agent_specialty]

    if (checked && !updatedSpecialties.includes(specialty)) {
      updatedSpecialties.push(specialty)
    } else if (!checked && updatedSpecialties.includes(specialty)) {
      updatedSpecialties = updatedSpecialties.filter(item => item !== specialty)
    }

    setFormData({
      ...formData,
      agent_specialty: updatedSpecialties
    })
  }

  const handleSettingsChange = (setting: keyof FormData['settings'], value: boolean) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [setting]: value
      }
    })
  }

  const handleKnowledgeSourceChange = (source: keyof FormData['knowledge_sources'], value: boolean) => {
    setFormData({
      ...formData,
      knowledge_sources: {
        ...formData.knowledge_sources,
        [source]: value
      }
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      // Prepare data for API
      const apiData = {
        hospital_id: hospital?.id || '',
        agent_name: formData.agent_name,
        agent_description: formData.agent_description,
        agent_type: formData.agent_type,
        base_models: formData.base_models,
        agent_specialty: formData.agent_specialty
      }

      const response = await fetch('http://localhost:3030/registration/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register agent')
      }

      // Success! Redirect to appropriate page
      router.push('/agents')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Same as dashboard */}
      <SideNav />

      {/* Main Content - Medical Chat Setup */}
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
                <h1 className="text-2xl font-bold">Medical Chat Agent Setup</h1>
                <p className="text-muted-foreground">Configure your medical support assistant</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={cn("h-2 w-8 rounded-full", i + 1 <= currentStep ? "bg-blue-500" : "bg-muted")}
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
                <CardDescription>Provide basic details about your medical chat agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    placeholder="e.g., Patient Support Assistant"
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
                      <RadioGroupItem value="support" id="support" className="peer sr-only" />
                      <Label
                        htmlFor="support"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                      >
                        <HelpCircle className="mb-3 h-6 w-6 text-blue-500" />
                        <div className="text-center">
                          <p className="font-medium">Patient Support</p>
                          <p className="text-sm text-muted-foreground">Answer questions and provide guidance</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="information" id="information" className="peer sr-only" />
                      <Label
                        htmlFor="information"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                      >
                        <Stethoscope className="mb-3 h-6 w-6 text-blue-500" />
                        <div className="text-center">
                          <p className="font-medium">Medical Information</p>
                          <p className="text-sm text-muted-foreground">Provide evidence-based information</p>
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

          {/* Step 2: Knowledge Base */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>Configure the knowledge sources for your medical chat agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Knowledge Sources</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-blue-100 p-2 text-blue-500">
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Medical Guidelines</p>
                          <p className="text-sm text-muted-foreground">Standard medical guidelines and protocols</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.knowledge_sources.medical_guidelines}
                        onCheckedChange={(checked) => handleKnowledgeSourceChange('medical_guidelines', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-blue-100 p-2 text-blue-500">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Custom Knowledge Base</p>
                          <p className="text-sm text-muted-foreground">Upload your own medical information</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.knowledge_sources.custom_knowledge}
                        onCheckedChange={(checked) => handleKnowledgeSourceChange('custom_knowledge', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Medical Specialties</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="general"
                        checked={formData.agent_specialty.includes('general')}
                        onCheckedChange={(checked) => handleSpecialtyToggle('general', checked === true)}
                      />
                      <Label htmlFor="general">General Medicine</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cardiology"
                        checked={formData.agent_specialty.includes('cardiology')}
                        onCheckedChange={(checked) => handleSpecialtyToggle('cardiology', checked === true)}
                      />
                      <Label htmlFor="cardiology">Cardiology</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dermatology"
                        checked={formData.agent_specialty.includes('dermatology')}
                        onCheckedChange={(checked) => handleSpecialtyToggle('dermatology', checked === true)}
                      />
                      <Label htmlFor="dermatology">Dermatology</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pediatrics"
                        checked={formData.agent_specialty.includes('pediatrics')}
                        onCheckedChange={(checked) => handleSpecialtyToggle('pediatrics', checked === true)}
                      />
                      <Label htmlFor="pediatrics">Pediatrics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="neurology"
                        checked={formData.agent_specialty.includes('neurology')}
                        onCheckedChange={(checked) => handleSpecialtyToggle('neurology', checked === true)}
                      />
                      <Label htmlFor="neurology">Neurology</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="orthopedics"
                        checked={formData.agent_specialty.includes('orthopedics')}
                        onCheckedChange={(checked) => handleSpecialtyToggle('orthopedics', checked === true)}
                      />
                      <Label htmlFor="orthopedics">Orthopedics</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model-selection">AI Model Selection</Label>
                  <Select
                    value={formData.base_models}
                    onValueChange={(value) => handleInputChange('base_models', value)}
                  >
                    <SelectTrigger id="model-selection">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4">GPT-4 (Recommended for medical)</SelectItem>
                      <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude">Claude 3</SelectItem>
                      <SelectItem value="custom">Custom Medical Model</SelectItem>
                    </SelectContent>
                  </Select>
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

          {/* Step 3: Conversation Settings */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Conversation Settings</CardTitle>
                <CardDescription>Configure how your agent interacts with users</CardDescription>
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
                  <Label>Response Style</Label>
                  <RadioGroup
                    value={formData.response_style}
                    onValueChange={(value) => handleInputChange('response_style', value)}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="concise" id="concise" className="peer sr-only" />
                      <Label
                        htmlFor="concise"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Concise</p>
                          <p className="text-sm text-muted-foreground">Brief, to-the-point answers</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="balanced" id="balanced" className="peer sr-only" />
                      <Label
                        htmlFor="balanced"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Balanced</p>
                          <p className="text-sm text-muted-foreground">Moderate detail and clarity</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="detailed" id="detailed" className="peer sr-only" />
                      <Label
                        htmlFor="detailed"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Detailed</p>
                          <p className="text-sm text-muted-foreground">Comprehensive explanations</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="citations">Include Citations</Label>
                      <p className="text-sm text-muted-foreground">Reference medical sources in responses</p>
                    </div>
                    <Switch
                      id="citations"
                      checked={formData.settings.citations}
                      onCheckedChange={(checked) => handleSettingsChange('citations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="disclaimers">Medical Disclaimers</Label>
                      <p className="text-sm text-muted-foreground">Include appropriate medical disclaimers</p>
                    </div>
                    <Switch
                      id="disclaimers"
                      checked={formData.settings.disclaimers}
                      onCheckedChange={(checked) => handleSettingsChange('disclaimers', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emergency">Emergency Detection</Label>
                      <p className="text-sm text-muted-foreground">Detect potential emergencies and provide guidance</p>
                    </div>
                    <Switch
                      id="emergency"
                      checked={formData.settings.emergency_detection}
                      onCheckedChange={(checked) => handleSettingsChange('emergency_detection', checked)}
                    />
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
                        <dd className="col-span-2">{formData.agent_type === 'support' ? 'Patient Support' : 'Medical Information'}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Knowledge Sources</dt>
                        <dd className="col-span-2">
                          {[
                            formData.knowledge_sources.medical_guidelines ? 'Medical Guidelines' : null,
                            formData.knowledge_sources.custom_knowledge ? 'Custom Knowledge Base' : null
                          ].filter(Boolean).join(', ')}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Specialties</dt>
                        <dd className="col-span-2">
                          {formData.agent_specialty.map(specialty =>
                            specialty.charAt(0).toUpperCase() + specialty.slice(1)
                          ).join(', ')}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">AI Model</dt>
                        <dd className="col-span-2">{formData.base_models}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Response Style</dt>
                        <dd className="col-span-2">{formData.response_style.charAt(0).toUpperCase() + formData.response_style.slice(1)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                      <div>
                        <h4 className="font-semibold text-red-700">Error</h4>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-semibold text-blue-700">Important Notice</h4>
                      <p className="text-sm text-blue-700">
                        This agent will provide general medical information but should not be used for diagnosing
                        conditions or replacing professional medical advice. Make sure users understand these
                        limitations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deployment Options</Label>
                  <RadioGroup
                    value={formData.deployment_option}
                    onValueChange={(value) => handleInputChange('deployment_option', value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="immediate" id="immediate" className="peer sr-only" />
                      <Label
                        htmlFor="immediate"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
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
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
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
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deploying...' : 'Deploy Agent'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}