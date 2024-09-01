import { Card, CardContent } from "@/components/ui/card";
import { GiMasonJar } from "react-icons/gi";
import { SlArrowRight } from "react-icons/sl";

export default function SwearJarCard() {
    return (
        <Card className="group box-border w-full bg-white rounded-2xl hover:shadow-md hover:translate-y-[-2px] transition-all ease-in-out duration-300">
            <CardContent className="p-4 relative">
                <div className="flex flex-col justify-between gap-2 w-full">
                    <div className="flex items-center">
                        <div className="box-border w-7 aspect-square p-0.5 bg-primary rounded-md flex items-center justify-center">
                            <GiMasonJar size={24} />
                        </div>
                        <div className="ml-2 flex flex-col overflow-hidden w-[80%]">
                            <p className="text-base font-normal tracking-tight">SwearJar Card</p>
                            <span className="-mt-1 text-foreground/50 text-xs font-normal overflow-hidden whitespace-nowrap overflow-ellipsis">
                                A penny a day, breaks the bad habit A penny a day, breaks the bad habit 
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <p className="ml-9 text-foreground/30 text-[10px] font-normal italic">Timothy Chang • 15h ago</p>
                    </div>
                </div>
                <div className="absolute right-0 inset-y-0 mr-2 flex items-center">
                    <SlArrowRight size={20} className="text-foreground/50 group-hover:text-foreground group-hover:scale-110 transition-all ease-in-out duration-300" />
                </div>
            </CardContent>
        </Card>
    );
}
