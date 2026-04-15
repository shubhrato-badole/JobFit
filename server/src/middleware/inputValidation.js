import { z } from "zod";

const email = z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(100);
const password = z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100);

export const RegisterSchema = z.object({
    name: z.string().trim().min(1, { message: "Name is required" }).max(100),
    email,
    password,
});
export const LoginSchema = z.object({
    email,
    password,
});

 export const validation = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.sucess) {
            const error = result.error.errors[0].message;
            return res.status(400).json({
                success: false,
                error,
            });
        }

        req.body = result.data;
        next();
    };
};
