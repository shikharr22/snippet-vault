"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { apiPost } from "@/lib/utils";
import {
  Button,
  Card,
  CardBody,
  Input,
  Checkbox,
  Link,
  Divider,
} from "@heroui/react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value?.trim(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiPost("/api/login", formData);
      router.push("/dashboard");
    } catch (error: any) {
      alert(error?.message || "Login failed");
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
                Welcome back
              </h1>
              <p className="text-gray-600">Sign in to access your snippets</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                isRequired
                variant="flat"
                className="text-gray-900"
              />

              <Input
                label="Password"
                name="password"
                placeholder="Enter your password"
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

              <div className="flex justify-between items-center">
                <Checkbox
                  name="rememberMe"
                  isSelected={formData.rememberMe}
                  onValueChange={(checked) =>
                    setFormData((prev) => ({ ...prev, rememberMe: checked }))
                  }
                  size="sm"
                >
                  Remember me
                </Checkbox>
                <Link
                  href="/forgot-password"
                  size="sm"
                  className="text-gray-600"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white font-medium"
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6">
              <Divider className="my-6" />
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-black font-medium">
                  Sign up
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
