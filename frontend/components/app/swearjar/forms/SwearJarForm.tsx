"use client"
import Confetti from 'react-confetti-boom';
import { usePathname, useRouter } from 'next/navigation';
import { FieldError, FormProvider, useForm } from "react-hook-form";
import toast from 'react-hot-toast';
import { SwearJarApiResponse } from '@/lib/apiTypes';
import { SwearJarWithOwners, User } from '@/lib/types';
import { fetcher } from '@/lib/utils';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Textarea } from "@/components/ui/shadcn/textarea";
import AddUserComboBox from "./AddUserComboBox";
import ErrorMessage from '@/components/shared/ErrorMessage';

export default function SwearJarForm({ swearJarId }: { swearJarId?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const isEditMode = pathname.endsWith('/edit')
    const queryClient = useQueryClient()

    // if isEditMode, fetch SJ data
    const { data: { swearJar: initialSJData } = {}, isLoading } = useQuery<SwearJarApiResponse>({
        queryKey: [`swearjar?id=${swearJarId}`],
        queryFn: () => fetcher<SwearJarApiResponse>(`/api/swearjar?id=${swearJarId}`),
        refetchOnWindowFocus: "always",
        enabled: isEditMode,
    });
    const methods = useForm<SwearJarWithOwners>({
        defaultValues: {
            Name: "",
            Desc: "",
            Owners: []
        }
    });

    useEffect(() => {
        if (isEditMode && initialSJData) {
            methods.reset({
                Name: initialSJData.Name,
                Desc: initialSJData.Desc,
                Owners: initialSJData.Owners
            });
        }
    }, [initialSJData]);

    const { register, handleSubmit, formState: { isSubmitSuccessful, errors, isDirty } } = methods;
    const editMutation = useMutation({
        mutationFn: (data: SwearJarWithOwners) => 
            fetch('/api/swearjar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, SwearJarId: initialSJData?.SwearJarId }),
            }).then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(`Update swear jar failed: ${errorData.error || response.statusText}`);
                    });
                }
                return response.json();
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['swearjar'] });
            queryClient.invalidateQueries({ queryKey: [`swearjar?id=${swearJarId}`] });
            toast.success(`${data.swearJar.Name} updated successfully!`, { position: "top-center" });
            setTimeout(() => {
                router.push(`/swearjar/${data.swearJar.SwearJarId}/view`)
            }, 2000);
        },
        onError: (error) => {
            console.error('Update swear jar failed:', error);
            toast.error("Something went wrong!", { id: 'edit-swearjar-error', position: "top-center" });
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: SwearJarWithOwners) => 
            fetch('/api/swearjar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(`Create swear jar failed: ${errorData.error || response.statusText}`);
                    });
                }
                return response.json();
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['swearjar'] });
            toast.success('Swear Jar created successfully!', { position: "top-center" });
            setTimeout(() => {
                router.push(`/swearjar/${data.swearJar.SwearJarId}/view`)
            }, 2000);
        },
        onError: (error) => {
            console.error('Create swear jar failed:', error);
            toast.error("Something went wrong!", { id: 'create-swearjar-error', position: "top-center" });
        }
    });

    const onSubmit = async (data: SwearJarWithOwners) => {
        if (isEditMode) {
            editMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) return <div>Loading...</div>
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
                            <Button 
                                type="submit" 
                                className="w-full sm:font-semibold bg-primary hover:opacity-80 hover:text-foreground" 
                                disabled={isSubmitSuccessful}
                            >
                                {isEditMode ? 'Update' : 'Create!'}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
                {isSubmitSuccessful && !isEditMode &&
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
