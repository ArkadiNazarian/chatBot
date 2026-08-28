import { addDoc, collection, getDocs, limit, orderBy, query, where } from "firebase/firestore"
import { db } from "../config";
import { RoomModel } from "./model";

const collection_name = 'rooms'
const rooms__collection = collection(db, collection_name);


export const MakeRoom = async (value: RoomModel) => {
    try {
        const docRef = await addDoc(rooms__collection, {
            _id: value._id,
            timestamp: value.timestamp,
            title: value.title,
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