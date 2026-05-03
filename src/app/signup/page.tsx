"use client"

/**
 * Handles sign-up form submission by calling the users API endpoint.
 *
 * @param formData - The submitted form data containing `name`, `email`,
 *   and `password`.
 * @throws {Error} If the API request fails.
 */
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

/**
 * Sign-up page component. Renders a registration form with name, email,
 * and password fields.
 */
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