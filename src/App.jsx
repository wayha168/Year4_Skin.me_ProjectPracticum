import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage";
import Login from "./Authentication/Login";
import Signup from "./Authentication/Signup";
import Dashboard from "./Dashboard/Dashboard";
// import api from "./api/axiosConfig";
// import { useState, useEffect } from "react";
import "./index.css";

function App() {
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const [data, setData] = useState(null);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await api.get("/test");
  //       setData(response.data);
  //       setError(null);
  //     }
  //     catch (err) {
  //       setError(err.message);
  //       setData(null);
  //     }
  //     finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }
  // , []);
  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;
  // if (data) console.log(data);

  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>

  );
}

export default App;
