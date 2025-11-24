"use client";

import { useContext, useEffect, useState } from "react";
import { Work_Sans } from "next/font/google";
import Image from "next/image";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { useRouter } from "next/navigation";
import { signInWithFirebase, isAdminExist } from "@/service/api/auth.api";
import { useLoaderContext } from "@/context/loader";
import Loader from "./loader";

const worksans = Work_Sans({ weight: ["400", "500", "600", "700"] });

const Login = () => {
  const [showPassword, setShowPassword] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { isLoading, setIsLoading } = useLoaderContext();

  const handleSignIn = async () => {
    console.log("Sign In");

    setError("");

    if (!email) {
      setError("Please enter email");
      return;
    } else if (!email.includes("@")) {
      setError("Please enter valid email address");
      return;
    }

    if (!password) {
      setError("Please enter password");
      return;
    } else if (password && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setIsLoading(true);
      const adminCheck = await isAdminExist(email);

      if (!adminCheck.success) {
        setError("Admin user not found.");
        return;
      }

      const response = await signInWithFirebase(email, password);

      if (response.success && response.idToken) {
        localStorage.setItem("idToken", response.idToken);
        router.push("/admin/notes-management");
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-row h-screen w-screen bg-white ${worksans.className}`}
    >
      {isLoading && <Loader />}
      <>
        <div className="w-1/2 h-full relative">
          <Image
            src="/images/login-bg.svg"
            className="object-cover w-full h-full"
            fill
            alt="Login"
            priority
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/images/logo.svg"
              width={400}
              height={400}
              alt="Kshipra Logo"
              priority
            />
          </div>
        </div>
        <div className="w-1/2 flex flex-col items-center justify-center gap-12">
          <h1 className="text-4xl font-bold text-[#1E4640]">
            👋 Welcome To <span className="text-[#7DB4AB]">KSHIPRA</span>
          </h1>
          <div className="flex flex-col w-[350px] items-center justify-center gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Image
                  src="/images/email.svg"
                  width={20}
                  height={20}
                  alt="Email"
                />
              </div>
              <input
                type="email"
                placeholder="Email address"
                className="border border-gray-300 rounded-xl p-3 pl-12 w-full text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Image
                  src="/images/password.svg"
                  width={20}
                  height={20}
                  alt="Password"
                />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="border border-gray-300 rounded-xl p-3 pl-12 w-full pr-20 text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-4 flex items-center text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <IoMdEye size={24} />
                ) : (
                  <IoMdEyeOff size={24} />
                )}
              </button>
            </div>
          </div>
          <div
            className="-mt-4 flex flex-col items-center justify-center gap-4"
            onClick={handleSignIn}
          >
            <button className="bg-[#1E4640] w-[350px] text-white p-3 rounded-xl py-3 text-lg font-medium hover:bg-opacity-90 transition-colors">
              Sign In
            </button>
            <div className="relative text-red-500">{error}</div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Login;
