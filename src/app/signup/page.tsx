"use client"

async function handleSubmit(formData: FormData) {
  const response = await fetch("/api/auth/users", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string
    })
  })

  if (!response.ok) throw new Error("Something happened");

  console.log("Created your user");
}

export default function Home() {
  return (
    <div>
      <form action={handleSubmit}>
        <label htmlFor="">Name:</label>
        <input name="name" type="text" />
        <label htmlFor="">Email:</label>
        <input name="email" type="email" />
        <label htmlFor="">Password: </label>
        <input name="password" type="password" />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}