import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout"); // clears httpOnly cookie on backend
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">
          MERN Auth
        </Link>
        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <>
              <Link className="text-white mx-2 hover:underline" to="/login">
                Login
              </Link>
              <Link className="text-white mx-2 hover:underline" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
