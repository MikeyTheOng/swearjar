import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface AuthCardProps {
    children: React.ReactNode;
    greetingMessage: string;
    className?: string;
}

export default function AuthCard({ children, greetingMessage, className }: AuthCardProps) {
    return (
        <Card className={`w-full h-max border-none shadow-none ${className}`}>
            <CardHeader className="text-center">
                <CardTitle>
                    <p className="font-normal tracking-tighter">
                        {greetingMessage} <br />
                    </p>
                    <p className="text-4xl tracking-tight font-bold text-primary">SwearJar</p>
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
                {children}
            </CardContent>
        </Card>
    )
}