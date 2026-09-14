"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoanCard } from "@/components/loans/LoanCard";
import { useLoans } from "@/hooks/useLoans";
import type { Loan } from "@/types";

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { fetchLoan, approve, reject, remove, loading } = useLoans();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    fetchLoan(id).then((result) => {
      setLoan(result);
      setLoaded(true);
    });
  }, [id, fetchLoan]);

  const handleApprove = async () => {
    const success = await approve(id);
    if (success) {
      const updated = await fetchLoan(id);
      setLoan(updated);
    }
  };

  const handleReject = async () => {
    const success = await reject(id);
    if (success) {
      const updated = await fetchLoan(id);
      setLoan(updated);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this loan? This action cannot be undone.")) {
      const success = await remove(id);
      if (success) {
        router.push("/loans");
      }
    }
  };

  if (!loaded || (!loan && loading)) {
    return (
      <DashboardLayout title="Loan Details">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-[#090A0B] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!loan) {
    return (
      <DashboardLayout title="Loan Not Found">
        <div className="text-center py-20">
          <p className="text-lg text-gray-500">Loan not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Loan Details">
      <LoanCard
        loan={loan}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        loading={loading}
      />
    </DashboardLayout>
  );
}
