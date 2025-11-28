"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const CheckEmptyPath = () => {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const getUser = async () => {
      if (pathname === "/") {
        router.push("/dashboard");
      }
    };
    getUser();
  }, [router, pathname]);
  return null;
};

export default CheckEmptyPath;
