"use client"

import { signIn } from "next-auth/react"

async function formSubmit(formData: FormData) {
  const response = await signIn("credentials", {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    callbackUrl: "/",
  })
  console.log(response)
}

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