import { auth } from "@/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthCard from "@/components/app/auth/authCard";
import SignUpForm from "@/components/app/auth/signUpForm";

export const metadata: Metadata = {
    title: 'Sign Up | SwearJar',
    description: 'Sign up for SwearJar',
}
  
export default async function SignUp() {
  const session = await auth();
  if (session?.user) {
    redirect("/swearjar/list");
  }

  const greetingMessage = "Welcome to"
  return (
    <main className='flex justify-center mt-[15vh] md:mt-0 md:items-center md:h-full'>
      <AuthCard greetingMessage={greetingMessage} className="p-4 max-w-[380px] shadow-none border-transparent md:border-neutral-200 md:pt-8 md:pb-6 md:rounded-2xl md:bg-white">
        <SignUpForm />
      </AuthCard>
    </main>
  );
}
