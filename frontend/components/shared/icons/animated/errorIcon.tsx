export default function ErrorIcon() {
    return (
        <div className="w-5 h-5 bg-error opacity-0 rounded-full rotate-45 relative animate-circle delay-[100ms]">
            <div className="absolute w-3 h-0.5 bg-primary-foreground rounded opacity-0 bottom-[9px] left-[4px] animate-firstLine"></div>
            <div className="absolute w-3 h-0.5 bg-primary-foreground rounded opacity-0 bottom-[9px] left-[4px] rotate-90 animate-secondLine"></div>
        </div>
    )
}