"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoanFilters } from "@/components/loans/LoanFilters";
import { LoanTable } from "@/components/loans/LoanTable";
import { Button } from "@/components/ui/Button";
import { useLoans } from "@/hooks/useLoans";
import { useTranslation } from "@/i18n";
import type { LoanStatus } from "@/types";

export default function LoansPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LoanStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { loans, pagination, loading, fetchLoans, remove } = useLoans({
    page: 1,
    limit: 10,
  });

  const applyFilters = useCallback(() => {
    fetchLoans({ search, status, page, limit: 10 });
  }, [fetchLoans, search, status, page]);

  useEffect(() => {
    const debounce = setTimeout(applyFilters, 300);
    return () => clearTimeout(debounce);
  }, [applyFilters]);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('loans.confirmDelete'))) {
      await remove(id);
    }
  };

  return (
    <DashboardLayout title={t('loans.title')} subtitle={t('loans.manageLoans')}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[#9CA3AF]">
              {t('loans.liveData')}
            </p>
          </div>
          <Link href="/loans/create">
            <Button>
              <Plus className="h-4 w-4" />
              {t('loans.newApplication')}
            </Button>
          </Link>
        </div>

        <LoanFilters
          search={search}
          status={status}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        

        <LoanTable
          loans={loans}
          loading={loading}
          page={pagination?.page || 1}
          totalPages={pagination?.totalPages || 1}
          onPageChange={setPage}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}
