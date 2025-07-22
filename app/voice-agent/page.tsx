"use client"

import { useState } from "react"
import {
  ArrowLeft,
  VolumeX,
  Volume2,
  AlertCircle,
  Wand2,
  Headphones,
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
import { Slider } from "@/components/ui/slider"

import SideNav from "@/components/sideNav"
import Link from "next/link"

import useHospital from "@/services/useFetchCompany"
import { auth } from '@/lib/firebaseConfig'

import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function VoiceChatSetup() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [voiceSpeed, setVoiceSpeed] = useState([1])
  const [voicePitch, setVoicePitch] = useState([1])
  
  // Form state
  const [agentName, setAgentName] = useState("Voice-Enabled Medical Assistant")
  const [agentDescription, setAgentDescription] = useState("Allows patients to interact using voice commands for hands-free medical assistance.")
  const [agentType, setAgentType] = useState("voice")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

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

  const handleDeployAgent = async () => {
    if (!hospital?.id) {
      setError("Hospital ID is missing");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      // Prepare data for API
      const apiData = {
        hospital_id: hospital?.id,
        agent_name: agentName,
        agent_description: agentDescription,
        agent_type: agentType,
        base_models: 'llama3.3',
        agent_specialty: 'general'
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
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Same as dashboard */}
      <SideNav />

      {/* Main Content - Voice Chat Setup */}
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
                <h1 className="text-2xl font-bold">Voice Chat Agent Setup</h1>
                <p className="text-muted-foreground">Configure your voice-enabled medical assistant</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={cn("h-2 w-8 rounded-full", i + 1 <= currentStep ? "bg-purple-500" : "bg-muted")}
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
                <CardDescription>Provide basic details about your voice chat agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    placeholder="e.g., Voice-Enabled Medical Assistant"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
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
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    className="min-h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Agent Type</Label>
                  <RadioGroup 
                    value={agentType} 
                    onValueChange={setAgentType} 
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="assistant" id="assistant" className="peer sr-only" />
                      <Label
                        htmlFor="assistant"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500"
                      >
                        <Headphones className="mb-3 h-6 w-6 text-purple-500" />
                        <div className="text-center">
                          <p className="font-medium">Voice Assistant</p>
                          <p className="text-sm text-muted-foreground">General medical voice assistance</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="symptom" id="symptom" className="peer sr-only" />
                      <Label
                        htmlFor="symptom"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500"
                      >
                        <Wand2 className="mb-3 h-6 w-6 text-purple-500" />
                        <div className="text-center">
                          <p className="font-medium">Symptom Checker</p>
                          <p className="text-sm text-muted-foreground">Voice-based symptom assessment</p>
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

          {/* Step 2: Voice Configuration */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Voice Configuration</CardTitle>
                <CardDescription>Configure voice settings for your agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="voice-selection">Voice Selection</Label>
                  <Select defaultValue="female-1">
                    <SelectTrigger id="voice-selection">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female-1">Female Voice 1 (Default)</SelectItem>
                      <SelectItem value="female-2">Female Voice 2</SelectItem>
                      <SelectItem value="male-1">Male Voice 1</SelectItem>
                      <SelectItem value="male-2">Male Voice 2</SelectItem>
                      <SelectItem value="neutral">Gender Neutral Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="voice-speed">Voice Speed</Label>
                      <span className="text-sm text-muted-foreground">{voiceSpeed[0]}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        id="voice-speed"
                        defaultValue={[1]}
                        max={2}
                        min={0.5}
                        step={0.1}
                        value={voiceSpeed}
                        onValueChange={setVoiceSpeed}
                        className="w-full"
                      />
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="voice-pitch">Voice Pitch</Label>
                      <span className="text-sm text-muted-foreground">{voicePitch[0]}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        id="voice-pitch"
                        defaultValue={[1]}
                        max={2}
                        min={0.5}
                        step={0.1}
                        value={voicePitch}
                        onValueChange={setVoicePitch}
                        className="w-full"
                      />
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="voice-activation">Voice Activation</Label>
                      <p className="text-sm text-muted-foreground">
                        Activate the agent with a wake word (e.g., "Hey Medical")
                      </p>
                    </div>
                    <Switch id="voice-activation" defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wake-word">Wake Word</Label>
                    <Input id="wake-word" placeholder="e.g., Hey Medical" defaultValue="Hey Medical" />
                    <p className="text-xs text-muted-foreground">
                      The word or phrase users will say to activate the voice assistant
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="noise-cancellation">Noise Cancellation</Label>
                      <p className="text-sm text-muted-foreground">Improve voice recognition in noisy environments</p>
                    </div>
                    <Switch id="noise-cancellation" defaultChecked />
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

          {/* Step 3: Conversation Settings */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Conversation Settings</CardTitle>
                <CardDescription>Configure how your agent interacts with users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="greeting-message">Voice Greeting</Label>
                  <Textarea
                    id="greeting-message"
                    placeholder="Enter a greeting message..."
                    defaultValue="Hello! I'm your voice-enabled medical assistant. You can ask me questions about symptoms, medications, or general health information. How can I help you today?"
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interaction-mode">Interaction Mode</Label>
                  <Select defaultValue="conversational">
                    <SelectTrigger id="interaction-mode">
                      <SelectValue placeholder="Select interaction mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversational">Conversational (Natural dialogue)</SelectItem>
                      <SelectItem value="guided">Guided (Step-by-step prompts)</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Adaptive based on context)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Response Length</Label>
                  <RadioGroup defaultValue="concise" className="grid grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem value="brief" id="brief" className="peer sr-only" />
                      <Label
                        htmlFor="brief"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Brief</p>
                          <p className="text-sm text-muted-foreground">Short, direct responses</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="concise" id="concise" className="peer sr-only" />
                      <Label
                        htmlFor="concise"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500"
                      >
                        <div className="text-center">
                          <p className="font-medium">Concise</p>
                          <p className="text-sm text-muted-foreground">Balanced length responses</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="detailed" id="detailed" className="peer sr-only" />
                      <Label
                        htmlFor="detailed"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500"
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
                      <Label htmlFor="confirmation">Verbal Confirmations</Label>
                      <p className="text-sm text-muted-foreground">Confirm user requests with verbal acknowledgments</p>
                    </div>
                    <Switch id="confirmation" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="fallback">Text Fallback</Label>
                      <p className="text-sm text-muted-foreground">Switch to text input if voice recognition fails</p>
                    </div>
                    <Switch id="fallback" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emergency">Emergency Detection</Label>
                      <p className="text-sm text-muted-foreground">Detect potential emergencies from voice input</p>
                    </div>
                    <Switch id="emergency" defaultChecked />
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
                
                {successMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-green-700">Success</h4>
                        <p className="text-sm text-green-700">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="rounded-lg border">
                  <div className="border-b bg-muted/50 p-4">
                    <h3 className="font-semibold">Agent Summary</h3>
                  </div>
                  <div className="p-4">
                    <dl className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Name</dt>
                        <dd className="col-span-2">{agentName}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Type</dt>
                        <dd className="col-span-2">{agentType === "assistant" ? "Voice Assistant" : "Symptom Checker"}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Voice</dt>
                        <dd className="col-span-2">Female Voice 1</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Wake Word</dt>
                        <dd className="col-span-2">Hey Medical</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Interaction Mode</dt>
                        <dd className="col-span-2">Conversational</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Features</dt>
                        <dd className="col-span-2">Noise Cancellation, Verbal Confirmations, Text Fallback</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-semibold text-purple-700">Voice Recognition Notice</h4>
                      <p className="text-sm text-purple-700">
                        Voice recognition accuracy may vary based on environmental factors, accents, and medical
                        terminology. Consider providing alternative input methods for critical information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deployment Options</Label>
                  <RadioGroup defaultValue="immediate" className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="immediate" id="immediate" className="peer sr-only" />
                      <Label
                        htmlFor="immediate"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500"
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
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500"
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
                <Button onClick={handleDeployAgent} disabled={isLoading}>
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