import { checkEmail, signUp } from "@/firebase/users/firestore-action";
import { ISignUpModel } from "@/firebase/users/model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const signUpData: ISignUpModel = {
            _id: body._id,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password,
           
        };

        const isEmailExist = await checkEmail({ email: body.email });
        if (isEmailExist.status === 404) {
            return NextResponse.json({
                success: false,
                message: 'Email already exists',
                data: null
            }, { status: 400 });
        }

        const result = await signUp(signUpData);

        if (result.status === 200) {
            return NextResponse.json({
                success: true,
                message: 'User created successfully',
                data: result.response
            }, { status: 201 });
        } else {
            return NextResponse.json({
                success: false,
                message: "Failed to create user",
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