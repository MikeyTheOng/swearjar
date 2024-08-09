import AuthCard from "@/components/app/auth/authCard";
import SignUpForm from "@/components/app/auth/signUpForm";

export default function SignUp() {
  const greetingMessage = "Welcome to"
  return (
    <main className="flex w-screen justify-between align-middle px-6 md:px-52 lg:px-72 xl:px-[30rem]">
      <AuthCard greetingMessage={greetingMessage} className="translate-y-[15dvh]">
        <SignUpForm />
      </AuthCard>
    </main>
  );
}
