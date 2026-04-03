"use client";

import { ICategory, ItemInterface } from "@/interfaces";
import { getAllCategories } from "@/server-actions/catehories";
import { addNewItem, updateItemById } from "@/server-actions/items";
import React, { useEffect } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileAndGetUrl } from "@/helpers";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface ItemFormProps {
  formType: "add" | "edit";
  initialValues?: Partial<ItemInterface>;
}

interface PreviewFile {
  id: string;
  url: string;
  name: string;
  isPdf: boolean;
  file?: File;
  source: "existing" | "new";
}

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || /\.pdf$/i.test(file.name);

const isPdfUrl = (url: string) => {
  const normalizedUrl = url.split("?")[0] || url;
  return /\.pdf$/i.test(normalizedUrl);
};

const createExistingPreview = (fileUrl: string): PreviewFile => ({
  id: `existing-${fileUrl}`,
  url: fileUrl,
  name: fileUrl.split("/").pop() || "Uploaded file",
  isPdf: isPdfUrl(fileUrl),
  source: "existing",
});

const createNewPreview = (file: File): PreviewFile => ({
  id: `new-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
  url: URL.createObjectURL(file),
  name: file.name,
  isPdf: isPdfFile(file),
  file,
  source: "new",
});

const revokeNewPreviewUrls = (files: PreviewFile[]) => {
  files.forEach((file) => {
    if (file.source === "new") {
      URL.revokeObjectURL(file.url);
    }
  });
};

function ItemForm({ formType, initialValues }: ItemFormProps) {
  const router = useRouter();
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [previewFiles, setPreviewFiles] = React.useState<PreviewFile[]>([]);
  const [fileInputKey, setFileInputKey] = React.useState(0);
  const previewFilesRef = React.useRef<PreviewFile[]>([]);

  const formSchema = z.object({
    name: z.string().min(1, "Item name is required."),
    description: z.string().min(1, "Item description is required."),
    category_id: z.string().min(1, "Category is required."),
    rent_per_day: z.coerce
      .number()
      .min(0, "Rent per day must be a positive number."),
    available_quantity: z.coerce
      .number()
      .min(0, "Available quantity must be a positive number."),
    total_quantity: z.coerce
      .number()
      .min(0, "Total quantity must be a positive number."),
    images: z.array(z.string()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      category_id: initialValues?.category_id || "",
      rent_per_day: initialValues?.rent_per_day ?? 0,
      available_quantity: initialValues?.available_quantity ?? 0,
      total_quantity: initialValues?.total_quantity ?? 0,
      images: initialValues?.images || [],
    },
  });

  const getData = async () => {
    try {
      const response = await getAllCategories();
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      setCategories(response.data);
    } catch (error) {
      setCategories([]);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const initialPreviewFiles = (initialValues?.images || []).map(
      createExistingPreview,
    );

    form.reset({
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      category_id: initialValues?.category_id || "",
      rent_per_day: initialValues?.rent_per_day ?? 0,
      available_quantity: initialValues?.available_quantity ?? 0,
      total_quantity: initialValues?.total_quantity ?? 0,
      images: initialValues?.images || [],
    });
    previewFilesRef.current = initialPreviewFiles;
    setPreviewFiles((currentPreviewFiles) => {
      revokeNewPreviewUrls(currentPreviewFiles);
      return initialPreviewFiles;
    });
    setFileInputKey((prev) => prev + 1);
  }, [form, initialValues, formType]);

  useEffect(() => {
    previewFilesRef.current = previewFiles;
  }, [previewFiles]);

  useEffect(() => {
    return () => {
      revokeNewPreviewUrls(previewFilesRef.current);
    };
  }, []);

  const syncImagesField = (files: PreviewFile[]) => {
    form.setValue(
      "images",
      files.map((file) =>
        file.source === "existing" ? file.url : file.name,
      ),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const handleFilesChange = (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const nextFiles = files.map(createNewPreview);
    const updatedPreviewFiles = [...previewFilesRef.current, ...nextFiles];

    previewFilesRef.current = updatedPreviewFiles;
    setPreviewFiles(updatedPreviewFiles);
    syncImagesField(updatedPreviewFiles);

    setFileInputKey((prev) => prev + 1);
  };

  const handleRemoveFile = (fileId: string) => {
    const fileToRemove = previewFilesRef.current.find((file) => file.id === fileId);

    if (!fileToRemove) {
      return;
    }

    if (fileToRemove.source === "new") {
      URL.revokeObjectURL(fileToRemove.url);
    }

    const updatedPreviewFiles = previewFilesRef.current.filter(
      (file) => file.id !== fileId,
    );

    previewFilesRef.current = updatedPreviewFiles;
    setPreviewFiles(updatedPreviewFiles);
    syncImagesField(updatedPreviewFiles);

    setFileInputKey((prev) => prev + 1);
  };

  const handleClearImages = () => {
    revokeNewPreviewUrls(previewFilesRef.current);
    previewFilesRef.current = [];
    setPreviewFiles([]);
    syncImagesField([]);
    setFileInputKey((prev) => prev + 1);
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      const existingImageUrls = previewFiles
        .filter((file) => file.source === "existing")
        .map((file) => file.url);
      const newFiles = previewFiles
        .filter((file) => file.source === "new" && file.file)
        .map((file) => file.file as File);

      let imageUrls = existingImageUrls;

      if (newFiles.length > 0) {
        const uploadedImages = await Promise.all(
          newFiles.map((file) => uploadFileAndGetUrl(file)),
        );

        const failedUpload = uploadedImages.find(
          (response) => !response.success || !response.data,
        );

        if (failedUpload) {
          throw new Error(failedUpload.message || "Failed to upload images.");
        }

        imageUrls = [
          ...existingImageUrls,
          ...uploadedImages.map((response) => response.data as string),
        ];
      }

      const payload: Partial<ItemInterface> = {
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        rent_per_day: data.rent_per_day,
        available_quantity: data.available_quantity,
        total_quantity: data.total_quantity,
        images: imageUrls,
        is_active: false,
      };

      const response =
        formType === "add"
          ? await addNewItem(payload)
          : initialValues?.id
            ? await updateItemById(initialValues.id, payload)
            : {
                success: false,
                message: "Item id is required to update the item.",
              };

      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success(
        formType === "add"
          ? "Item added successfully!"
          : "Item updated successfully!",
      );

      router.push("/admin/items");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the item. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-7">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="md:col-span-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="item-form-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="item-form-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter item name"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="category_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="item-form-category">Category</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="item-form-category"
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="item-form-description">
                  Description
                </FieldLabel>
                <Textarea
                  {...field}
                  id="item-form-description"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter item description"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid gap-5 md:grid-cols-3">
            <div className="col-span-1">
              <Controller
                name="rent_per_day"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="item-form-rent">
                      Rent Per Day
                    </FieldLabel>
                    <Input
                      {...field}
                      id="item-form-rent"
                      type="number"
                      min={0}
                      aria-invalid={fieldState.invalid}
                      placeholder="0"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="col-span-1">
              <Controller
                name="available_quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="item-form-available">
                      Available Quantity
                    </FieldLabel>
                    <Input
                      {...field}
                      id="item-form-available"
                      type="number"
                      min={0}
                      aria-invalid={fieldState.invalid}
                      placeholder="0"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="col-span-1">
              <Controller
                name="total_quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="item-form-total">
                      Total Quantity
                    </FieldLabel>
                    <Input
                      {...field}
                      id="item-form-total"
                      type="number"
                      min={0}
                      aria-invalid={fieldState.invalid}
                      placeholder="0"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>

          <Controller
            name="images"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="item-form-images">
                  Images / PDF Files
                </FieldLabel>
                <Input
                  key={fileInputKey}
                  id="item-form-images"
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  multiple
                  name={field.name}
                  ref={field.ref}
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    handleFilesChange(files);
                    field.onChange(
                      previewFiles.map((file) =>
                        file.source === "existing" ? file.url : file.name,
                      ),
                    );
                  }}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {previewFiles.length > 0 && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {previewFiles.map((file, index) => (
                file.isPdf ? (
                  <div
                    key={file.id}
                    className="relative flex h-40 flex-col justify-between rounded-md border border-gray-300 bg-gray-50 p-4"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveFile(file.id)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X />
                    </Button>
                    <div>
                      <p className="text-sm font-medium text-gray-900">PDF File</p>
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {file.name}
                      </p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Open PDF
                    </a>
                  </div>
                ) : (
                  <div
                    key={file.id}
                    className="relative overflow-hidden rounded-md border border-gray-300 bg-gray-50"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={() => handleRemoveFile(file.id)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X />
                    </Button>
                    <img
                      src={file.url}
                      alt={`Item preview ${index + 1}`}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearImages}
              >
                Clear Files
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/items")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? formType === "add"
                ? "Adding Item..."
                : "Saving Changes..."
              : formType === "add"
                ? "Add Item"
                : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ItemForm;
