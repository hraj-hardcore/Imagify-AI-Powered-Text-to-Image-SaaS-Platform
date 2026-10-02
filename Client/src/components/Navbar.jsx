import { useContext } from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
const Navbar = () => {
  const { user, setShowLogin, logout, credit, darkMode, setDarkMode } =
    useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-4">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-28 sm:w-32 lg:w-40" />
      </Link>
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={darkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setDarkMode((currentMode) => !currentMode)}
          className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        >
          <span
            aria-hidden="true"
            className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
              darkMode ? "bg-cyan-700" : "bg-slate-300"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                darkMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </span>
          <span>{darkMode ? "Dark" : "Light"}</span>
        </button>
        {user ? (
          <div
            onClick={() => navigate("/buy")}
            className="flex items-center gap-2 sm:gap-3"
          >
            <button className="flex items-center gap-2 bg-blue-100 px-4 sm:px-6 py-1.5 sm:py-3 rounded-full hover:scale-105 transition-all duration-700">
              <img className="w-5 " src={assets.credit_star} alt="" />
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Credits left : {credit}
              </p>
            </button>
            <p className="text-gray-600 max-sm:hidden pl-4">Hi, {user.name}</p>
            <div className="relative group">
              <img
                src={assets.profile_icon}
                className="w-10 drop-shadow"
                alt=""
              />
              <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12 ">
                <ul className=" list-none m-0 p-2 bg-white rounded-md border text-sm">
                  <li
                    onClick={logout}
                    className="py-1 px-2 cursor-pointer pr-10"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-5">
            <p onClick={() => navigate("/buy")} className="cursor-pointer ">
              Pricing
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-zinc-800 text-white px-7 py-2 sm:px-10 text-sm rounded-full"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
