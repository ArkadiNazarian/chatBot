'use clinet'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface IUserModel {
    userData: {
        firstName: string,
        lastName: string,
        email: string,
        _id: string
    };
    setUserData: (data: IUserModel['userData']) => void;
}

export const useUserStore = create<IUserModel>()(
    devtools(
        persist(
            (set) => ({
                userData: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    _id: ''
                },
                setUserData: (data: IUserModel['userData']) => set((state) => ({ userData: data }), undefined, "set user data"),
            }),
            {
                name: 'ai-chat-app',
            }
        )
    )
)