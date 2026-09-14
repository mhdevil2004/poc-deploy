"use client";

import {
  ArrowRight,
  BarChart3,
  Building,
  PiggyBank,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/formatters";

const investmentOptions = [
  {
    name: "Fixed Deposits",
    icon: PiggyBank,
    minAmount: 1000,
    returns: "5.5% - 7.2%",
    tenure: "1 - 5 years",
    risk: "Low",
    color: "bg-success/10 text-success",
  },
  {
    name: "Mutual Funds",
    icon: BarChart3,
    minAmount: 500,
    returns: "8% - 15%",
    tenure: "Flexible",
    risk: "Medium",
    color: "bg-warning/10 text-warning",
  },
  {
    name: "Government Bonds",
    icon: Shield,
    minAmount: 5000,
    returns: "6% - 8%",
    tenure: "3 - 10 years",
    risk: "Low",
    color: "bg-primary/10 text-primary",
  },
  {
    name: "Real Estate Fund",
    icon: Building,
    minAmount: 10000,
    returns: "10% - 18%",
    tenure: "5+ years",
    risk: "High",
    color: "bg-danger/10 text-danger",
  },
];

const portfolioSummary = {
  totalInvested: 125000,
  currentValue: 142500,
  returns: 14.0,
  activeInvestments: 4,
};

export default function InvestmentsPage() {
  return (
    <DashboardLayout title="Investments" subtitle="Grow your wealth with Fintilla">
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Invested</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(portfolioSummary.totalInvested)}
                </p>
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(portfolioSummary.currentValue)}
                </p>
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <BarChart3 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Returns</p>
                <p className="text-xl font-bold text-success">
                  +{portfolioSummary.returns}%
                </p>
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-xl">
                <PiggyBank className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Investments</p>
                <p className="text-xl font-bold text-gray-900">
                  {portfolioSummary.activeInvestments}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Investment Options</h2>
              <p className="text-sm text-gray-500">Grow your wealth with our diverse investment products</p>
            </div>
            <Button variant="outline">
              View Portfolio
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {investmentOptions.map((option, index) => (
              <Card
                key={option.name}
                hover
                className="animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${option.color}`}>
                      <option.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{option.name}</CardTitle>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${option.color}`}>
                        {option.risk} Risk
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Min. Amount</p>
                      <p className="font-semibold">{formatCurrency(option.minAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expected Returns</p>
                      <p className="font-semibold text-success">{option.returns}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tenure</p>
                      <p className="font-semibold">{option.tenure}</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    Invest Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Need Investment Advice?</h3>
              <p className="text-gray-600 mt-1">
                Our financial advisors are here to help you make informed investment decisions.
              </p>
            </div>
            <Button variant="secondary">
              Schedule Consultation
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
