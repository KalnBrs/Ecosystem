"use client"

import { signIn } from "next-auth/react"

/**
 * Handles login form submission by invoking the NextAuth credentials provider.
 *
 * @param formData - The submitted form data containing `email` and `password`.
 */
async function formSubmit(formData: FormData) {
  const response = await signIn("credentials", {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    callbackUrl: "/",
  })
  console.log(response)
}

/**
 * Login page component. Renders an email/password sign-in form.
 */
export default function Home() {
  return (
    <div>
      <form action={formSubmit}>
        <label htmlFor="">Email:</label>
        <input name="email" type="email" />
        <label htmlFor="">Password: </label>
        <input name="password" type="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}