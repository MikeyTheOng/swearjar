"use client"
import { User } from '@/lib/types';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, FormProvider, FieldError } from "react-hook-form";
import AddUserComboBox from "./AddUserComboBox";
import ErrorMessage from '@/components/shared/ErrorMessage';
import toast from 'react-hot-toast';
import ErrorIcon from '@/components/shared/icons/animated/errorIcon';

export type FormData = {
    Name: string;
    Desc: string;
    additionalOwners: User[];
}

export default function CreateSwearJarForm() {
    const methods = useForm<FormData>({
        defaultValues: {
            Name: "",
            Desc: "",
            additionalOwners: []
        }
    });

    const { register, handleSubmit, formState: { errors } } = methods;
    const onSubmit = async (data: any) => {
        // TODO: Confetti
        // TODO: Redirect to the newly created swear jar
        console.log("Form Data:", data);
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
                toast(
                    <span className='bg-background-100'>
                        {errorData.error || response.statusText}
                    </span>,
                    {
                        id: "sign-up-error",
                        duration: 1500,
                        position: 'top-center',
                        style: {
                            background: 'var(--background)',
                        },
                        icon: <ErrorIcon />
                    }
                );
                throw new Error(`Create swear jar failed: ${errorData.error || response.statusText}`);
            }
            toast.success('Swear jar created successfully!', { position: "top-center" });
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
                        <Button type="submit" className="w-full sm:font-semibold shadow-lg bg-primary hover:opacity-80 hover:text-foreground">
                            Create!
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
