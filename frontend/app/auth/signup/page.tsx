import AuthCard from "@/components/app/auth/authCard";
import SignUpForm from "@/components/app/auth/signUpForm";

export default function SignUp() {
  const greetingMessage = "Welcome to"
  return (
    <main className="flex justify-center mt-[20vh]">
      <AuthCard greetingMessage={greetingMessage} className="p-4 max-w-[380px] shadow-none border-transparent md:border-neutral-200 md:pt-8 md:pb-6 md:rounded-2xl md:bg-white">
        <SignUpForm />
      </AuthCard>
    </main>
  );
}
