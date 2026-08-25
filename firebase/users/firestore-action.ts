import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore"
import { db } from "../config"
import { ICheckEmailModel, IGetUserModel, ISignInModel, ISignUpModel } from "./model"

const COLLECTION_NAME = 'users'
const USER_COLLECTION = collection(db, COLLECTION_NAME)

export const checkEmail = async (value: ICheckEmailModel) => {
    try {
        const getUserQuery = query(USER_COLLECTION, where("email", "==", value.email))
        const querySnapshot = await getDocs(getUserQuery);
        if (!querySnapshot.empty) {
            let user: IGetUserModel | undefined;
            querySnapshot.forEach((doc) => {
                user = doc.data() as IGetUserModel;
            });
            return {
                status: 200,
                response: user
            };
        } else {
            return {
                status: 404,
            }
        }
    } catch (error) {
        return {
            status: 500
        }
    }

}

export const signIn = async (value: ISignInModel) => {
    try {
        const getUserQuery = query(USER_COLLECTION, where("email", "==", value.email), where("password", "==", value.password))
        const querySnapshot = await getDocs(getUserQuery);
        if (!querySnapshot.empty) {
            let user;
            querySnapshot.forEach((doc) => {
                user = doc.data();
            });
            return {
                status: 200,
                response: user
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

export const signUp = async (value: ISignUpModel) => {
    try {
        const docRef = await addDoc(USER_COLLECTION, {
            _id: value._id,
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email,
            password: value.password,
        });
        return {
            status: 200,
            response: {
                _id: value._id,
                firstName: value.firstName,
                lastName: value.lastName,
                email: value.email,
                password: value.password,
            }
        };
    } catch (error) {
        return {
            status: 500
        }
    }

}