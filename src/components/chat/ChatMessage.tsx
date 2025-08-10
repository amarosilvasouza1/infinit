import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const chatMessageVariants = cva(
    "relative p-3 rounded-lg max-w-xs lg:max-w-md",
    {
        variants: {
            variant: {
                sent: "bg-indigo-600 text-white rounded-br-none self-end",
                received: "bg-gray-700 text-white rounded-bl-none self-start",
            },
            animated: {
                true: "overflow-hidden",
                false: "",
            }
        },
        defaultVariants: {
            variant: "received",
            animated: false,
        },
    }
);

// Placeholder for cloud animation
const CloudAnimation = () => (
    <div className="absolute top-0 left-0 w-full h-full opacity-10">
        {/* This would be a more complex SVG or CSS animation */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#pattern-clouds)" />
            <defs>
                <pattern id="pattern-clouds" patternUnits="userSpaceOnUse" width="100" height="100">
                    <path d="M 10 50 C 10 20, 40 20, 40 40 C 60 20, 90 20, 90 50" stroke="white" fill="transparent" strokeWidth="1" />
                </pattern>
            </defs>
        </svg>
    </div>
);


export interface ChatMessageProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatMessageVariants> {
    avatarSrc: string;
    avatarFallback: string;
    message: string;
    isGroupMessage?: boolean;
    senderName?: string;
}

const ChatMessage = ({ className, variant, animated, avatarSrc, avatarFallback, message, isGroupMessage, senderName, ...props }: ChatMessageProps) => {
    const isSent = variant === "sent";
    
    const avatar = (
        <Avatar className="self-end">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
    );

    return (
        <div className={cn("flex items-start gap-3", isSent ? "justify-end" : "justify-start")}>
            {!isSent && avatar}
            <div className={cn(chatMessageVariants({ variant, animated }), className)} {...props}>
                {animated && <CloudAnimation />}
                {isGroupMessage && !isSent && <p className="text-xs font-bold text-purple-400 mb-1">{senderName}</p>}
                <p>{message}</p>
            </div>
            {isSent && avatar}
        </div>
    );
};

export default ChatMessage;
