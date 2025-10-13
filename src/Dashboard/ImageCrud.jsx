import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import axios from "../api/axiosConfig";
import { FaPlus, FaTrash } from "react-icons/fa";

const ImageCrud = () => {
  const [images, setImages] = useState([]);
  const [productId, setProductId] = useState("");
  const [files, setFiles] = useState(null);

  const fetchImages = async () => {
    try {
      const res = await axios.get("/images/all"); // adjust endpoint if needed
      setImages(res.data.data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files || !productId) return alert("Select product and files");
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("productId", productId);

    try {
      await axios.post("/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles(null);
      setProductId("");
      fetchImages();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`/images/image/${id}/delete`);
      fetchImages();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Image Management</h1>

        <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl shadow mb-10">
          <input
            type="text"
            placeholder="Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="border p-2 rounded-lg mb-2 w-full"
          />
          <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="mb-4" />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Upload Images
          </button>
        </form>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Image List</h2>
          <div className="grid grid-cols-3 gap-4">
            {images.length > 0 ? (
              images.map((img) => (
                <div key={img.id} className="border rounded p-2 relative">
                  <img
                    src={`data:image/jpeg;base64,${img.base64}`}
                    alt=""
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No images found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImageCrud;
