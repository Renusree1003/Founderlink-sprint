import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ title, children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar title={title} />
        <div className="app-content">
          {children}
        </div>
      </div>
    </div>
  );
}
