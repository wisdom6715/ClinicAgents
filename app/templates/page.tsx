"use client"

import { useState } from "react"
import {
  Users,
  Bell,
  MessageCircle,
  Globe,
  Mic,
  ChevronRight,
  Search,
  Plus,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SideNav from "../../components/sideNav"

import useHospital from "@/services/useFetchCompany"
import { auth } from '@/lib/firebaseConfig'

import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
const agentTemplates = [
  {
    category: "Medical Reminder",
    icon: Bell,
    templates: [
      {
        id: "med-reminder-1",
        name: "Medication Schedule Assistant",
        description:
          "Helps patients keep track of their medication schedule with timely reminders and dosage information.",
        tags: ["Healthcare", "Reminders", "Scheduling"],
        popular: true,
        image: "/placeholder.svg?height=200&width=400",
        color: "bg-orange-500",
        page: '/reminder-agent'
      },
      {
        id: "med-reminder-2",
        name: "Appointment Reminder",
        description: "Sends notifications for upcoming medical appointments and helps reschedule if needed.",
        tags: ["Healthcare", "Calendar", "Notifications"],
        popular: false,
        image: "/placeholder.svg?height=200&width=400",
        color: "bg-orange-400",
        page: '/reminder-agent'
      },
    ],
  },
  {
    category: "Medical Chat",
    icon: MessageCircle,
    templates: [
      {
        id: "med-chat-1",
        name: "Patient Support Assistant",
        description: "Answers common medical questions and provides guidance on non-emergency health concerns.",
        tags: ["Healthcare", "Support", "Q&A"],
        popular: true,
        image: "/placeholder.svg?height=200&width=400",
        color: "bg-blue-500",
        page: '/chat-agent-setup'
      },
      {
        id: "med-chat-2",
        name: "Medical Information Bot",
        description: "Provides evidence-based information about conditions, treatments, and medications.",
        tags: ["Healthcare", "Information", "Research"],
        popular: false,
        image: "/placeholder.svg?height=200&width=400",
        color: "bg-blue-400",
        page: '/chat-agent-setup'
      },
    ],
  },
  {
    category: "Language Translation",
    icon: Globe,
    templates: [
      {
        id: "lang-trans-1",
        name: "Medical Interpreter",
        description:
          "Translates medical terminology and instructions between multiple languages for better patient communication.",
        tags: ["Healthcare", "Translation", "Multilingual"],
        popular: true,
        image: "/placeholder.svg?height=200&width=400",
        color: "bg-green-500",
        page: '/language-translation'
      },
      {
        id: "lang-trans-2",
        name: "Document Translator",
        description: "Translates medical documents, consent forms, and patient education materials.",
        tags: ["Healthcare", "Documents", "Translation"],
        popular: false,
        image: "/placeholder.svg?height=200&width=400",
        color: "bg-green-400",
        page: '/language-translation'
      },
    ],
  },
  {
    category: "Voice Chat",
    icon: Mic,
    templates: [
      {
        id: "voice-chat-1",
        name: "Voice-Enabled Medical Assistant",
        description: "Allows patients to interact using voice commands for hands-free medical assistance.",
        tags: ["Healthcare", "Voice", "Accessibility"],
        popular: true,
        image: "/placeholder.svg?height=200&width=400",
        color: "bg-purple-500",
        page: '/voice-agent'
      },
      {
        id: "voice-chat-2",
        name: "Symptom Checker Voice Bot",
        description: "Guides patients through symptom assessment using conversational voice interface.",
        tags: ["Healthcare", "Diagnosis", "Voice"],
        popular: false,
        image: "/placeholder.svg?height=200&width=400",
        color: "bg-purple-400",
        page: '/voice-agent'
      },
    ],
  },
]

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const router = useRouter()

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
      });
      return () => unsubscribe();
  }, []);

  const { hospital }  = useHospital({
      userId: user?.uid,
  });

  // Filter templates based on search query
  const filteredTemplates = searchQuery
    ? agentTemplates
        .map((category) => ({
          ...category,
          templates: category.templates.filter(
            (template) =>
              template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
          ),
        }))
        .filter((category) => category.templates.length > 0)
    : agentTemplates

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Same as dashboard */}
      <SideNav />
      
      {/* Main Content - Agents Page */}
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
            <h1 className="text-2xl font-bold">AI Agents</h1>
            <p className="text-muted-foreground">
              Create intelligent agents to automate tasks and provide assistance to your users
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="my-agents">My Agents</TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              {filteredTemplates.length === 0 ? (
                <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We couldn't find any templates matching your search. Try different keywords or browse all templates.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredTemplates.map((category) => (
                    <div key={category.category}>
                      <div className="mb-4 flex items-center gap-2">
                        <category.icon className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">{category.category} Agents</h2>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        {category.templates.map((template) => (
                          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative h-48 w-full overflow-hidden">
                              <div className={`absolute inset-0 ${template.color} opacity-20`}></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative h-32 w-32">
                                  {/* Agent Icon Overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    {template.id.includes("med-reminder") ? (
                                      <Bell className="h-24 w-24 text-orange-500 opacity-30" />
                                    ) : template.id.includes("med-chat") ? (
                                      <MessageCircle className="h-24 w-24 text-blue-500 opacity-30" />
                                    ) : template.id.includes("lang-trans") ? (
                                      <Globe className="h-24 w-24 text-green-500 opacity-30" />
                                    ) : (
                                      <Mic className="h-24 w-24 text-purple-500 opacity-30" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Agent Type Badge */}
                              <div
                                className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
                                style={{
                                  backgroundColor: template.id.includes("med-reminder")
                                    ? "rgba(249, 115, 22, 0.9)"
                                    : template.id.includes("med-chat")
                                      ? "rgba(59, 130, 246, 0.9)"
                                      : template.id.includes("lang-trans")
                                        ? "rgba(34, 197, 94, 0.9)"
                                        : "rgba(168, 85, 247, 0.9)",
                                }}
                              >
                                {template.id.includes("med-reminder")
                                  ? "Reminder"
                                  : template.id.includes("med-chat")
                                    ? "Chat"
                                    : template.id.includes("lang-trans")
                                      ? "Translation"
                                      : "Voice"}
                              </div>

                              {/* Popular Badge */}
                              {template.popular && (
                                <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-sm">
                                  ★ Popular
                                </div>
                              )}
                            </div>

                            <CardHeader className="pb-2">
                              <CardTitle>{template.name}</CardTitle>
                              <CardDescription className="mt-1">{template.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="pb-2">
                              <div className="flex flex-wrap gap-2">
                                {template.tags.map((tag) => (
                                  <Badge key={tag} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>

                            <CardFooter onClick={() => router.push(`${template?.page}`)}>
                              <Button className="w-full">
                                Use Template
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-agents">
              <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No agents created yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You haven't created any agents yet. Start by using a template or creating a custom agent.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Agent
                </Button>
              </div>
            </TabsContent>

          </Tabs>
        </main>
      </div>
    </div>
  )
}
