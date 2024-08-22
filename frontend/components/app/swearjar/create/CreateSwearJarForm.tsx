"use client"
import Confetti from 'react-confetti-boom';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, FormProvider, FieldError } from "react-hook-form";
import AddUserComboBox from "./AddUserComboBox";
import ErrorMessage from '@/components/shared/ErrorMessage';
import toast from 'react-hot-toast';

export type FormData = {
    Name: string;
    Desc: string;
    additionalOwners: User[];
}

export default function CreateSwearJarForm() {
    const router = useRouter()
    const methods = useForm<FormData>({
        defaultValues: {
            Name: "",
            Desc: "",
            additionalOwners: []
        }
    });

    const { register, handleSubmit, formState: { isSubmitSuccessful, errors } } = methods;
    const onSubmit = async (data: any) => {
        try {
            const response = await fetch('/api/swearJar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                const errorData = await response.json();
                toast.error("Something went wrong!", { id: "create-swearjar-error", position: "top-center" });
                throw new Error(`Create swear jar failed: ${errorData.error || response.statusText}`);
            }
            setTimeout(() => {
                router.push('/swearjar')
            }, 2000);
            const resData = await response.json();
            console.log("response:", resData);
            toast.success('Swear Jar created successfully!', { position: "top-center" });
        } catch (error) {
            console.error('Create swear jar failed:', error);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <FormProvider {...methods}>
                <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <Label htmlFor="Name">Name</Label>
                        <Input
                            className="mt-1 bg-white"
                            type="text"
                            id="Name"
                            placeholder="Name it! (e.g. The Procrastination Fund)"
                            autoComplete="off"
                            {...register("Name", { required: 'Name is required' })}
                        />
                        {errors.Name ? (
                            <ErrorMessage error={errors.Name} />
                        ) : (
                            <p className="mt-0.5 text-sm text-foreground/50 tracking-tighter">
                                Name your Swear Jar
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="Desc">
                            Desc{" "}
                            <span className="text-sm text-foreground/30 tracking-tighter italic font-normal">
                                (optional)
                            </span>
                        </Label>
                        <Textarea
                            className="bg-white"
                            placeholder="(e.g. Turning delay into dollars, one slip-up at a time)"
                            id="Desc"
                            {...register("Desc")}
                        />
                        {errors.Desc && <ErrorMessage error={errors.Desc} />}
                    </div>
                    <div>
                        <AddUserComboBox />
                        <p className="mt-0.5 max-w-[80%}] text-sm text-foreground/50 tracking-tighter">
                            Add emails of others who can access, contribute to, and <u>manage</u><span className="text-error">*</span> the Swear Jar
                        </p>
                        {errors.additionalOwners && (
                            <ErrorMessage error={errors.additionalOwners as FieldError} />
                        )}
                    </div>
                    <div>
                        <Button type="submit" className="w-full sm:font-semibold shadow-lg bg-primary hover:opacity-80 hover:text-foreground" disabled={isSubmitSuccessful}>
                            Create!
                        </Button>
                    </div>
                </form>
            </FormProvider>
            {isSubmitSuccessful &&
                <Confetti
                    mode="boom"
                    particleCount={100}
                    shapeSize={24}
                    deg={270}
                    launchSpeed={2}
                    x={0.5}
                    y={0.5}
                    colors={['#ff577f', '#ff884b', '#ffd384', '#fff9b0']}
                />
            }
        </div>
    );
}
