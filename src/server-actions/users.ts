"use server";

import supabase from "@/config/supabase-config";
import { IUser } from "@/interfaces";
import bcrypt from "bcryptjs";

export const registerUser = async (payload: Partial<IUser>) => {
  // step1: check if user with the same email already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", payload.email);
  if (fetchError) {
    return {
      success: false,
      message: fetchError?.message || "Error checking existing user.",
    };
  }
  if (existingUser && existingUser.length > 0) {
    return {
      success: false,
      message: "A user with this email already exists.",
    };
  }

  // step2: Hash the password before storing in user_profiles
  const hashedPassword = await bcrypt.hash(payload.password || "", 10);

  console.log("Hashed password:", hashedPassword);
  // step3: Create user profile in database
  const rowData = {
    ...payload,
    password: hashedPassword,
    is_active: true,
    profile_pic: "",
  };
  const { data: newUser, error: insertError } = await supabase
    .from("user_profiles")
    .insert(rowData);

  if (insertError) {
    return {
      success: false,
      message: insertError?.message || "Error creating user profile.",
    };
  }
  return {
    success: true,
    message: "User profile created successfully.",
    data: newUser,
  };
};
