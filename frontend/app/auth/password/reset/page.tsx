import { auth } from "@/auth";
import { redirect } from "next/navigation";

import AuthCard from "@/components/app/auth/authCard";
import ResetPasswordForm from "@/components/app/auth/resetPasswordForm";

export default async function ResetPassword() {
    const session = await auth();
    if (session?.user) {
        redirect("/swearjar/list");
    }
    const greetingMessage = "Reset Password"
    return (
        <main className='flex justify-center mt-[25vh] md:mt-0 md:items-center md:h-full'>
            <AuthCard greetingMessage={greetingMessage} className="p-4 max-w-[380px] shadow-none border-transparent md:border-neutral-200 md:pt-8 md:pb-6 md:rounded-2xl md:bg-white">
                <ResetPasswordForm />
            </AuthCard>
        </main>
    );
}
