"use client";

import {
  ArrowRight,
  CreditCard,
  Gift,
  Globe,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";

const cardProducts = [
  {
    name: "Fintilla Platinum",
    type: "Premium",
    limit: "Rp 50.000",
    apr: "15.99%",
    rewards: "3x points on all purchases",
    color: "from-primary to-primary-700",
    features: ["Airport lounge access", "Travel insurance", "No foreign transaction fees"],
  },
  {
    name: "Fintilla Gold",
    type: "Standard",
    limit: "Rp 25.000",
    apr: "18.99%",
    rewards: "2x points on dining & travel",
    color: "from-secondary to-secondary-600",
    features: ["Cashback rewards", "Purchase protection", "Extended warranty"],
  },
  {
    name: "Fintilla Classic",
    type: "Starter",
    limit: "Rp 10.000",
    apr: "21.99%",
    rewards: "1x points on all purchases",
    color: "from-gray-600 to-gray-800",
    features: ["No annual fee", "Credit building", "Mobile wallet support"],
  },
];

const benefits = [
  { icon: Shield, title: "Secure Transactions", description: "Chip & PIN with fraud monitoring 24/7" },
  { icon: Gift, title: "Rewards Program", description: "Earn points on every purchase" },
  { icon: Globe, title: "Global Acceptance", description: "Use your card anywhere in the world" },
  { icon: Zap, title: "Instant Notifications", description: "Real-time alerts for all transactions" },
];

export default function CardsPage() {
  return (
    <DashboardLayout title="Credit Cards" subtitle="Cards designed for everyday banking">
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-700 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-secondary" />
              <span className="text-secondary font-medium">Premium Banking</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Credit Cards Designed for You</h2>
            <p className="text-white/80 max-w-xl">
              Choose from our range of credit cards with competitive rates, generous rewards, and premium benefits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cardProducts.map((card, index) => (
            <Card
              key={card.name}
              hover
              className="overflow-hidden animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-32 bg-gradient-to-br ${card.color} p-6 relative`}>
                <CreditCard className="h-8 w-8 text-white/80 absolute top-4 right-4" />
                <div className="text-white">
                  <p className="text-xs text-white/70 uppercase tracking-wider">{card.type}</p>
                  <p className="text-xl font-bold mt-1">{card.name}</p>
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Credit Limit</p>
                    <p className="font-semibold text-gray-900">{card.limit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">APR</p>
                    <p className="font-semibold text-gray-900">{card.apr}</p>
                  </div>
                </div>
                <p className="text-sm text-secondary font-medium mb-4">{card.rewards}</p>
                <ul className="space-y-2 mb-6">
                  {card.features.map((feature) => (
                    <li key={feature} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full">
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Benefits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} hover>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-3">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
