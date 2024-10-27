import AuthCard from "@/components/app/auth/authCard";
import EmailVerificationForm from "@/components/app/auth/emailVerificationForm";

export default async function EmailVerification() {
    const greetingMessage = "Email Verification"
    return (
        <main className='flex justify-center mt-[25vh] md:mt-0 md:items-center md:h-full'>
            <AuthCard greetingMessage={greetingMessage} className="p-4 max-w-[380px] shadow-none border-transparent md:border-neutral-200 md:pt-8 md:pb-6 md:rounded-2xl md:bg-white">
                <EmailVerificationForm />
            </AuthCard>
        </main>
    );
}
