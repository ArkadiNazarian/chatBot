import { GetChats } from "@/firebase/chats/firestore-action";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest,{ params }:  { params: Promise<{ roomId: string }> }) {
    try {

        const { roomId } = await params;

        if (!roomId) {
            return NextResponse.json({
                success: false,
                message: 'roomId is required.',
                data: null
            }, { status: 400 });
        }

        const chats = await GetChats(roomId);

        if(chats.status !== 200) {
            return NextResponse.json({
                success: false,
                message: 'Failed to retrieve chats.',
                data: null
            }, { status: 500 });
        }

        const sortedChats = chats.response?.sort((a, b) => a.timestamp - b.timestamp);

        return NextResponse.json({
            success: true,
            message: 'Chats retrieved successfully.',
            data: sortedChats || []
        });
    } catch (error) {

        return NextResponse.json({
            success: false,
            message: 'An unexpected error occurred. Please try again.',
            data: null
        }, { status: 500 });
    }

}
