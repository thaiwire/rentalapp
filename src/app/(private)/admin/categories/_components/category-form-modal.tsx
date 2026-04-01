"use client";

import { ICategory } from "@/interfaces";
import React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileAndGetUrl } from "@/helpers";
import {
  createCategory,
  updateCategoryById,
} from "@/server-actions/catehories";

interface CategoryFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedCategory?: ICategory | null;
  formType: "add" | "edit";
  onSuccess: () => void;
}

function CategoryFormModal({
  open,
  setOpen,
  selectedCategory,
  formType,
  onSuccess,
}: CategoryFormModalProps) {
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(
    null,
  );
  const [previewImageUrl, setPreviewImageUrl] = React.useState("");
  const [isImageRemoved, setIsImageRemoved] = React.useState(false);
  const [fileInputKey, setFileInputKey] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const formSchema = z.object({
    name: z.string().min(1, "Category name is required."),
    description: z.string().min(1, "Category description is required."),
    image: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedCategory?.name || "",
      description: selectedCategory?.description || "",
      image: selectedCategory?.image || "",
    },
  });

  React.useEffect(() => {
    form.reset({
      name: selectedCategory?.name || "",
      description: selectedCategory?.description || "",
      image: selectedCategory?.image || "",
    });
    setSelectedImageFile(null);
    setIsImageRemoved(false);
    setFileInputKey((prev) => prev + 1);
  }, [form, selectedCategory, formType, open]);

  React.useEffect(() => {
    if (selectedImageFile) {
      const objectUrl = URL.createObjectURL(selectedImageFile);
      setPreviewImageUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (isImageRemoved) {
      setPreviewImageUrl("");
      return;
    }

    setPreviewImageUrl(
      formType === "edit" ? selectedCategory?.image || "" : "",
    );
  }, [selectedImageFile, selectedCategory, formType, isImageRemoved]);

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setIsImageRemoved(true);
    form.setValue("image", "");
    setPreviewImageUrl("");
    setFileInputKey((prev) => prev + 1);
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // Do something with the form values.
      setLoading(true);

      let imageUrl = isImageRemoved ? "" : selectedCategory?.image || "";

      if (selectedImageFile) {
        const uploadResponse = await uploadFileAndGetUrl(selectedImageFile);

        if (!uploadResponse.success || !uploadResponse.data) {
          throw new Error(uploadResponse.message);
        }

        imageUrl = uploadResponse.data;
      }

      let saveResponse = null;
      if (formType === "add") {
        saveResponse = await createCategory({
          name: data.name,
          description: data.description,
          image: imageUrl,
        });
      } else {
        // Implement edit functionality here
        saveResponse = await updateCategoryById(selectedCategory!.id, {
          name: data.name,
          description: data.description,
          image: imageUrl,
        });
      }

      if (!saveResponse.success) {
        throw new Error(saveResponse.message);
      }

      toast.success(
        formType === "add"
          ? "Category added successfully!"
          : "Category updated successfully!",
      );

      onSuccess();

      setOpen(false);
      form.reset();
      setSelectedImageFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the category. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {formType === "add" ? "Add New Category" : "Edit Category"}
          </DialogTitle>
        </DialogHeader>

        <div>
          <Card className="w-full sm:max-w-md">
            <CardContent>
              <form
                id="form-rhf-demo"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FieldGroup>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-rhf-demo-name">
                          Name
                        </FieldLabel>
                        <Input
                          {...field}
                          id="form-rhf-demo-name"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter category name"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-rhf-demo-description">
                          Description
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="form-rhf-demo-description"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter category description"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="image"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-rhf-demo-image">
                          Image
                        </FieldLabel>
                        <Input
                          key={fileInputKey}
                          type="file"
                          accept="image/*"
                          id="form-rhf-demo-image"
                          name={field.name}
                          ref={field.ref}
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter category image URL"
                          autoComplete="off"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;

                            setSelectedImageFile(file);
                            setIsImageRemoved(false);
                            field.onChange(
                              file?.name || selectedCategory?.image || "",
                            );
                          }}
                          onBlur={field.onBlur}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                        {formType === "edit" && (
                          <p className="mt-2 text-sm text-gray-500">
                            Upload a new image to replace the current one.
                          </p>
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
                {previewImageUrl && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      {selectedImageFile
                        ? "New image preview (will replace current image)"
                        : "Current image"}
                    </p>
                    <img
                      src={previewImageUrl}
                      alt="Category preview"
                      className="h-40 w-full rounded-md border border-gray-300 bg-gray-50 p-2 object-contain"
                    />
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveImage}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setSelectedImageFile(null);
                      setIsImageRemoved(false);
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {formType === "add" ? "Add Category" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryFormModal;
