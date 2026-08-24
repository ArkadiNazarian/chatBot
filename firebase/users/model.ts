export interface IGetUserModel {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface ICheckEmailModel {
    email: string;
}

export interface ISignInModel {
    email: string;
    password: string;
}

export interface ISignUpModel {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
