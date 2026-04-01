import React from "react";
import { Menu} from "lucide-react";
import useUsersGlobalStore, { IUsersGlobalStore } from "@/store/users-store";
import Sidebar from "./sidebar";

function PrivateLayoutHeader() {
  const { user } = useUsersGlobalStore() as IUsersGlobalStore;
  const [openSidebar, setOpenSidebar] = React.useState(false);

  return (
    <div className="flex items-center bg-primary p-5 justify-between">
      <h1 className="text-white text-2xl font-bold">Rental Markets App</h1>
      <div className="flex gap-5">
        <h1 className="text-white">{user?.name}</h1>
        <Menu
          className="text-white cursor-pointer"
          size={20}
          color="white"
          onClick={() => setOpenSidebar(true)}
        />
      </div>
      {openSidebar && (
        <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      )}
    </div>
  );
}

export default PrivateLayoutHeader;
