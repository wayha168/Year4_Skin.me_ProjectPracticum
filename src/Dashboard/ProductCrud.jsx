import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import Sidebar from "../Components/Sidebar/Sidebar";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Cookies from "js-cookie";

const ProductCrud = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    productType: "",
    inventory: "",
    description: "",
    categoryId: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const token = Cookies.get("token");

  useEffect(() => {
    if (!token) return;
    fetchProducts();
    fetchCategories();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/products/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories/all-categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.categoryId) return alert("Please select a category");

      const payload = { ...form, category: { id: form.categoryId } };
      delete payload.categoryId;

      if (isEditing) {
        await axios.put(`/products/product/${editingId}/update`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsEditing(false);
        setEditingId(null);
      } else {
        await axios.post("/products/add", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({
        name: "",
        brand: "",
        price: "",
        productType: "",
        inventory: "",
        description: "",
        categoryId: "",
      });
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/products/product/${id}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err.response?.data || err.message);
    }
  };

  const handleEdit = (p) => {
    setForm({
      ...p,
      categoryId: p.category?.id || "",
    });
    setIsEditing(true);
    setEditingId(p.id);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Product Management</h1>

        {/* Add / Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow mb-10 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="border p-2 rounded-lg"
            required
          />
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Brand"
            className="border p-2 rounded-lg"
            required
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            type="number"
            className="border p-2 rounded-lg"
            required
          />
          <input
            name="productType"
            value={form.productType}
            onChange={handleChange}
            placeholder="Type"
            className="border p-2 rounded-lg"
          />
          <input
            name="inventory"
            value={form.inventory}
            onChange={handleChange}
            placeholder="Inventory"
            type="number"
            className="border p-2 rounded-lg"
          />
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="border p-2 rounded-lg"
          />

          {/* Only select existing category */}
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="border p-2 rounded-lg"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="col-span-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> {isEditing ? "Update Product" : "Add Product"}
          </button>
        </form>

        {/* Products Grid */}
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length > 0 ? (
            products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow p-4 cursor-pointer hover:shadow-lg transition"
                onClick={() => handleEdit(p)}
              >
                <div className="flex justify-center mb-2">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={`https://backend.skinme.store${p.images[0].downloadUrl}`}
                      alt={p.images[0].fileName}
                      className="w-32 h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-100 text-gray-400 rounded">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.brand}</p>
                <p className="text-pink-500 font-bold">${p.price}</p>
                <p className="text-gray-600 text-sm">{p.productType}</p>
                <p className="text-gray-600 text-sm">Inventory: {p.inventory}</p>
                <p className="text-gray-500 text-sm">Category: {p.category?.name || "N/A"}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
                    }}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600 flex-1"
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(p);
                    }}
                    className="bg-yellow-400 text-white p-1 rounded hover:bg-yellow-500 flex-1"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No products found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductCrud;
