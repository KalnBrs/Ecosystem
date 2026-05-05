"use client"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <h1>Hello</h1>
      <button onClick={() => signIn()}>Go to Login Page</button>
      <button onClick={() => router.push("/signup")}>Go to Sign Up Page</button>
    </div>
  );
}
