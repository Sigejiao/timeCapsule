import { redirect } from "next/navigation";
import {
  AuthStatus,
} from "../components/auth-status.tsx";

import {
  TimeCapsule,
} from "../components/time-capsule.tsx";

import {
  auth,
} from "../src/auth.ts"

import{
  headers,
} from "next/headers" 


 
export default async function HomePage() {
  const session = 
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session){
    redirect("/sign-in")
  }

  return (
    <main className="pageShell">
      <AuthStatus 
        name={session.user.name}
        email={session.user.email}
      />
      <TimeCapsule 
        userId={session.user.id}
      />
    </main>
  );
}