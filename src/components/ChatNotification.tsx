interface ChatNotificationProps {
    user: { displayName: string } | null;
    unreadMessagesCount: number;
}

export default function ChatNotification({
                                             user,
                                             unreadMessagesCount,
                                         }: ChatNotificationProps) {
    return (
        <div className="relative">
            <button
                className="text-white hover:text-gray-200 focus:outline-none flex items-center"
                disabled={!user}
            >
                Chat
                {unreadMessagesCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full text-sm w-6 h-6 flex items-center justify-center">
            {unreadMessagesCount}
          </span>
                )}
            </button>
        </div>
    );
}