"use client";
import React from "react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/server-actions/users";

function LogoutButton() {
  const router = useRouter();
  
  const onClick = async () => {
    try {
      const response = await logoutUser();

      if (response.success) {
        toast.success(response.message);
        router.replace("/login");
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An error occurred during logout. Please try again.");
    }
  };

  return <Button onClick={onClick} className="w-max">Logout</Button>;
}

export default LogoutButton;
