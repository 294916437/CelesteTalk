import React from "react";
import { PasswordForm } from "@/components/password-form";

export default function PasswordPage() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-3xl'>
        <PasswordForm />
      </div>
    </div>
  );
}
