"use client";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Divider } from "@heroui/react";
import { Code, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleLogIn = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-lg mb-4">
            <Code className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Snippet Vault
          </h1>
          <p className="mt-2 text-gray-600">
            Store and organize your code snippets
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-black text-white font-medium"
                endContent={<ArrowRight className="w-4 h-4" />}
                onClick={handleSignUp}
              >
                Get Started
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={handleLogIn}
                  className="text-black font-medium hover:underline"
                >
                  Sign in
                </button>
              </div>

              <Divider className="my-4" />

              <div className="text-center text-xs text-gray-500">
                Or continue with
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="bordered"
                  className="border-gray-200 text-gray-700"
                >
                  Google
                </Button>
                <Button
                  variant="bordered"
                  className="border-gray-200 text-gray-700"
                >
                  GitHub
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="text-center text-xs text-gray-500">
          Simple. Fast. Secure.
        </div>
      </div>
    </div>
  );
}
