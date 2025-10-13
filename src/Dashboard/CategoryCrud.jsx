import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import axios from "../api/axiosConfig";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const CategoryCrud = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories/all-categories");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/categories/category/${editingId}/update`, { name });
        setIsEditing(false);
        setEditingId(null);
      } else {
        await axios.post("/categories/add-category", { name });
      }
      setName("");
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`/categories/category/${id}/delete`);
      fetchCategories();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setIsEditing(true);
    setEditingId(cat.id);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Category Management</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow mb-10">
          <input
            type="text"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded-lg w-full"
          />
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> {isEditing ? "Update Category" : "Add Category"}
          </button>
        </form>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Category List</h2>
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((cat, i) => (
                  <tr key={cat.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{cat.name}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="bg-yellow-400 text-white p-2 rounded hover:bg-yellow-500"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default CategoryCrud;
