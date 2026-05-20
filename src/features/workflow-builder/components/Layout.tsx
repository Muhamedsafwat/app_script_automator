import WorkflowCanvas from "./WorkflowCanvas";
import SideBar from "./SideBar";
import ConfigForm from "./ConfigForm";

const Layout = () => {
  return (
    <div className="h-screen w-screen">
      <SideBar />
      <WorkflowCanvas />
      <ConfigForm />
    </div>
  );
};

export default Layout;
