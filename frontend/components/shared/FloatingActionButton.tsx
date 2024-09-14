import { Button } from "@/components/ui/shadcn/button";
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

export default function FloatingActionButton() {
    return (
        <Drawer>
            <DrawerTrigger
                className="flex items-center justify-center bottom-14 w-14 h-14 fixed right-8 bg-primary hover:bg-primary/70 rounded-full shadow-lg z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >

                <PiTipJarLight size={40} />
            </DrawerTrigger>
            <DrawerContent className="bg-white h-[70dvh]">
                <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                    <DrawerDescription>This action cannot be undone.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                    <Button>Submit</Button>
                    <DrawerClose>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    );
}