import WorkflowCanvas from "./WorkflowCanvas";
import SideBar from "./SideBar";

const Layout = () => {
  return (
    <div className="h-screen w-screen">
      <SideBar />
      <WorkflowCanvas />
    </div>
  );
};

export default Layout;
