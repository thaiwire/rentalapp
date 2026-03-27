"use server";

import supabaseConfig from "@/config/supabase-config";
import { IUser } from "@/interfaces";
import bcrypt from "bcryptjs";

export const registerUser = async ({
  name,
  email,
  password,
}: Partial<IUser>) => {
  try {
    // step 1 check if user already exists
    const userExistsResponse = await supabaseConfig
      .from("user_profiles")
      .select("*")
      .eq("email", email);
    if (userExistsResponse.data?.length) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    // step2 hash the password
    const hashedPassword = await bcrypt.hash(password || "", 10);

    // step 3 insert the new user into the database
    const user = {
      name: name || "",
      email: email || "",
      password: hashedPassword,
      role: "user",
      is_active: true,
      created_at: new Date(),
      profile_pic : ''
    };

    const saveUserResponse = await supabaseConfig
      .from("user_profiles")
      .insert([user])
     

    if (saveUserResponse.error) {
      throw new Error(saveUserResponse.error.message);
    }

    // step 4 return success response
    return {
      success: true,
      message: "User registered successfully",
      user: saveUserResponse.data,
    };

  } catch (error) {
    return {
      success: false,
      message: "Error registering user",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
