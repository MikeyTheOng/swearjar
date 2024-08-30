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
        <Card className={`w-full h-max ${className}`}>
            <CardHeader className="text-center p-0 mb-4 md:mb-6">
                <CardTitle>
                    <p className="font-normal tracking-tighter">
                        {greetingMessage} <br />
                    </p>
                    <p className="text-4xl tracking-tight font-bold text-primary">SwearJar</p>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {children}
            </CardContent>
        </Card>
    )
}