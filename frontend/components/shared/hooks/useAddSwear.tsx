import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import toast, { ErrorIcon } from 'react-hot-toast';
import { BaseResponse } from '@/lib/apiTypes';
import { swearDescriptions } from '@/lib/constants';

export function useAddSwear(swearJarId: string) {
    const queryClient = useQueryClient();
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // mutation fn
    const addSwear = async () => {
        const response = await fetch('/api/swear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ swearJarId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || response.statusText);
        }

        const data = await response.json();
        return data;
    }

    const addSwearMutation = useMutation<BaseResponse, Error, undefined, { toastId: string }>({
        mutationFn: addSwear,
        onMutate: () => {
            const toastId = toast.success(
                swearDescriptions[Math.floor(Math.random() * swearDescriptions.length)],
                {
                    id: "add-swear-toast",
                    duration: 3000,
                    position: "top-center",
                    icon: <span className="text-xl">🤡</span>,
                }
            );
            return { toastId };
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [`swearjar?id=${swearJarId}`] });
            queryClient.invalidateQueries({ queryKey: [`swear?id=${swearJarId}`] });
            queryClient.invalidateQueries({ queryKey: ["swearjar", "trend", swearJarId, "days"] });
            queryClient.invalidateQueries({ queryKey: ["swearjar", "trend", swearJarId, "weeks"] });
            queryClient.invalidateQueries({ queryKey: ["swearjar", "trend", swearJarId, "months"] });
        },
        onError: (error: Error, variables, context) => {
            console.error('Failed to add swear:', error);
            if (context?.toastId) {
                toast.error("Failed to add swear :'(", {
                    id: context.toastId,
                    duration: 3000,
                    position: 'top-center',
                    icon: <ErrorIcon />,
                });
            }
        },
    });

    const handleAddSwear = async () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            addSwearMutation.mutate(undefined);
        }, 500);
    }

    return { handleAddSwear, addSwearMutation };
}
