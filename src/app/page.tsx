"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleLogIn = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="text-2xl font-bold">SNIPPET VAULT</header>

      <div className="flex-grow"></div>
      <footer className="flex flex-col items-center mt-auto">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSignUp}
        >
          Sign Up
        </button>
        <p className="mt-4">
          Already an existing user?{" "}
          <a href="#" className="text-blue-500 underline" onClick={handleLogIn}>
            Log In
          </a>
        </p>
        <div className="mt-4 text-center ">
          <hr className="border-t border-gray-300 my-8 mx-9 mb-5 " />
          <p className="mb-4">Or continue with</p>
          <button className="m-2 p-2 bg-red-500 text-white rounded hover:bg-red-600">
            Google
          </button>
          <button className="m-2 p-2 bg-gray-800 text-white rounded hover:bg-gray-900">
            GitHub
          </button>
        </div>
      </footer>
    </div>
  );
}
