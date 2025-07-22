"use client"

import { useState } from "react"
import {
  Filter,
  SortDesc,
  MoreVertical,
  Plus,
  FileText,
  Bell,
  MessageCircle,
  Globe,
  Mic,
  ExternalLink,
  Copy,
  Share2,
  Smartphone,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SideNav from "../../components/sideNav"

import useHospital from "@/services/useFetchCompany"
import { auth } from '@/lib/firebaseConfig'
import { useEffect } from 'react';

import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { QRCode } from "../../components/qr-code"
import { useRouter } from "next/navigation"

// Define types for the application
interface File {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface Contact {
  id: number;
  name: string;
  phone: string;
  condition: string;
  timeToCall: string;
  reasonForCalling: string;
  frequency: string;
}

interface NewContact {
  name: string;
  phone: string;
  condition: string;
  timeToCall: string;
  reasonForCalling: string;
  frequency: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  lastDeployed: string;
  type: string;
  category: string;
}

interface CategoryInfo {
  icon: React.ComponentType<any>;
  color: string;
}

// Sample agent data
const agents: Agent[] = [
  {
    id: "agent-1",
    name: "Medical Reminder Assistant",
    description: "Helps patients keep track of their medication schedule with timely reminders",
    status: "active",
    lastDeployed: "2 days ago",
    type: "GPT-4",
    category: "medical-reminder",
  },
  {
    id: "agent-2",
    name: "Patient Support Assistant",
    description: "Answers common medical questions and provides guidance on health concerns",
    status: "active",
    lastDeployed: "5 hours ago",
    type: "Custom",
    category: "medical-chat",
  },
  {
    id: "agent-3",
    name: "Medical Interpreter",
    description: "Translates medical terminology between multiple languages for better communication",
    status: "inactive",
    lastDeployed: "2 weeks ago",
    type: "GPT-3.5",
    category: "language-translation",
  },
  {
    id: "agent-4",
    name: "Voice Medical Assistant",
    description: "Allows patients to interact using voice commands for hands-free assistance",
    status: "active",
    lastDeployed: "1 day ago",
    type: "Custom",
    category: "voice-chat",
  },
]

// Agent categories with their respective icons
const agentCategories: Record<string, CategoryInfo> = {
  "medical-reminder": { icon: Bell, color: "text-orange-500" },
  "medical-chat": { icon: MessageCircle, color: "text-blue-500" },
  "language-translation": { icon: Globe, color: "text-green-500" },
  "voice-chat": { icon: Mic, color: "text-purple-500" },
}

export default function AgentsPage() {
  const [isDeploymentDialogOpen, setIsDeploymentDialogOpen] = useState(false)
  const router = useRouter()

  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const [trainingFiles, setTrainingFiles] = useState<File[]>([])
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: "John Doe",
      phone: "555-123-4567",
      condition: "Hypertension",
      timeToCall: "09:00",
      reasonForCalling: "Blood pressure medication",
      frequency: "twice",
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "555-987-6543",
      condition: "Diabetes",
      timeToCall: "18:00",
      reasonForCalling: "Insulin reminder",
      frequency: "once",
    },
  ])
  const [newContact, setNewContact] = useState<NewContact>({
    name: "",
    phone: "",
    condition: "",
    timeToCall: "09:00",
    reasonForCalling: "",
    frequency: "once",
  })

  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
      });
      return () => unsubscribe();
  }, []);

  const { hospital }  = useHospital({
      userId: user?.uid,
  });

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts([
        ...contacts,
        {
          id: Date.now(),
          name: newContact.name,
          phone: newContact.phone,
          condition: newContact.condition,
          timeToCall: newContact.timeToCall,
          reasonForCalling: newContact.reasonForCalling,
          frequency: newContact.frequency,
        },
      ])
      setNewContact({
        name: "",
        phone: "",
        condition: "",
        timeToCall: "09:00",
        reasonForCalling: "",
        frequency: "once",
      })
    }
  }

  const removeContact = (id: number) => {
    setContacts(contacts.filter((contact) => contact.id !== id))
  }

  const openDeploymentDialog = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsDeploymentDialogOpen(true)
  }

  const handleTrainingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: file.type,
      }))
      setTrainingFiles([...trainingFiles, ...newFiles])
    }
  }

  const removeTrainingFile = (id: string) => {
    setTrainingFiles(trainingFiles.filter((file) => file.id !== id))
  }

  const openConfigureDialog = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsConfigureDialogOpen(true)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SideNav />


      {/* Main Content */}
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
            <h1 className="text-2xl font-bold">Deployments</h1>
            <p className="text-muted-foreground">
              Deploy and integrate your AI models with various platforms and services.
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <SortDesc className="h-4 w-4" /> Sort
              </Button>
            </div>
            <Button onClick={() => router.push('/templates')}>
              <Plus className="mr-2 h-4 w-4" /> Create New Model
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const CategoryIcon = agentCategories[agent.category]?.icon || FileText
              const iconColor = agentCategories[agent.category]?.color || "text-gray-500"

              return (
                <Card key={agent.id} className="cursor-pointer hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={agent.status === "active" ? "default" : "secondary"}
                        className={agent.status === "active" ? "bg-green-500" : ""}
                      >
                        {agent.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openDeploymentDialog(agent)}>
                            Deployment Endpoints
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openConfigureDialog(agent)}>Configure</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <CategoryIcon className={`h-5 w-5 ${iconColor}`} />
                      <CardTitle>{agent.name}</CardTitle>
                    </div>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="text-xs text-muted-foreground">Last deployed: {agent.lastDeployed}</div>
                    <div className="text-xs font-medium">{agent.type}</div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </main>
      </div>

      {/* Deployment Endpoints Dialog */}
      <Dialog open={isDeploymentDialogOpen} onOpenChange={setIsDeploymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedAgent?.name} - Deployment Endpoints</DialogTitle>
            <DialogDescription>
              Connect your model to external platforms using one of the following methods.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="qrcode" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            </TabsList>
            <TabsContent value="qrcode" className="py-4">
              <div className="flex flex-col items-center space-y-4">
                <QRCode value={`https://clinicagent.app/integration/${selectedAgent?.id}`} size={200} />
                <p className="text-center text-sm text-muted-foreground">
                  Scan this QR code to access your model directly from any device.
                </p>
                <div className="flex w-full items-center space-x-2">
                  <div className="flex-1 rounded-md border px-3 py-2 text-sm">
                    https://clinicagent.app/integration/{selectedAgent?.id}
                  </div>
                  <Button size="icon" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setIsDeploymentDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Agent Dialog */}
      <Dialog open={isConfigureDialogOpen} onOpenChange={setIsConfigureDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedAgent?.name}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="training" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
            </TabsList>
            <TabsContent value="training">
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="training-files">Training Files</Label>
                  <Input type="file" id="training-files" multiple onChange={handleTrainingFileChange} />
                  {trainingFiles.length > 0 && (
                    <ul className="mt-2">
                      {trainingFiles.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center justify-between rounded-md border px-3 py-1 text-sm"
                        >
                          <span>{file.name}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeTrainingFile(file.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reminders">
              <div className="grid gap-4 py-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Contact List</h3>
                  <p className="text-sm text-muted-foreground">Manage the contacts for this agent.</p>
                </div>
                <div className="grid gap-4 h-[12rem] overflow-y-scroll">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-muted-foreground">{contact.phone}</p>
                        <p className="text-muted-foreground">Condition: {contact.condition}</p>
                        <p className="text-muted-foreground">Time to call: {contact.timeToCall}</p>
                        <p className="text-muted-foreground">Reason for calling: {contact.reasonForCalling}</p>
                        <p className="text-muted-foreground">Frequency: {contact.frequency}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeContact(contact.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4  h-[15rem] overflow-y-scroll">
                  <h3 className="text-lg font-medium">Add New Contact</h3>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="Enter name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-phone">Phone</Label>
                    <Input
                      id="contact-phone"
                      placeholder="Enter phone number"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-condition">Condition</Label>
                    <Input
                      id="contact-condition"
                      placeholder="Enter condition"
                      value={newContact.condition}
                      onChange={(e) => setNewContact({ ...newContact, condition: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-timeToCall">Time to Call</Label>
                    <Input
                      type="time"
                      id="contact-timeToCall"
                      value={newContact.timeToCall}
                      onChange={(e) => setNewContact({ ...newContact, timeToCall: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-reasonForCalling">Reason for Calling</Label>
                    <Input
                      id="contact-reasonForCalling"
                      placeholder="Enter reason for calling"
                      value={newContact.reasonForCalling}
                      onChange={(e) => setNewContact({ ...newContact, reasonForCalling: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-frequency">Frequency</Label>
                    <Select onValueChange={(value) => setNewContact({ ...newContact, frequency: value })}>
                      <SelectTrigger id="contact-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="twice">Twice</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="mt-4" onClick={addContact}>
                    Add Contact
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setIsConfigureDialogOpen(false)}>
              Close
            </Button>
            <Button type="button">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}