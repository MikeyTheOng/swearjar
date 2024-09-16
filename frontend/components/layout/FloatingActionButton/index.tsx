"use client"
import { fetcher } from '@/lib/utils';
import { SwearJarApiResponse } from '@/lib/apiTypes';
import { SwearJarProp } from '@/lib/types';
import { useAddSwear } from '@/components/shared/hooks/useAddSwear';
import { usePathname } from 'next/navigation';

import { useMediaQuery } from 'usehooks-ts'
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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
    queryFn: () => fetcher<SwearJarApiResponse>(`/api/swearjar`),
    refetchOnWindowFocus: "always",
  });
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [open, setOpen] = useState(false)
  const [selectedSwearJar, setSelectedSwearJar] = useState<SwearJarProp | null>(() => {
    // const lastSelectedSJString = localStorage.getItem('lastSelectedSwearJar');
    // const lastSelectedSJ: SwearJarProp | null = lastSelectedSJString ? JSON.parse(lastSelectedSJString) : null;

    // if (lastSelectedSJ?.Owners) {
    //   const isOwner = lastSelectedSJ.Owners.includes(userId);
    //   if (isOwner) {
    //     console.log("isOwner")
    //     return lastSelectedSJ;
    //   }
    // }
    return null;
  });
  const { handleAddSwear } = useAddSwear(selectedSwearJar?.SwearJarId || "")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="flex items-center justify-center bottom-14 w-14 h-14 fixed right-8 bg-primary hover:bg-primary/70 rounded-full shadow-lg z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
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

  // TODO: Add close button to top-right and replace with down arrow (discord)
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="flex items-center justify-center bottom-14 w-14 h-14 fixed right-8 bg-primary hover:bg-primary/70 rounded-full shadow-lg z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
        <PiTipJarLight size={40} />
      </DrawerTrigger>
      <DrawerContent className="bg-white">
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
                {/* <DrawerClose>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose> */}
              </DrawerFooter>
            </>
        }
      </DrawerContent>
    </Drawer>
  );
}
