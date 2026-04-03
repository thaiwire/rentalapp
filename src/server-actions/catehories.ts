"use server";

import supabase from "@/config/supabase-config";
import { ICategory } from "@/interfaces";

export const createCategory = async (category: Partial<ICategory>) => {
  try {
    const trimmedName = category.name?.trim();
    console.log("Creating category with name:", trimmedName);

    if (!trimmedName) {
      return {
        success: false,
        message: "Category name is required.",
      };
    }

    // Check for an existing category with the same name.
    const { data: existingCategory, error: existingError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", trimmedName)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }
    if (existingCategory) {
      return {
        success: false,
        message: "Category with the same name already exists.",
      };
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        ...category,
        name: trimmedName,
      })
      .select();
    if (error) {
      throw new Error(error.message);
    }
    return {
      success: true,
      message: "Category created successfully.",
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.message || "An error occurred while creating the category.",
    };
  }
};

export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return {
      success: true,
      message: "Categories fetched successfully.",
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.message || "An error occurred while fetching the categories.",
    };
  }
};

export const updateCategoryById = async (id: string, category: Partial<ICategory>) => {
  try {
    const trimmedName = category.name?.trim();

    if (category.name && !trimmedName) {
      return {
        success: false,
        message: "Category name is required.",
      };
    }

    if (trimmedName) {
      // Check for an existing category with the same name.
      const { data: existingCategory, error: existingError } = await supabase
        .from("categories")
        .select("id")
        .eq("name", trimmedName)
        .neq("id", id)
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }
      if (existingCategory) {
        return {
          success: false,
          message: "Category with the same name already exists.",
        };
      }
    }

    const { data, error } = await supabase
      .from("categories")
      .update({
        ...category,
        ...(trimmedName ? { name: trimmedName } : {}),
      })
      .eq("id", id);
      
    if (error) {
      throw new Error(error.message);
    }
    return {
      success: true,
      message: "Category updated successfully.",
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.message || "An error occurred while updating the category.",
    };
  }
};

export const deleteCategoryById = async (id: string) => {
    try {
        const { data, error } = await supabase
            .from("categories")
            .delete()
            .eq("id", id);
        if (error) {
            throw new Error(error.message);
        }
        return {
            success: true,
            message: "Category deleted successfully.",
            data: data,
        };
    } catch (error: any) {
        return {
            success: false,
            message:
                error.message || "An error occurred while deleting the category.",
        };
    }
}
