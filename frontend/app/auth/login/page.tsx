import { auth } from "@/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthCard from "@/components/app/auth/authCard";
import LoginForm from "@/components/app/auth/loginForm";

export const metadata: Metadata = {
    title: 'Login | SwearJar',
    description: 'Login to SwearJar',
}

export default async function Login({ searchParams }: { searchParams: { callbackUrl: string } }) {
  const session = await auth();
  if (session?.user) {
      redirect(searchParams.callbackUrl || "/swearjar/list");
  }
  const greetingMessage = "Welcome Back to"
  return (
    <main className="flex justify-center mt-[20vh] md:mt-0 md:items-center md:h-full">
      <AuthCard
        greetingMessage={greetingMessage}
        className="p-4 max-w-[380px] shadow-none border-transparent md:border-neutral-200 md:pt-8 md:pb-6 md:rounded-2xl md:bg-white"
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}
