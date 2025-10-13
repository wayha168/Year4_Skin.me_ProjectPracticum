import React from "react";
import Sidebar from "../Components/Sidebar/Sidebar";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h1>

        <section className="bg-white shadow rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Sales Record</h2>
          <p className="text-gray-600">Sales data visualization or chart can go here.</p>
        </section>

        <section className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Order History</h2>
          <p className="text-gray-600">Recent orders summary or table here.</p>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
