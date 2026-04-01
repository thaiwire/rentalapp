'use server'
import supabase from "@/config/supabase-config";

export const uploadFileAndGetUrl = async (file: File) => {
  try {
    const filePath = `uploads/${file.name}_${Date.now()}`;
    const { data, error } = await supabase.storage
      .from("nava")
      .upload(filePath, file);

    if (error) {
      throw new Error(error.message);
    }

    const urlResponse: any = await supabase.storage.from("nava").getPublicUrl(filePath);

    if (urlResponse.error) {
      throw new Error(urlResponse.error.message);
    }

    return {
      success: true,
      data: urlResponse.data.publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred during file upload. Please try again.",
    };
  }
};
