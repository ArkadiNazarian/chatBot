import { checkEmail } from "@/firebase/users/firestore-action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const isEmailExist = await checkEmail({ email: body.email });
        if (isEmailExist.status === 200) {
            return NextResponse.json({
                success: true,
                message: 'User logged in successfully',
                data: isEmailExist.response
            }, { status: 201 });
        } else {
            return NextResponse.json({
                success: false,
                message: "Failed to login",
                data: null
            }, { status: 400 });
        }
        
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'An unexpected error occurred. Please try again.',
            data: null
        }, { status: 500 });
    }
}