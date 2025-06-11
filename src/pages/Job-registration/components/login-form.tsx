"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/redux/store"
import { loginUser } from "@/redux/features/authSlice"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

interface LoginFormProps {
  onSuccess: () => void
}

export default function LoginForm() {
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {

      console.log(values)
      const response = await dispatch(loginUser(values))
      const result = response.payload

      if (!result?.success) {
        toast({
          title: "Authentication Failed",
          description: result?.message || "Please check your email and password and try again.",
          variant: "destructive",
        })
        return
      }

      // Login was successful
      // onSuccess()
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      })
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Something went wrong during the login process. Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address*</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password*</FormLabel>
                {/* <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgotten Password
                </a> */}
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-watney text-white hover:bg-watney/90">
          Log in
        </Button>
      </form>
    </Form>
  )
}
