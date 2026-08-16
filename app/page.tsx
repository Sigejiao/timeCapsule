import {
  AuthStatus,
} from "../components/auth-status.tsx";

import {
  TimeCapsule,
} from "../components/time-capsule.tsx";

export default function HomePage() {
  return (
    <main className="pageShell">
      <AuthStatus />
      <TimeCapsule />
    </main>
  );
}