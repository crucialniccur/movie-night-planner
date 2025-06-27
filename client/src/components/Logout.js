import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch("/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Logout failed");
        return res.json();
      })
      .then((data) => {
        console.log(data.message);
        sessionStorage.removeItem("user_id"); // Clear client-side storage
        navigate("/login"); // Redirect to login
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div>
      <h1>Logout</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Logout;
