"use client"

import { useState, useEffect } from "react"
import {
  PenToolIcon as Tool,
  ArrowLeft,
  Globe,
  Languages,
  FileIcon as Document,
  AlertCircle,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import SideNav from "@/components/sideNav"

import Link from "next/link"
import useHospital from "@/services/useFetchCompany"
import { auth } from '@/lib/firebaseConfig'

import { onAuthStateChanged, User } from 'firebase/auth';

interface FormData {
  agent_name: string;
  agent_description: string;
  agent_type: string;
  base_models: string;
  primary_language: string;
  translation_style: string;
  translation_model: string;
  features: string[];
  deployment_option: string;
}

export default function LanguageTranslationSetup() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [selectedLanguages, setSelectedLanguages] = useState(["en", "es", "fr"])

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    agent_name: "Medical Interpreter",
    agent_description: "Translates medical terminology and instructions between multiple languages for better patient communication.",
    agent_type: "interpreter",
    base_models: "whisper",
    primary_language: "en",
    translation_style: "balanced",
    translation_model: "advanced",
    features: ["medical_terminology", "cultural_adaptation", "glossary"],
    deployment_option: "immediate"
  })

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      
      // Update base_models when moving to step 3
      if (currentStep === 2) {
        setFormData({
          ...formData
        })
      }
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

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ar", name: "Arabic" },
  ]

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      setSelectedLanguages(selectedLanguages.filter((lang) => lang !== code))
    } else {
      setSelectedLanguages([...selectedLanguages, code])
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    const features = [...formData.features]
    
    if (enabled && !features.includes(feature)) {
      features.push(feature)
    } else if (!enabled && features.includes(feature)) {
      const index = features.indexOf(feature)
      features.splice(index, 1)
    }
    
    setFormData({
      ...formData,
      features
    })
  }

  const deployAgent = async () => {
    if (!hospital?.id) {
      setError("Hospital ID is missing")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3030/registration/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hospital_id: hospital.id,
          agent_name: formData.agent_name,
          agent_description: formData.agent_description,
          agent_type: formData.agent_type,
          base_models: formData.base_models,
          agent_specialty: formData.features.join(",")
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register agent')
      }
      
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SideNav />

      {/* Main Content - Language Translation Setup */}
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
                <h1 className="text-2xl font-bold">Language Translation Agent Setup</h1>
                <p className="text-muted-foreground">Configure your medical translation assistant</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={cn("h-2 w-8 rounded-full", i + 1 <= currentStep ? "bg-green-500" : "bg-muted")}
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
                <CardDescription>Provide basic details about your translation agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input 
                    id="agent-name" 
                    placeholder="e.g., Medical Interpreter" 
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
                      <RadioGroupItem value="interpreter" id="interpreter" className="peer sr-only" />
                      <Label
                        htmlFor="interpreter"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
                      >
                        <Languages className="mb-3 h-6 w-6 text-green-500" />
                        <div className="text-center">
                          <p className="font-medium">Medical Interpreter</p>
                          <p className="text-sm text-muted-foreground">Translate conversations in real-time</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="document" id="document" className="peer sr-only" />
                      <Label
                        htmlFor="document"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
                      >
                        <Document className="mb-3 h-6 w-6 text-green-500" />
                        <div className="text-center">
                          <p className="font-medium">Document Translator</p>
                          <p className="text-sm text-muted-foreground">Translate medical documents</p>
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

          {/* Step 2: Language Configuration */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Language Configuration</CardTitle>
                <CardDescription>Select languages and translation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Supported Languages</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select the languages your translation agent will support
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {languages.map((language) => (
                      <Button
                        key={language.code}
                        variant={selectedLanguages.includes(language.code) ? "default" : "outline"}
                        className={cn(
                          "justify-start",
                          selectedLanguages.includes(language.code) && "bg-green-500 hover:bg-green-600",
                        )}
                        onClick={() => toggleLanguage(language.code)}
                      >
                        {selectedLanguages.includes(language.code) ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Globe className="mr-2 h-4 w-4" />
                        )}
                        {language.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary-language">Primary Language</Label>
                  <Select 
                    value={formData.primary_language}
                    onValueChange={(value) => handleInputChange('primary_language', value)}
                  >
                    <SelectTrigger id="primary-language">
                      <SelectValue placeholder="Select primary language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages
                        .filter((lang) => selectedLanguages.includes(lang.code))
                        .map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The primary language will be used as the default source language
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="medical-terminology">Enhanced Medical Terminology</Label>
                      <p className="text-sm text-muted-foreground">
                        Improve translation accuracy for medical terms and phrases
                      </p>
                    </div>
                    <Switch 
                      id="medical-terminology" 
                      checked={formData.features.includes('medical_terminology')}
                      onCheckedChange={(checked) => handleFeatureToggle('medical_terminology', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="cultural-adaptation">Cultural Adaptation</Label>
                      <p className="text-sm text-muted-foreground">
                        Adapt content to be culturally appropriate for the target language
                      </p>
                    </div>
                    <Switch 
                      id="cultural-adaptation" 
                      checked={formData.features.includes('cultural_adaptation')}
                      onCheckedChange={(checked) => handleFeatureToggle('cultural_adaptation', checked)}
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

          {/* Step 3: Translation Settings */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Translation Settings</CardTitle>
                <CardDescription>Configure how your agent translates content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Translation Style</Label>
                  <RadioGroup 
                    value={formData.translation_style}
                    onValueChange={(value) => handleInputChange('translation_style', value)}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="literal" id="literal" className="peer sr-only" />
                      <Label
                        htmlFor="literal"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Literal</p>
                          <p className="text-sm text-muted-foreground">Word-for-word translation</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="balanced" id="balanced" className="peer sr-only" />
                      <Label
                        htmlFor="balanced"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Balanced</p>
                          <p className="text-sm text-muted-foreground">Balance between literal and contextual</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="contextual" id="contextual" className="peer sr-only" />
                      <Label
                        htmlFor="contextual"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Contextual</p>
                          <p className="text-sm text-muted-foreground">Focus on meaning over literal translation</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model-selection">Translation Model</Label>
                  <Select 
                    value={formData.translation_model}
                    onValueChange={(value) => handleInputChange('translation_model', value)}
                  >
                    <SelectTrigger id="model-selection">
                      <SelectValue placeholder="Select translation model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Translation</SelectItem>
                      <SelectItem value="advanced">Advanced Translation (Recommended)</SelectItem>
                      <SelectItem value="specialized">Specialized Medical Translation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="glossary">Custom Medical Glossary</Label>
                      <p className="text-sm text-muted-foreground">
                        Use a custom glossary for consistent medical terminology
                      </p>
                    </div>
                    <Switch 
                      id="glossary" 
                      checked={formData.features.includes('glossary')}
                      onCheckedChange={(checked) => handleFeatureToggle('glossary', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="preserve-formatting">Preserve Formatting</Label>
                      <p className="text-sm text-muted-foreground">Maintain document formatting during translation</p>
                    </div>
                    <Switch 
                      id="preserve-formatting"
                      checked={formData.features.includes('preserve_formatting')}
                      onCheckedChange={(checked) => handleFeatureToggle('preserve_formatting', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="confidence-scores">Show Confidence Scores</Label>
                      <p className="text-sm text-muted-foreground">Display confidence level for translated content</p>
                    </div>
                    <Switch 
                      id="confidence-scores"
                      checked={formData.features.includes('confidence_scores')}
                      onCheckedChange={(checked) => handleFeatureToggle('confidence_scores', checked)}
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
                        <dd className="col-span-2">
                          {formData.agent_type === 'interpreter' ? 'Medical Interpreter' : 'Document Translator'}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Languages</dt>
                        <dd className="col-span-2">
                          <div className="flex flex-wrap gap-1">
                            {selectedLanguages.map((code) => (
                              <Badge key={code} variant="outline" className="bg-green-50">
                                {languages.find((l) => l.code === code)?.name}
                              </Badge>
                            ))}
                          </div>
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Primary Language</dt>
                        <dd className="col-span-2">
                          {languages.find(l => l.code === formData.primary_language)?.name || 'English'}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Translation Style</dt>
                        <dd className="col-span-2">
                          {formData.translation_style.charAt(0).toUpperCase() + formData.translation_style.slice(1)}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Features</dt>
                        <dd className="col-span-2">
                          {formData.features.map(f => f.replace('_', ' ')).map(f => 
                            f.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                          ).join(', ')}
                        </dd>
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

                {success && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-green-700">Agent Successfully Deployed</h4>
                        <p className="text-sm text-green-700">
                          Your translation agent has been successfully created and is now ready to use.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-semibold text-green-700">Translation Quality Notice</h4>
                      <p className="text-sm text-green-700">
                        While this agent provides high-quality translations, it's recommended to have a human translator
                        review critical medical information to ensure accuracy.
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
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
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
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
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
                  onClick={deployAgent}
                  disabled={isSubmitting || success}
                >
                  {isSubmitting ? "Deploying..." : "Deploy Agent"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}