import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import useAuthContext from "../../Authentication/AuthContext";
import { FaUser, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuthContext();
  console.log("ProfilePage user:", user);
  if (!user) {
    return (
      <>
        <Navbar alwaysVisible={true} />
        <div className="profile-error">User not logged in.</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar alwaysVisible={true} />
      <main className="profile-wrapper h-auto min-h-screen py-8 px-4 bg-gray-100">
        <div className="profile-card">
          <div className="profile-avatar">
            <img
              src={user.avatar || "https://via.placeholder.com/150"}
              alt={`${user.firstName} ${user.lastName}`}
            />
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
    </>
  );
};

export default ProfilePage;
