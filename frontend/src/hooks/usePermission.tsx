import { useState, useEffect } from "react";
import api from "../config";

interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  menu_id: number;
  download: boolean;
}

export const usePermissions = (menuPath: string) => {
  const [permissions, setPermissions] = useState<Permission>({
    create: false,
    read: false,
    update: false,
    delete: false,
    menu_id: 0,
    download: false,
  });
  const [loading_1, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await api.get("/getMenus");
        const menuPermissions = response?.data?.data.find(
          (menu: any) => menu?.menu?.route === menuPath,
        );

        if (menuPermissions) {
          const newPermissions = {
            create: Boolean(menuPermissions.create),
            read: Boolean(menuPermissions.read),
            update: Boolean(menuPermissions.update),
            delete: Boolean(menuPermissions.delete),
            menu_id: menuPermissions.menu_id,
            download:Boolean(menuPermissions.download)
          };
          setPermissions(newPermissions);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [menuPath]);

  return { permissions, loading_1 };
};
