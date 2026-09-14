"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoanForm } from "@/components/loans/LoanForm";
import { useLoans } from "@/hooks/useLoans";
import type { CreateLoanInput, Loan } from "@/types";

export default function EditLoanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { fetchLoan, update, loading } = useLoans();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    fetchLoan(id).then((result) => {
      setLoan(result);
      setLoaded(true);
    });
  }, [fetchLoan, id]);

  const handleSubmit = async (data: CreateLoanInput) => {
    const updated = await update(id, data);
    if (updated) {
      router.push(`/loans/${updated.id}`);
    }
  };

  if (!loaded || (!loan && loading)) {
    return (
      <DashboardLayout title="Edit Loan" subtitle="Update loan application details">
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#090A0B] border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!loan) {
    return (
      <DashboardLayout title="Loan Not Found">
        <div className="py-20 text-center">
          <p className="text-lg text-gray-500">Loan not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Loan" subtitle={`Update application ${loan.id}`}>
      <div className="max-w-3xl">
        <LoanForm
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Save Changes"
          initialValues={{
            applicantName: loan.applicantName,
            applicantEmail: loan.applicantEmail,
            amount: loan.amount,
            termMonths: loan.termMonths,
            purpose: loan.purpose,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
