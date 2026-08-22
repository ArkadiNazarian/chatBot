import { useFormik } from "formik";
import * as yup from "yup";
import { createPortal } from "react-dom";

interface RegisterForm {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface RegisterProps {
    mode?: 'signup' | 'login'
}

export const RegisterModal = (props: RegisterProps) => {
    const initialState: RegisterForm = {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
    };

    const validationSchema = yup.object({
        email: yup
            .string()
            .email("Invalid email")
            .required("Email is required"),
        password: yup
            .string()
            .required("Password is required"),
        firstName: yup
            .string()
            .required("First name is required"),
        lastName: yup
            .string()
            .required("Last name is required"),
    });

    const onSubmit = (data: RegisterForm) => {
        console.log(data);
    };

    const formik = useFormik({
        initialValues: initialState,
        validationSchema,
        onSubmit,
    });


    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black opacity-50 transition-opacity"
                aria-hidden="true"
            />

            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div
                    className="relative inline-block w-full max-w-lg transform overflow-hidden rounded-lg bg-[#303030] px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    {/* Header */}
                    <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <svg
                                className="h-6 w-6 text-green-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        <div className="mt-3 text-center sm:mt-5">
                            <h3
                                className="text-lg font-medium leading-6 text-zinc-100"
                                id="modal-title"
                            >
                                Sign up
                            </h3>

                            <div className="mt-2">
                                <p className="text-sm text-zinc-100">
                                    Already have an account?{" "}
                                    <a
                                        href="#"
                                        className="font-medium text-zinc-100 hover:text-zinc-300 transition-all"
                                    >
                                        Sign in
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={formik.handleSubmit} className="mt-5">
                        <div className="overflow-hidden sm:rounded-md">
                            <div className="space-y-6 px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-6 gap-6">
                                    {/* First name */}
                                    <div className="col-span-6 sm:col-span-3">
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formik.values.firstName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="first name"
                                            className="mt-1 w-full rounded-md outline-none bg-black shadow-sm sm:text-sm h-8 px-1"
                                        />

                                        {formik.touched.firstName &&
                                            formik.errors.firstName && (
                                                <p className="mt-1 text-sm text-[#ff9b97]">
                                                    {formik.errors.firstName}
                                                </p>
                                            )}
                                    </div>

                                    {/* Last name */}
                                    <div className="col-span-6 sm:col-span-3">

                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formik.values.lastName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="last name"
                                            className="mt-1 w-full rounded-md outline-none bg-black shadow-sm sm:text-sm h-8 px-1"
                                        />

                                        {formik.touched.lastName &&
                                            formik.errors.lastName && (
                                                <p className="mt-1 text-sm text-[#ff9b97]">
                                                    {formik.errors.lastName}
                                                </p>
                                            )}
                                    </div>

                                    {/* Email */}
                                    <div className="col-span-6">


                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            autoComplete="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="email"
                                            className="mt-1 w-full rounded-md outline-none bg-black shadow-sm sm:text-sm h-8 px-1"
                                        />

                                        {formik.touched.email &&
                                            formik.errors.email && (
                                                <p className="mt-1 text-sm text-[#ff9b97]">
                                                    {formik.errors.email}
                                                </p>
                                            )}
                                    </div>

                                    {/* Password */}
                                    <div className="col-span-6">


                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            autoComplete="new-password"
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="password"
                                            className="mt-1 w-full rounded-md outline-none bg-black shadow-sm sm:text-sm h-8 px-1"
                                        />

                                        {formik.touched.password &&
                                            formik.errors.password && (
                                                <p className="mt-1 text-sm text-[#ff9b97]">
                                                    {formik.errors.password}
                                                </p>
                                            )}
                                    </div>
                                </div>
                                <div className="">

                                    <button
                                        type="submit"
                                        className="w-full bg-zinc-100 p-2 rounded-4xl text-black cursor-pointer hover:bg-zinc-300 transition-all"
                                    >
                                        Create account
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}

                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};