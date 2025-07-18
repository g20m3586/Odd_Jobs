import * as z from "zod"

export const signupSchema = z.object({
  name: z.string().min(2, { message: "Name is too short" }),
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, { message: "Enter a valid phone number" }),
  role: z.enum(["freelancer", "client"], {
    required_error: "Select your role",
  }),
})
