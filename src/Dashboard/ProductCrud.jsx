import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import Sidebar from "../Components/Sidebar/Sidebar";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

const ProductCrud = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    productType: "",
    inventory: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/products/all");
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/products/product/${editingId}/update`, form);
        setIsEditing(false);
        setEditingId(null);
      } else {
        await axios.post("/products/add", form);
      }
      setForm({
        name: "",
        brand: "",
        price: "",
        productType: "",
        inventory: "",
        description: "",
      });
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/products/product/${id}/delete`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (p) => {
    setForm(p);
    setIsEditing(true);
    setEditingId(p.id);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Product Management</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow mb-10">
          <div className="grid grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              className="border p-2 rounded-lg"
            />
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Brand"
              className="border p-2 rounded-lg"
            />
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              type="number"
              className="border p-2 rounded-lg"
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
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> {isEditing ? "Update Product" : "Add Product"}
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product List</h2>
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Brand</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Inventory</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p, i) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.brand}</td>
                    <td className="p-2">${p.price}</td>
                    <td className="p-2">{p.productType}</td>
                    <td className="p-2">{p.inventory}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-yellow-400 text-white p-2 rounded hover:bg-yellow-500"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No products found.
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

export default ProductCrud;
