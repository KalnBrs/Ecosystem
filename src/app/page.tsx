"use client"
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <div>
      <h1>Hello</h1>
      <button onClick={() => signIn()}>Go to Login Page</button>
      <button onClick={() => redirect("/signup")}>Go to Sign Up Page</button>
    </div>
  );
}
