"use server";
import supabase from "@/config/supabase-config";
import { ItemInterface } from "@/interfaces";

export const addNewItem = async (item: Partial<ItemInterface>) => {
  try {
    const { data, error } = await supabase.from("items").insert([item]);

    if (error) {
      throw new Error(error.message);
    }
    return {
      success: true,
      message: "Item added successfully.",
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred while adding the item.",
    };
  }
};

export const getAllItems = async () => {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return {
      success: true,
      message: "Items fetched successfully.",
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred while fetching the items.",
    };
  }
};

export const getItemById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
    return {
      success: true,
      message: "Item fetched successfully.",
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred while fetching the item.",
    };
  }
};

export const updateItemById = async (
  id: string,
  item: Partial<ItemInterface>,
) => {
  try {
    const { data, error } = await supabase
      .from("items")
      .update(item)
      .eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
    return {
      success: true,
      message: "Item updated successfully.",
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred while updating the item.",
    };
  }
};

export const deleteItemById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
    return {
      success: true,
      message: "Item deleted successfully.",
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred while deleting the item.",
    };
  }
};
