import { useState } from "react";
import api from "../api/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/forgot-password", { email });

      setMessage(res.data.message);
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
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 w-full rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && <p className="mt-3 text-green-600 text-sm">{message}</p>}

        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
