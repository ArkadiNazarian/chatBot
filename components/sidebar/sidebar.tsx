import { NewChatIcon } from "@/assets/icons";
import { db } from "@/firebase/config";
import { RoomModel } from "@/firebase/rooms/model";
import { useUserStore } from "@/store/zustand";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
    onClickNewChat: () => void;
}

export const Sidebar = (props: SidebarProps) => {

    const userStore = useUserStore()
    const router = useRouter()

    const [rooms, setRooms] = useState<Array<{ id: string; } & RoomModel>>([])

    useEffect(() => {

        const get_chats_collection = query(collection(db, "rooms"), where("userId", "==", userStore.userData._id ?? "0"));

        onSnapshot(get_chats_collection, (snapshot) => {
            const array = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Array<{ id: string; } & RoomModel>
            const sortedArray = array.sort((a, b) => b.timestamp - a.timestamp)
            setRooms(sortedArray)
        },
            (error) => {
                console.error('Firebase connection error:', error);
            })
    }, [userStore.userData._id])

    const onclickRoom = (roomId: string) => {
        router.push(`?roomId=${roomId}`)
    }

    return (
        <div className="flex flex-col w-64 h-screen bg-gray-900 p-4 absolute left-0 top-0 gap-3 overflow-y-auto">
            <p className="text-blue-500 text-xl pb-6">AI CHATBOT</p>
            <button onClick={props.onClickNewChat} className="text-left text-blue-400 hover:bg-gray-700 rounded w-full px-2 hover:cursor-pointer transition-all py-3 flex items-center gap-1">
                <NewChatIcon />
                New Chat
            </button>
            {
                rooms.map((room, index) => {
                    return (
                        <div key={room._id}>

                            <button onClick={() => onclickRoom(room._id)} className="text-left text-zinc-200 hover:bg-gray-700 rounded w-full px-2 hover:cursor-pointer transition-all">{room.title}</button>
                        </div>
                    )
                })
            }
        </div>
    )
}