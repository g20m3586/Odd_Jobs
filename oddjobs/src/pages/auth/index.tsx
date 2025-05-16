// src/pages/auth/index.tsx
import AuthForm from "../../components/AuthForm";
import Navbar from "../../components/Navbar";

export default function AuthPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <AuthForm />
      </main>
    </>
  );
}
