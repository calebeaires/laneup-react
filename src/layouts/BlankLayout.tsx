import { Outlet } from "react-router";

export const BlankLayout = () => {
  return (
    <div className="size-full">
      <Outlet />
    </div>
  );
};
