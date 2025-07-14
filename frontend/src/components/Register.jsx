import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.target);

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      updateUser(data.user);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Create Account</h1>
          <input
            name="name"
            required
            type="text"
            placeholder="Full Name"
          />
          <input
            name="email"
            required
            type="email"
            placeholder="Email"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Password"
          />
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            placeholder="Confirm Password"
          />
          <button disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Register"}
          </button>
          {error && <span className="error">{error}</span>}
          <Link to="/login">Already have an account?</Link>
        </form>
      </div>
    </div>
  );
}

export default Register;
