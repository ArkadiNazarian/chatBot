import { addDoc, collection, getDocs, limit, orderBy, query, where } from "firebase/firestore"
import { db } from "../config";
import { ChatModel } from "./model";

const collection_name = 'chats'
const chats__collection = collection(db, collection_name);


export const GetLastChat = async (roomId: string) => {
    try {
        const getLastChatQuery = query(
            chats__collection,
            where("roomId", "==", roomId),
            orderBy("timestamp", "desc"),
            limit(1)
        );
        const querySnapshot = await getDocs(getLastChatQuery);
        if (!querySnapshot.empty) {
            let chat: ChatModel | undefined;
            querySnapshot.forEach((doc) => {
                chat = doc.data() as ChatModel;
            });
            return {
                status: 200,
                response: chat
            };
        } else {
            return {
                status: 404
            }
        }
    } catch (error) {
        return {
            status: 500
        }
    }
}

export const GetChats = async (roomId: string) => {

    try {
        const get_chats_query = query(collection(db, collection_name), where("roomId", "==", roomId))
        const querySnapshot = await getDocs(get_chats_query);
        const arr: Array<ChatModel> = [];

        querySnapshot.forEach((doc) => {
            arr.push(doc.data() as ChatModel);
        });


        return {
            status: 200,
            response: arr
        };

    } catch (error) {
        return {
            status: 500
        }
    }
}

export const SendMessage = async (value: ChatModel) => {
    try {
        const docRef = await addDoc(chats__collection, {
            _id: value._id,
            roomId: value.roomId,
            timestamp: value.timestamp,
            messages: value.messages,
            userId: value.userId
        });
        return {
            status: 200,
            response: docRef
        };
    } catch (error) {
        return {
            status: 500
        }
    }
}