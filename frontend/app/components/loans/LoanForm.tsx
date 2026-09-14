"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { loanSchema, type LoanFormData } from "@/lib/validations/loanSchema";
import type { CreateLoanInput } from "@/types";

interface LoanFormProps {
  onSubmit: (data: CreateLoanInput) => Promise<void>;
  loading?: boolean;
  initialValues?: Partial<CreateLoanInput>;
  submitLabel?: string;
}

export function LoanForm({
  onSubmit,
  loading,
  initialValues,
  submitLabel = "Submit Application",
}: LoanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      applicantName: initialValues?.applicantName || "",
      applicantEmail: initialValues?.applicantEmail || "",
      amount: initialValues?.amount,
      termMonths: initialValues?.termMonths,
      purpose: initialValues?.purpose || "",
    },
  });

  useEffect(() => {
    reset({
      applicantName: initialValues?.applicantName || "",
      applicantEmail: initialValues?.applicantEmail || "",
      amount: initialValues?.amount,
      termMonths: initialValues?.termMonths,
      purpose: initialValues?.purpose || "",
    });
  }, [
    initialValues?.applicantName,
    initialValues?.applicantEmail,
    initialValues?.amount,
    initialValues?.termMonths,
    initialValues?.purpose,
    reset,
  ]);

  const handleFormSubmit = async (data: LoanFormData) => {
    if (isSubmitting || loading) return;
    await onSubmit(data);
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Loan Application</CardTitle>
        <p className="text-sm text-gray-500">Fill in the details to submit a new loan application</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Applicant Name"
              placeholder="John Smith"
              error={errors.applicantName?.message}
              {...register("applicantName")}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="john.smith@email.com"
              error={errors.applicantEmail?.message}
              {...register("applicantEmail")}
            />

            <Input
              label="Loan Amount (Rp)"
              type="number"
              placeholder="50000"
              error={errors.amount?.message}
              {...register("amount", { valueAsNumber: true })}
            />

            <Input
              label="Term (Months)"
              type="number"
              placeholder="36"
              error={errors.termMonths?.message}
              hint="Between 1 and 360 months"
              {...register("termMonths", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1.5">
              Purpose (Optional)
            </label>
            <textarea
              id="purpose"
              rows={3}
              placeholder="Describe the purpose of the loan..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              {...register("purpose")}
            />
            {errors.purpose && (
              <p className="mt-1.5 text-sm text-danger">{errors.purpose.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={loading || isSubmitting} disabled={loading || isSubmitting}>
              {submitLabel}
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
