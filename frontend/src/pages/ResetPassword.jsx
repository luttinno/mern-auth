import { useState } from "react";
import api from "../api/api";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(`/reset-password/${token}`, {
        password,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white shadow-md rounded w-full max-w-md"
      >
        <h2 className="text-xl mb-4 font-semibold text-gray-800">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New password"
          className="border p-2 w-full rounded mb-3"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm password"
          className="border p-2 w-full rounded mb-3"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="mt-2 bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {message && <p className="mt-3 text-green-600 text-sm">{message}</p>}

        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
