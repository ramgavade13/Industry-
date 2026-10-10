"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import { systemStats, systemUsers } from "@/data/mockData";

type User = {
  name: string;
  email?: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string;
};

const statusColor: Record<User["status"], string> = {
  Active: "text-[#3FA77C]",
  Inactive: "text-[#8B93A7]",
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>(systemUsers);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Employee");
  const [status, setStatus] = useState<User["status"]>("Active");
  const [error, setError] = useState("");

  function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setError("Please enter both name and email.");
      return;
    }

    const emailExists = users.some(
      (user) => user.email?.toLowerCase() === cleanEmail
    );

    if (emailExists) {
      setError("This email already exists.");
      return;
    }

    const newUser: User = {
      name: cleanName,
      email: cleanEmail,
      role,
      status,
      lastLogin: "Never",
    };

    setUsers((previousUsers) => [...previousUsers, newUser]);

    setName("");
    setEmail("");
    setRole("Employee");
    setStatus("Active");
    setError("");
    setShowForm(false);
  }

  return (
    <DashboardLayout
      role="admin"
      title="Admin Dashboard"
      subtitle="Users, access, and system health"
    >
      {/* Dashboard Statistics */}
      <div
        data-animate-in
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {systemStats.map((s) => (
          <KPICard key={s.label} {...s} />
        ))}
      </div>

      {/* User Management */}
      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242B3D] flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[#E7E4DC]">
              User Management
            </h3>
            <p className="text-xs text-[#8B93A7] mt-1">
              Manage users and their access
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
            className="text-xs rounded-md bg-[#C9A227] text-[#0F1420] font-semibold px-3 py-2 hover:bg-[#DDB646] transition-colors whitespace-nowrap"
          >
            + Add User
          </button>
        </div>

        {/* Add User Form */}
        {showForm && (
          <div className="p-5 border-b border-[#242B3D]">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-[#E7E4DC] mb-4">
                Add New User
              </h2>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label
                    htmlFor="user-name"
                    className="block text-sm text-[#8B93A7] mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="w-full rounded-md bg-[#0F1420] border border-[#242B3D] px-3 py-2 text-sm text-[#E7E4DC] outline-none focus:border-[#C9A227]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="user-email"
                    className="block text-sm text-[#8B93A7] mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full rounded-md bg-[#0F1420] border border-[#242B3D] px-3 py-2 text-sm text-[#E7E4DC] outline-none focus:border-[#C9A227]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="user-role"
                      className="block text-sm text-[#8B93A7] mb-1"
                    >
                      Role
                    </label>
                    <select
                      id="user-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-md bg-[#0F1420] border border-[#242B3D] px-3 py-2 text-sm text-[#E7E4DC] outline-none focus:border-[#C9A227]"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="CEO">CEO</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="user-status"
                      className="block text-sm text-[#8B93A7] mb-1"
                    >
                      Status
                    </label>
                    <select
                      id="user-status"
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as User["status"])
                      }
                      className="w-full rounded-md bg-[#0F1420] border border-[#242B3D] px-3 py-2 text-sm text-[#E7E4DC] outline-none focus:border-[#C9A227]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-md bg-[#C9A227] text-[#0F1420] font-semibold text-sm px-5 py-2 hover:bg-[#DDB646] transition-colors"
                  >
                    Add User
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                    }}
                    className="rounded-md border border-[#363E51] text-[#E7E4DC] text-sm px-5 py-2 hover:bg-[#242B3D] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#8B93A7] border-b border-[#242B3D]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last Login</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr
                  key={`${user.email ?? user.name}-${index}`}
                  className="border-b border-[#242B3D] last:border-0 hover:bg-[#1C2335] transition-colors"
                >
                  <td className="px-5 py-3 text-[#E7E4DC] whitespace-nowrap">
                    {user.name}
                  </td>

                  <td className="px-5 py-3 text-[#8B93A7]">
                    {user.email ?? "—"}
                  </td>

                  <td className="px-5 py-3 text-[#8B93A7]">
                    {user.role}
                  </td>

                  <td
                    className={`px-5 py-3 font-medium ${statusColor[user.status]}`}
                  >
                    {user.status}
                  </td>

                  <td className="px-5 py-3 text-[#8B93A7] whitespace-nowrap">
                    {user.lastLogin}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-[#8B93A7]"
                  >
                    No users found. Click Add User to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-[#242B3D] text-xs text-[#8B93A7]">
          Total users: {users.length}
        </div>
      </div>
    </DashboardLayout>
  );
}