import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import Sidebar from "../Components/Sidebar/Sidebar";
import { FaPlus, FaEdit, FaTrash, FaImage } from "react-icons/fa";
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
  const [showProductModal, setShowProductModal] = useState(false);

  // Image upload
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [imageFiles, setImageFiles] = useState(null);

  const token = Cookies.get("token");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories/all-categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openProductModal = (product = null) => {
    if (product) {
      setForm({ ...product, categoryId: product.category?.id || "" });
      setIsEditing(true);
      setEditingId(product.id);
    } else {
      setForm({
        name: "",
        brand: "",
        price: "",
        productType: "",
        inventory: "",
        description: "",
        categoryId: "",
      });
      setIsEditing(false);
      setEditingId(null);
    }
    setShowProductModal(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      if (!form.categoryId) return alert("Please select a category");
      const payload = {
        ...form,
        price: parseFloat(form.price),
        inventory: parseInt(form.inventory),
        category: { id: Number(form.categoryId) },
      };
      if (isEditing) {
        await axios.put(`/products/product/${editingId}/update`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/products/add", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/products/product/${id}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Image upload handlers
  const openImageModal = (productId) => {
    setCurrentProductId(productId);
    setImageFiles(null);
    setImageModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!currentProductId || !imageFiles) return alert("Select images");

    const formData = new FormData();
    Array.from(imageFiles).forEach((file) => formData.append("files", file));
    formData.append("productId", currentProductId);

    try {
      await axios.post("/images/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setImageModalOpen(false);
      fetchProducts(); // refresh products to show updated images
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-4xl mb-6 text-gray-800 text-center font-semibold">Product Management</h1>
        <button
          onClick={() => openProductModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2"
        >
          <FaPlus /> Add Product
        </button>

        {/* Products Grid: 5 columns x 2 rows */}
        <div className="grid grid-cols-5 gap-6">
          {currentProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition flex flex-col items-center"
            >
              <div className="flex justify-center mb-2">
                {p.images?.[0] ? (
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
              <h3 className="font-semibold text-center">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.brand}</p>
              <p className="text-pink-500 font-bold">${p.price}</p>
              <p className="text-gray-600 text-sm">{p.productType}</p>
              <p className="text-gray-600 text-sm">Inventory: {p.inventory}</p>
              <p className="text-gray-500 text-sm">Category: {p.category?.name || "N/A"}</p>

              <div className="flex gap-1 mt-1 w-full p-1 mx-1">
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="bg-red-500 text-white rounded hover:bg-red-600 p-1 text-xs flex-1 flex justify-center items-center"
                  title="Delete Product"
                >
                  <FaTrash className="text-sm" />
                </button>
                <button
                  onClick={() => openProductModal(p)}
                  className="bg-yellow-400 text-white rounded hover:bg-yellow-500 p-1 text-xs flex-1 flex justify-center items-center"
                  title="Edit Product"
                >
                  <FaEdit className="text-sm" />
                </button>
                <button
                  onClick={() => openImageModal(p.id)}
                  className="bg-green-500 text-white rounded hover:bg-green-600 p-1 text-xs flex-1 flex justify-center items-center"
                  title="Add Image"
                >
                  <FaImage className="text-sm mr-1" /> Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Product Modal */}
        <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)}>
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Product" : "Add Product"}</h2>
          <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 gap-4">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {isEditing ? "Update Product" : "Add Product"}
            </button>
          </form>
        </Modal>

        {/* Image Upload Modal */}
        <Modal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)}>
          <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
          <form onSubmit={handleImageUpload} className="grid grid-cols-1 gap-4">
            <input
              type="file"
              multiple
              onChange={(e) => setImageFiles(e.target.files)}
              className="border p-2 rounded-lg"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <FaPlus /> Upload
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default ProductCrud;
