import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import axios from "../api/axiosConfig";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Cookies from "js-cookie";

// Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

const CategoryCrud = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCategories = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get("/categories/all-categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setName(category.name);
      setIsEditing(true);
      setEditingId(category.id);
    } else {
      setName("");
      setIsEditing(false);
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Not authenticated");

      if (isEditing) {
        await axios.put(
          `/categories/category/${editingId}/update`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "/categories/add-category",
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`/categories/category/${id}/delete`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      fetchCategories();
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-9">
        <h1 className="text-4xl mb-6 text-gray-800 text-center font-semibold">Category Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2"
        >
          <FaPlus /> Add Category
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl shadow p-4 cursor-pointer hover:shadow-lg transition"
              >
                <h3 className="font-semibold mb-2">{cat.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(cat)}
                    className="bg-yellow-400 text-white p-2 rounded hover:bg-yellow-500 flex-1"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 flex-1"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No categories found.</p>
          )}
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Category" : "Add Category"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded-lg w-full"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {isEditing ? "Update Category" : "Add Category"}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default CategoryCrud;
