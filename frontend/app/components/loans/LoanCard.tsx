import Link from "next/link";
import { Calendar, DollarSign, Edit, Mail, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils/formatters";
import { useTranslation } from "@/i18n";
import type { Loan } from "@/types";

interface LoanCardProps {
  loan: Loan;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

export function LoanCard({ loan, onApprove, onReject, onDelete, loading }: LoanCardProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-2xl">{loan.id}</CardTitle>
              <Badge status={loan.status} />
            </div>
            <p className="text-gray-500">{loan.purpose || t('loanCard.noPurpose')}</p>
          </div>
          <Link href="/loans">
            <Button variant="outline" size="sm">{t('loanCard.backToLoans')}</Button>
          </Link>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('loanCard.applicant')}</p>
                <p className="font-medium text-gray-900">{loan.applicantName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('loanCard.email')}</p>
                <p className="font-medium text-gray-900">{loan.applicantEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('loanCard.amount')}</p>
                <p className="font-medium text-gray-900 text-lg">{formatCurrency(loan.amount)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Calendar className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('loanCard.term')}</p>
                <p className="font-medium text-gray-900">{loan.termMonths} {t('loanCard.months')}</p>
              </div>
            </div>

            {loan.interestRate != null && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('loanCard.interestRate')}</p>
                  <p className="font-medium text-gray-900">{formatPercentage(loan.interestRate)}</p>
                </div>
              </div>
            )}

            {loan.monthlyPayment != null && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F1F5F9] rounded-lg">
                  <DollarSign className="h-5 w-5 text-[#334155]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('loanCard.monthlyPayment')}</p>
                  <p className="font-medium text-gray-900">{formatCurrency(loan.monthlyPayment)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('loanCard.created')}</p>
                <p className="font-medium text-gray-900">{formatDate(loan.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(loan.status === "pending" || onDelete) && (
        <Card>
          <CardHeader>
            <CardTitle>{t('loanCard.actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/loans/${loan.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4" />
                  {t('loanCard.editLoan')}
                </Button>
              </Link>
              {loan.status === "pending" && onApprove && (
                <Button variant="success" onClick={onApprove} loading={loading}>
                  {t('loanCard.approveLoan')}
                </Button>
              )}
              {loan.status === "pending" && onReject && (
                <Button variant="danger" onClick={onReject} loading={loading}>
                  {t('loanCard.rejectLoan')}
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" onClick={onDelete} loading={loading} className="text-danger border-danger hover:bg-danger/5">
                  {t('loanCard.deleteLoan')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
