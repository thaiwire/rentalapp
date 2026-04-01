import React from "react";
import PrivateLayoutHeader from "./header";
import useUsersGlobalStore, { IUsersGlobalStore } from "@/store/users-store";
import toast from "react-hot-toast";
import { get } from "http";
import { getLoggedInUser } from "@/server-actions/users";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { setUser } = useUsersGlobalStore() as IUsersGlobalStore;
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  const getData = async () => {
    try {
      setLoading(true);
      const response = await getLoggedInUser();
      if (!response.success) {
        toast.error("Unauthorized. Please log in.");
      }
      setUser(response.data);
    } catch (error: any) {
      Cookies.remove("token");
      router.push("/login");
      toast.error(
        "An error occurred while fetching user data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  if (loading) {
    return <div
      className="flex items-center justify-center h-screen"
    >
      <Spinner />
    </div>;
  }

  return (
    <div>
      <PrivateLayoutHeader />
      <div className="p-5">{children}</div>
    </div>
  );
}

export default PrivateLayout;
