"use client"
import { fetcher } from '@/lib/utils';
import { SwearJarApiResponse } from '@/lib/apiTypes';
import { SwearJarWithId } from '@/lib/types';
import { useAddSwear } from '@/components/shared/hooks/useAddSwear';
import { usePathname } from 'next/navigation';

import { useMediaQuery } from 'usehooks-ts'
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { Button } from "@/components/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/shadcn/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/shadcn/drawer";
import { ChevronDown } from "lucide-react"
import { PiTipJarLight } from "react-icons/pi";
import SwearJarSelector from './SwearJarSelector';
import ErrorAlert from '@/components/shared/ErrorAlert';

export default function FloatingActionButton({ userId }: { userId: string }) {
  // Hide FAB if on `/swearjar/create` page
  const pathname = usePathname();
  const shouldHideFAB = pathname === '/swearjar/create';
  if (shouldHideFAB) {
    return null;
  }

  const { data, error, isLoading } = useQuery<SwearJarApiResponse>({
    queryKey: [`swearjar`],
    queryFn: () => fetcher<SwearJarApiResponse>('/api/swearjar'),
    refetchOnWindowFocus: "always",
  });
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [open, setOpen] = useState(false)

  const [selectedSwearJar, setSelectedSwearJar] = useState<SwearJarWithId | null>(null);
  useEffect(() => {
    // Ensure localStorage is only accessed on the client-side
    const lastSelectedSJString = localStorage.getItem('lastSelectedSwearJar');
    const lastSelectedSJ: SwearJarWithId | null = lastSelectedSJString ? JSON.parse(lastSelectedSJString) : null;

    if (lastSelectedSJ?.Owners) {
      const isOwner = lastSelectedSJ.Owners.includes(userId);
      if (isOwner) {
        setSelectedSwearJar(lastSelectedSJ);
      }
    }
  }, [userId]);
  const { handleAddSwear } = useAddSwear(selectedSwearJar?.SwearJarId || "")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="flex items-center justify-center bottom-20 right-8 w-14 h-14 fixed bg-primary hover:bg-primary/70 rounded-full shadow-lg z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <PiTipJarLight size={40} />
        </DialogTrigger>
        <DialogContent className="bg-white w-[425px]">
          {
            error ? <ErrorAlert message={error.message} /> :
              <>
                <DialogHeader className="m-0">
                  <DialogTitle className="text-lg leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground font-bold">Add to Swear Jar?</DialogTitle>
                  <SwearJarSelector
                    selectedSwearJar={selectedSwearJar}
                    setSelectedSwearJar={setSelectedSwearJar}
                    data={data?.swearJars}
                    isLoading={isLoading}
                  />
                  <DialogDescription className="text-sm text-foreground/50 tracking-tighter">
                    This will contribute one swear to the chosen jar.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    className="w-fit ml-auto px-5"
                    disabled={!selectedSwearJar}
                    onClick={() => {
                      handleAddSwear()
                      setOpen(false)
                    }}
                  >
                    Submit
                  </Button>
                </DialogFooter>
              </>
          }
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="flex items-center justify-center bottom-14 right-8 w-14 h-14 fixed bg-primary hover:bg-primary/70 rounded-full shadow-lg z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
        <PiTipJarLight size={40} />
      </DrawerTrigger>
      <DrawerContent className="bg-white">
        <Button className="absolute left-4 top-4 h-5 w-5 p-0 rounded-full bg-neutral-200 active:bg-neutral-400 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" onClick={() => setOpen(false)}>
          <ChevronDown className="h-4 aspect-square stroke-[3] text-foreground" />
        </Button>
        {
          error ? <ErrorAlert message={error.message} /> :
            <>
              <DrawerHeader>
                <DrawerTitle className="text-lg leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground font-bold">Add to Swear Jar?</DrawerTitle>
                <DrawerDescription className="text-sm text-input/50 tracking-tighter">Adds one swear to selected jar</DrawerDescription>
              </DrawerHeader>
              <div className="px-4">
                <SwearJarSelector
                  selectedSwearJar={selectedSwearJar}
                  setSelectedSwearJar={setSelectedSwearJar}
                  data={data?.swearJars}
                  isLoading={isLoading} />
              </div>
              <DrawerFooter>
                <Button
                  disabled={!selectedSwearJar}
                  onClick={() => {
                    handleAddSwear()
                    setOpen(false)
                  }}
                >
                  Submit
                </Button>
              </DrawerFooter>
            </>
        }
      </DrawerContent>
    </Drawer>
  );
}
