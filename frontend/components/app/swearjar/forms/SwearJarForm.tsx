"use client"
import Confetti from 'react-confetti-boom';
import { SwearJarWithOwners, User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation'

import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { useForm, FormProvider, FieldError } from "react-hook-form";
import AddUserComboBox from "./AddUserComboBox";
import ErrorMessage from '@/components/shared/ErrorMessage';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';

export default function SwearJarForm({ initialSJData }: { initialSJData: SwearJarWithOwners }) {
    const router = useRouter()
    const pathname = usePathname()
    const isEditMode = pathname.endsWith('/edit')

    const methods = useForm<SwearJarWithOwners>({
        defaultValues: {
            Name: initialSJData?.Name || "",
            Desc: initialSJData?.Desc || "",
            Owners: initialSJData?.Owners || []
        }
    });

    const { register, handleSubmit, formState: { isSubmitSuccessful, errors } } = methods;
    const onSubmit = async (data: SwearJarWithOwners) => {
        console.log("Form data:", data)
        try {
            // const url = isEditMode ? `/api/swearjar/${initialSJData?.id}` : '/api/swearjar'; // TODO
            const url = '/api/swearjar';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                const errorData = await response.json();
                toast.error("Something went wrong!", { id: `${isEditMode ? 'edit' : 'create'}-swearjar-error`, position: "top-center" });
                throw new Error(`${isEditMode ? 'Update' : 'Create'} swear jar failed: ${errorData.error || response.statusText}`);
            }
            
            const resData = await response.json();
            toast.success(`Swear Jar ${isEditMode ? 'updated' : 'created'} successfully!`, { position: "top-center" });
            setTimeout(() => {
                router.push(`/swearjar/${resData.swearjar.SwearJarId}/view`)
            }, 2000);
        } catch (error) {
            console.error(`${isEditMode ? 'Update' : 'Create'} swear jar failed:`, error);
        }
    };

    return (
        <Card className="border-transparent shadow-none md:border-neutral-200 md:p-4 md:rounded-2xl md:bg-white w-full">
            <CardContent className="p-0">
                <FormProvider {...methods}>
                    <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <Label htmlFor="Name">Name</Label>
                            <Input
                                className="mt-1 bg-white"
                                type="text"
                                id="Name"
                                placeholder="The Procrastination Fund!"
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
                                <span className="text-xs text-foreground/30 tracking-tighter italic font-normal">
                                    (optional)
                                </span>
                            </Label>
                            <Textarea
                                className="mt-1 bg-white"
                                placeholder="Turning delay into dollars, one slip-up at a time"
                                id="Desc"
                                {...register("Desc")}
                            />
                            {errors.Desc && <ErrorMessage error={errors.Desc} />}
                        </div>
                        <div>
                            <AddUserComboBox />
                            <p className="mt-0.5 max-w-[80%}] text-sm text-foreground/50 tracking-tighter">
                                Add other owners
                            </p>
                            {errors.Owners && (
                                <ErrorMessage error={errors.Owners as FieldError} />
                            )}
                        </div>
                        <div>
                            <Button type="submit" className="w-full sm:font-semibold bg-primary hover:opacity-80 hover:text-foreground" disabled={isSubmitSuccessful}>
                                {isEditMode ? 'Update' : 'Create!'}
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
            </CardContent>
        </Card>
    );
}
