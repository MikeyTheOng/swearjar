"use client"
import SwearJarForm from "@/components/app/swearjar/forms/SwearJarForm";

export default function MainContent({ swearJarId }: { swearJarId: string }) {
    return (
        <main>
            <SwearJarForm swearJarId={swearJarId} />
        </main>
    )
}