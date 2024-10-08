import AuthCard from "@/components/app/auth/authCard";
import LoginForm from "@/components/app/auth/loginForm";

export default function Login() {
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
