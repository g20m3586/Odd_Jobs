"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name too short" }),
  email: z.string().email(),
  phone: z.string().min(6, { message: "Phone too short" }),
  password: z.string().min(8, { message: "Minimum 8 characters" }),
  role: z.enum(["customer", "business"]),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Please accept the terms" }),
  }),
})

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "customer",
      termsAccepted: false,
    },
    mode: "onChange",
  })

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      // Check if email already exists in profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", values.email)
        .single()

      if (existingProfile) {
        toast.warning("Email already registered.", {
          action: {
            label: "Sign In",
            onClick: () => router.push("/auth/login"),
          },
        })
        setLoading(false)
        return
      }

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      // Proceed with signup if email not found
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            phone: values.phone,
            role: values.role,
          },
        },
      })

      if (error) throw error

      toast.success("Account created! Check your email to verify.")
      reset()
    } catch (err) {
      toast.error(err.message || "Signup failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Sign Up</h1>
      
      <p className="mb-6 text-sm">
        Have an account already?{" "}
        <Link href="/auth/login" className="text-primary underline">
          Sign In
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" {...register("phone")} />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div>
          <Label>I am a:</Label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2">
              <input type="radio" value="customer" {...register("role")} defaultChecked />
              Customer
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="business" {...register("role")} />
              Business
            </label>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={watch("termsAccepted")}
            onCheckedChange={(checked) => {
              setValue("termsAccepted", Boolean(checked))
              clearErrors("termsAccepted")
            }}
          />
          <Label htmlFor="terms" className="text-sm">
            I accept the{" "}
            <Link href="/terms" target="_blank" className="underline text-primary">
              terms and conditions
            </Link>
          </Label>
        </div>
        {errors.termsAccepted && (
          <p className="text-red-500 text-sm">{errors.termsAccepted.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  )
}
