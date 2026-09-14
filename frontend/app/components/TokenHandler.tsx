"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TokenHandlerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("sdk_token");
    if (token) {
      sessionStorage.setItem("Fintilla_sdk_token", token);
      // Redirect to the multi-step loan application flow (which now includes the interview)
      router.push("/loans/apply");
    }
  }, [searchParams, router]);

  return null;
}

export function TokenHandler() {
  return (
    <Suspense fallback={null}>
      <TokenHandlerInner />
    </Suspense>
  );
}
