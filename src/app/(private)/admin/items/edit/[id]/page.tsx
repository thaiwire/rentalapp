import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import React from "react";
import Link from "next/link";
import ItemForm from "../../_components/item-form";

function EditItemPage() {
  return (
    <div className="flex flex-col justify-between gap-5">
      <PageTitle title="Edit Item" />
      <ItemForm formType="edit" />
    </div>
  );
}

export default EditItemPage;
