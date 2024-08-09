import AuthCard from "@/components/app/auth/authCard";
import LoginForm from "@/components/app/auth/loginForm";

export default function Login() {
  const greetingMessage = "Welcome Back to"
  return (
    <main className="flex h-screen w-screen justify-between align-middle px-6 md:px-52 lg:px-72 xl:px-[30rem]">
      <AuthCard greetingMessage={greetingMessage} className="translate-y-[20dvh]">
        <LoginForm />
      </AuthCard>
    </main>
  );
}
