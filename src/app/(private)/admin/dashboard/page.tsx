'use client';
import LogoutButton from "@/components/functional/logout-button";
import { IUser } from "@/interfaces";
import usersGlobalStore, { IUsersGlobalStore } from "@/store/users-store";

import React from "react";



function AdminDashboardPage() {
  
  const {user} = usersGlobalStore() as IUsersGlobalStore;

  if (!user) {
    return "Unauthorized";
  }

  return (
    <div className="flex flex-col gap-5">
      <h1>Admin DashboardPage</h1>
      <p>Welcome {user.id}!</p>
      <p>Welcome, {user.name}!</p>
      <p>Welcome, {user.email}!</p>
      <p>Your role: {user.role}</p>
      
     
    </div>
  );
}

export default AdminDashboardPage;
