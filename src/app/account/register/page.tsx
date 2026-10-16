import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { RegisterForm } from "@/app/components/account/RegisterForm";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { getCurrentUser } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <div className="container-page flex justify-center py-12 md:py-20">
      <div className="w-full max-w-md">
        <Suspense fallback={<Skeleton className="h-[32rem] w-full" />}>
          <Register />
        </Suspense>
      </div>
    </div>
  );
}

async function Register() {
  if (await getCurrentUser()) redirect("/account");

  return (
    <div className="bg-porcelain p-8 ring-1 ring-beige-200 sm:p-10">
      <p className="eyebrow text-center">Join the Maison</p>
      <h1 className="mt-2 mb-8 text-center text-4xl">Create an account</h1>
      <RegisterForm />
    </div>
  );
}
