"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageTitle from "@/components/ui/page-title";
import { ICategory } from "@/interfaces";
import React from "react";
import CategoryFormModal from "./_components/category-form-modal";
import toast from "react-hot-toast";
import {
  deleteCategoryById,
  getAllCategories,
} from "@/server-actions/catehories";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import InfoMessage from "@/components/functional/info-message";

function CategoriesPage() {
  const [openCategoryForm, setOpenCategoryForm] = React.useState(false);
  const [formType, setFormType] = React.useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] =
    React.useState<ICategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    React.useState<ICategory | null>(null);

  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [loading, setLoading] = React.useState(false);

  const getData = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();

      if (!response.success || !response.data) {
        throw new Error(response.message);
        return;
      }

      console.log("Fetched categories:", response.data);
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setLoading(true);
      const response = await deleteCategoryById(id);
      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success("Category deleted successfully.");
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== id),
      );
      setCategoryToDelete(null);
    } catch (error) {
      toast.error("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (category: ICategory) => {
    setCategoryToDelete(category);
  };

  React.useEffect(() => {
    getData();
  }, []);

  const columns = ["id", "Name", "Image", "Created At", "Actions"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Categories" />
        <Button
          onClick={() => {
            setFormType("add");
            setOpenCategoryForm(true);
            setSelectedCategory(null);
          }}
        >
          Add Category
        </Button>
      </div>

      {categories.length === 0 && !loading ? (
        <InfoMessage message="No categories found. Please add some categories." />
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className="font-bold bg-gray-500 text-primary text-white py-2"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded p-1 border border-gray-300"
                />
              </TableCell>
              <TableCell>
                {dayjs(item.created_at).format("DD/MM/YYYY")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormType("edit");
                      setSelectedCategory(item);
                      setOpenCategoryForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-500"
                    onClick={() => openDeleteDialog(item)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      

      {openCategoryForm && (
        <CategoryFormModal
          open={openCategoryForm}
          setOpen={setOpenCategoryForm}
          selectedCategory={selectedCategory}
          formType={formType}
          onSuccess={getData}
        />
      )}

      <Dialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open && !loading) {
            setCategoryToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!loading}>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              {categoryToDelete
                ? `Are you sure you want to delete ${categoryToDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this category?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                categoryToDelete && handleDeleteCategory(categoryToDelete.id)
              }
              disabled={loading || !categoryToDelete}
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategoriesPage;
