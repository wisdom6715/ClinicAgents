"use client"

import {
  PenToolIcon as Tool,
  Users,
  Database,
  Box,
  FileText,
  Play,
  Book,
  Upload,
  Search,
  LucideIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { Card, CardContent } from "@/components/ui/card"
import SideNav from "../../components/sideNav"
import useHospital from "@/services/useFetchCompany"

import { auth } from '@/lib/firebaseConfig'
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Dashboard() {
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

  return (
    <div className="flex h-screen bg-background">
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              {hospital ? `Hi ${hospital.firstName} ${hospital.lastName},` : 'Loading...'}
            </h1>
            <p className="text-muted-foreground">
              Explore ClinicAgent to design, deploy, and manage AI-driven applications customized for your specific needs.
            </p>
          </div>

          <div className="mb-8 rounded-lg border bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">ClinicAgent Studio Workflow</h2>
                    <p className="text-sm text-muted-foreground">
                      Follow this recommended workflow to build and deploy AI applications with ClinicAgent Studio.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1 text-blue-600">
                      <Play className="h-4 w-4" /> Watch Tutorial
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Book className="h-4 w-4" /> Learn more
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <WorkflowCard
                    number="1"
                    title="Choose a template"
                    description="Choose a base template to build your agant on from chat, voice, language translator and reminder agents"
                    icon={Upload}
                  />
                  <WorkflowCard
                    number="2"
                    title="Create a Knowledge Base"
                    description="Process your dataset into a searchable knowledge base"
                    icon={Search}
                  />
                  <WorkflowCard
                    number="3"
                    title="Build an Agent"
                    description="Create a agent that uses your knowledge base"
                    icon={Tool}
                  />
                  <WorkflowCard
                    number="4"
                    title="Deploy your Agent"
                    description="Make your AI agent available on the web or whatsApp"
                    icon={Users}
                  />
                </div>
              </div>

          

          <div className="grid gap-6 md:grid-cols-2">
            <FeatureCard
              icon={Users}
              title="Agents"
              description="Conversational tools that can dynamically use tools to extend their capabilities."
            />
            <FeatureCard
              icon={Database}
              title="Dataset"
              description="Bring your data to ClinicAgent using our SDK, connections or upload files directly."
            />
            <FeatureCard
              icon={Box}
              title="Models"
              description="Open and closed-source models suitable for all use cases."
            />
            <FeatureCard
              icon={FileText}
              title="Knowledge Bases"
              description="Connect your enterprise data with a powerful searchable database to power retrieval-augmented generation (RAG) and search experiences."
            />
          </div>
        </main>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
          <Icon className="h-6 w-6 text-slate-700" />
        </div>
        <h3 className="mb-2 text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

interface WorkflowCardProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

function WorkflowCard({ number, title, description, icon: Icon }: WorkflowCardProps) {
  return (
    <Card className="border bg-gray-50">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
            {number}
          </div>
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}