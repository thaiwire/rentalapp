"use server";

import supabase from "@/config/supabase-config";
import { IUser } from "@/interfaces";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

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
    role: payload.role ?? "user",
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

export const loginUser = async ({ email, password, role }: Partial<IUser>) => {
  try {
    // step1: check if user with the email exists
    const userResponse = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email);
    if (userResponse.error) {
      return {
        success: false,
        message: userResponse.error.message || "Error fetching user.",
      };
    }

    const user = userResponse.data[0];
    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (user.role !== role) {
      return {
        success: false,
        message: `${role} is not a valid role for this user.`,
      };
    }

    // step2: compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password!, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid password.",
      };
    }

    // step3: if password matches, generate a JWT token and return it
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    const cookieStore = await cookies();
    cookieStore.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    cookieStore.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return {
      success: true,
      message: "Login successful.",
      data: {
        user,
        token,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Error during login.",
    };
  }
};

export const getLoggedInUser = async () => {
  try {
    // step1: get the token from cookies
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("access_token")?.value;

    const decryptedToken = jwt.verify(
      accessToken!,
      JWT_SECRET,
    ) as {
      userId: string;
      email: string;
    };
    const userResponse = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", decryptedToken.userId);
    if (userResponse.error || !userResponse.data || userResponse.data.length === 0) {
      return {
        success: false,
        message: userResponse.error?.message || "Error fetching user.",
      };
    }

    const user = userResponse.data[0];
    delete user.password; // Remove password from the response

    return {
      success: true,
      message: "User fetched successfully.",
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching logged-in user.",
    };
  }
};

export const logoutUser = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("user_role");

    return {
      success: true,
      message: "Logout successful.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error during logout.",
    };
  }
};
