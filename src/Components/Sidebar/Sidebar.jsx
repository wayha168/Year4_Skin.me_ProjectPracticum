import { Link, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaBoxOpen,
  FaClipboardList,
  FaSignOutAlt,
  FaImages,
  FaTags,
  FaDollarSign,
} from "react-icons/fa";
import { SiHomepage } from "react-icons/si";

const Sidebar = () => {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `flex items-center gap-3 p-5 rounded-lg transition-all text-white  ${
      pathname === path
        ? "bg-white text-blue-500 font-semibold shadow-lg"
        : "hover:bg-white hover:text-blue-500 text-white/90"
    }`;

  return (
    <aside className="w-68 bg-gradient-to-b from-blue-600 to-blue-400 shadow-lg p-6 flex flex-col min-h-screen rounded-r-3xl">
      {/* Logo / Title */}
      <h2 className="text-5xl font-bold text-white mb-10 tracking-wider text-center">Skin.Me Admin</h2>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          <FaChartLine /> <span>Dashboard</span>
        </Link>

        <Link to="/category-crud" className={linkClass("/category-crud")}>
          <FaTags /> <span>Categories</span>
        </Link>

        <Link to="/product-crud" className={linkClass("/product-crud")}>
          <FaBoxOpen /> <span>Products</span>
        </Link>

        {/* <Link to="/image-crud" className={linkClass("/image-crud")}>
          <FaImages /> <span>Images</span>
        </Link> */}

        <Link to="/order-control" className={linkClass("/order-control")}>
          <FaClipboardList /> <span>Orders</span>
        </Link>

        {/* <Link to="/sales-report" className={linkClass("/sales-report")}>
          <FaDollarSign /> <span>Sales</span>
        </Link> */}
        <Link to="/" className={linkClass("/homepage")}>
          <SiHomepage /> <span>Homepage</span>
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-6">
        <button className="flex items-center gap-3 p-3 rounded-lg w-full bg-white text-red-600 font-semibold hover:shadow-lg transition">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
