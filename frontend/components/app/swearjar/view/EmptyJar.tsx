import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/shadcn/alert';
import { Button } from '@/components/ui/shadcn/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/shadcn/dialog';

export default function EmptyJar({ id }: { id: string }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { mutate, isPending, error } = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/swearjar/clear?id=${id}`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to empty jar');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['swearjar'] });
            queryClient.invalidateQueries({ queryKey: [`swearjar/stats?id=${id}`] });
            setOpen(false);
        },
        onError: (error) => {
            console.error("Failed to empty jar", error);
        }
    });

    const handleEmptyJar = () => {
        mutate();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex-1 border-secondary text-secondary bg-secondary/10 hover:bg-secondary/30 focus-visible:ring-secondary active:bg-secondary/30"
                >
                    Empty
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[359px] rounded-md">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This will reset the Swear Jar to $0. This action is irreversible.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>Failed to Empty Jar. Please try again.</AlertDescription>
                    </Alert>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="submit"
                        variant="outline"
                        className="order-2 sm:order-1"
                        onClick={handleEmptyJar}
                        disabled={isPending}
                    >
                        {isPending ? 'Emptying...' : 'Yes'}
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="order-1 sm:order-2">
                            No
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
;