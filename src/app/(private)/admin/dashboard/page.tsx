import LogoutButton from "@/components/functional/logout-button";
import { IUser } from "@/interfaces";
import { getLoggedInUser } from "@/server-actions/users";
import React from "react";



async function AdminDashboardPage() {
  const userResponse = await getLoggedInUser();

  if (!userResponse.success) {
    return "Unauthorized";
  }
  
  const user:IUser = userResponse.data;

  if (user.role !== "admin") {
    return "Unauthorized";
  }

  return (
    <div className="flex flex-col gap-5">
      <h1>Admin DashboardPage</h1>
      <p>Welcome {user.id}!</p>
      <p>Welcome, {user.name}!</p>
      <p>Welcome, {user.email}!</p>
      <p>Your role: {user.role}</p>
      
      <LogoutButton />
    </div>
  );
}

export default AdminDashboardPage;
