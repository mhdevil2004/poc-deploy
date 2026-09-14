"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function CreateLoanPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect the old single-page form to the new multi-step wizard
    router.replace("/loans/apply");
  }, [router]);

  return (
    <DashboardLayout title="New Loan Application">
      <div className="flex justify-center py-20 text-gray-500">
        Redirecting to the multi-step application...
      </div>
    </DashboardLayout>
  );
}
