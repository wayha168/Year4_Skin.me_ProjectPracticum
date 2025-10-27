import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import useAuthContext from "../../Authentication/AuthContext";
import { FaUser, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import Loading from "../../Components/Loading/Loading";
import axios from "../../api/axiosConfig"; // your axios instance
import "./ProfilePage.css";
import MessageWidget from "../../Components/MessageWidget/MessageWidget";

const ProfilePage = () => {
  const { user: authUser } = useAuthContext(); // user from context (usually has id)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authUser?.id) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/users/${authUser.id}/user`);
        setUser(response.data.data); // assuming ApiResponse format: { message, data }
      } catch (err) {
        console.error(err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authUser]);

  if (!authUser) {
    return (
      <>
        <Navbar alwaysVisible={true} />
        <div className="profile-error">User not logged in.</div>
        <Footer />
      </>
    );
  }

  if (loading) return <Loading />;

  if (error)
    return (
      <>
        <Navbar alwaysVisible={true} />
        <div className="profile-error">{error}</div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar alwaysVisible={true} />
      <main className="profile-wrapper h-auto min-h-screen py-8 px-4 bg-gray-100">
        <div className="profile-card">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <div className="cute-avatar">
                <FaUserCircle size={150} color="#eb61a2" />
              </div>
            )}
          </div>

          <div className="profile-info">
            <h2>
              <FaUser className="icon" /> {user.firstName} {user.lastName}
            </h2>
            <p>
              <FaEnvelope className="icon" /> {user.email}
            </p>
            <p>
              <FaCalendarAlt className="icon" /> Joined:{" "}
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
            </p>
          </div>

          <div className="profile-actions">
            <button className="edit-btn">Edit Profile</button>
            <button className="change-password-btn">Change Password</button>
          </div>
        </div>
      </main>
      <Footer />
      <MessageWidget/>
      
    </>
  );
};

export default ProfilePage;
