import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useUsersGlobalStore, { IUsersGlobalStore } from "@/store/users-store";
import { ChartBarStacked, Contact, Grid2X2Plus, List, ListTodo, Scan, User2Icon} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import LogoutButton from "@/components/functional/logout-button";

function Sidebar({
  openSidebar,
  setOpenSidebar,
}: {
  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;
}) {
  const router = useRouter();
  const { user } = useUsersGlobalStore() as IUsersGlobalStore;
  const pathname = usePathname();

  const size = 20;
  const adminMenuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <Grid2X2Plus size={size} />,
    },
    {
      name: "Category",
      href: "/admin/categories",
      icon:<ChartBarStacked size={size} />,
    },
    {
      name: "Items",
      href: "/admin/items",
      icon: <List size={size} />,
    },
    {
      name: "Rents History",
      href: "/admin/rents-history",
      icon: <ListTodo size={size} />,
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: <Contact size={size} />,
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: <User2Icon size={size} />,
    },
  ];
  const userMenuItems = [
    {
      name: "User Dashboard",
      href: "/user/dashboard",
      icon: <Grid2X2Plus size={size} />,
    },
    {
      name: "Rents",
      href: "/user/rents",
      icon: <ListTodo size={size} />,
    },
    {
      name: "Items",
      href: "/user/items",
      icon: <List size={size} />,
    },
    {
      name: "Profile",
      href: "/user/profile",
      icon: <User2Icon size={size} />,
    },
  ];

  const menuItems: any =
    user?.role === "admin"
      ? adminMenuItems
      : user?.role === "user"
        ? userMenuItems
        : [];

  return (
    <Sheet open={openSidebar} onOpenChange={(open) => setOpenSidebar(open)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-7 mt-10">
          {menuItems.map((item: any) => (
            <div
              key={item.name}
              className={`px-5 py-3 flex cursor-pointer items-center gap-5 ${
                pathname === item.href
                  ? "bg-gray-200 border border-gray-700 rounded text-primary"
                  : ""
              }`}
              onClick={() => {
                router.push(item.href);
                setOpenSidebar(false);
              }}
            >
              {item.icon}
              <span className={`text-sm ${pathname === item.href ? "text-primary" : ""}`}>
                {item.name}
              </span>
            </div>
          ))}

          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default Sidebar;
