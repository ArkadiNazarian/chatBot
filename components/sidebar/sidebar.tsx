import { db } from "@/firebase/config";
import { RoomModel } from "@/firebase/rooms/model";
import { useUserStore } from "@/store/zustand";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export const Sidebar = () => {

    const userStore = useUserStore()

    const [rooms, setRooms] = useState<Array<{ id: string; } & RoomModel>>([])

    useEffect(() => {

        const get_chats_collection = query(collection(db, "rooms"), where("userId", "==", userStore.userData._id ?? "0"));

        onSnapshot(get_chats_collection, (snapshot) => {
            const array = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Array<{ id: string; } & RoomModel>
            setRooms(array)
        },
            (error) => {
                console.error('Firebase connection error:', error);
            })
    }, [userStore.userData._id])

    return (
        <div className="flex flex-col w-64 h-screen bg-gray-900 p-4 absolute left-0 top-0 gap-3 overflow-y-auto">
            <div className="text-blue-500 text-xl pb-6">AI CHATBOT</div>
            {
                rooms.map((room, index) => {
                    return (
                        <div key={index}>

                            <button className="text-left text-zinc-200 hover:bg-gray-700 rounded w-full px-2 hover:cursor-pointer transition-all">{room.title}</button>
                        </div>
                    )
                })
            }
        </div>
    )
}