import { auth } from "@/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/shadcn/button";
import { Mail } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Onboarding() {
    const session = await auth();

    const isUserAuthenticated = Boolean(session?.user);
    const isUserVerified = Boolean(session?.user?.Verified);

    const shouldRedirectToSwearjarList = isUserAuthenticated && isUserVerified;
    const shouldRedirectToLogin = !isUserAuthenticated;

    if (shouldRedirectToSwearjarList) {
        redirect("/swearjar/list");
    } else if (shouldRedirectToLogin) {
        redirect("/auth/login");
    } else {
        return (
            <main className='flex justify-center mt-[30vh] md:mt-0 md:items-center md:h-full'>
                <OnboardingCard />
            </main>
        );
    }
}


async function OnboardingCard() {
    const session = await auth();

    if (session?.user) {
        return (
            <Card className="w-full h-max p-10 md:p-4 max-w-[380px] shadow-none border-transparent md:border-neutral-200 md:pt-8 md:pb-6 md:rounded-2xl md:bg-white">
                <CardHeader className="text-center text-primary p-0 mb-2">
                    <CardTitle className="text-center">
                        <span className="flex items-center justify-center gap-2">
                            <Mail className="w-6 h-6" />
                            Verify your email
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                    <CardDescription className="text-center">
                        We've sent an email to <br />
                        {session?.user?.Email}. <br />
                    </CardDescription>
                    {/* <div className="flex justify-center">
                        <Button variant="ghost" className="hidden md:block p-0 text-primary font-bold hover:text-input hover:bg-transparent focus-visible:ring-transparent focus-visible:underline">Resend Email</Button>
                        <Button variant="default" className="md:hidden">Resend Email</Button>
                    </div> */}
                </CardContent>
            </Card>
        );
    }
}
