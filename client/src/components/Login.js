import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorPage from "./ErrorPage";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
      })
      .then((data) => {
        console.log("Logged in:", data);
        sessionStorage.setItem("user_id", data.id);
        setError("");
        navigate("/movies"); // Redirect after login
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <ErrorPage>{error}</ErrorPage>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., alice"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="e.g., password123"
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
