"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/utils";
import { Button, Card, CardBody, Input, Link, Divider } from "@heroui/react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiPost("/api/signup", formData);
      router.push("/login");
    } catch (error: any) {
      alert(error?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Button
          variant="light"
          startContent={<ArrowLeft className="w-4 h-4" />}
          className="mb-6 text-gray-600"
          onPress={() => router.push("/")}
        >
          Back
        </Button>

        <Card className="border-0 shadow-sm">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Create account
              </h1>
              <p className="text-gray-600">
                Join to create your own snippet vault
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                isRequired
                variant="flat"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                isRequired
                variant="flat"
              />

              <Input
                label="Password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                isRequired
                variant="flat"
                endContent={
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="focus:outline-none"
                  >
                    {isVisible ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
              />

              <Button
                type="submit"
                className="w-full bg-black text-white font-medium"
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6">
              <Divider className="my-6" />
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-black font-medium">
                  Sign in
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
