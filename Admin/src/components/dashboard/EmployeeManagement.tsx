import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, RefreshCw, Download, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axios from 'axios';
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// Define the employee type
interface Employee {
  id: number;
  _id: string; // MongoDB ObjectId
  username: string;
  email: string;
  role: string;
  status: string;
  permissions: string[];
  phone?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="secondary" className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 border-transparent font-medium">Active</Badge>;
    case "inactive":
      return <Badge variant="secondary" className="cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent font-medium">Inactive</Badge>;
    case "pending":
      return <Badge variant="secondary" className="cursor-pointer bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-transparent font-medium">Pending</Badge>;
    default:
      return <Badge variant="secondary" className="cursor-pointer font-medium">Unknown</Badge>;
  }
};

const ALL_PERMISSIONS = Object.freeze([
  "Dashboard",
  "Payments",
  "User Management",
  "Support Panel",
  "Employee Management",
  "Platform Settings",
]);

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    type: "Admin",
    role: "employee",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Set Permissions modal state
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permUserId, setPermUserId] = useState<string|null>(null);
  const [permChecked, setPermChecked] = useState<string[]>([]);

  // Refresh animation state
  const [refreshing, setRefreshing] = useState(false);

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string|null>(null);

  // Status change modal state
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [statusChangeUser, setStatusChangeUser] = useState<{ _id: string; username: string; newStatus: 'active' | 'inactive' } | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const sortEmployees = (employeeList: Employee[]): Employee[] => {
    return [...employeeList].sort((a, b) => {
      // Primary sort: by role ('admin' on top)
      if (a.role !== b.role) {
        return a.role === 'admin' ? -1 : 1;
      }
      
      // Secondary sort: by creation date (oldest first)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      
      return dateA - dateB;
    });
  };

  // Fetch employees data from API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get(`${API_URL}/api/admin/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.data.success) {
        setEmployees(sortEmployees(response.data.employees));
      } else {
        setError(response.data.message || 'Failed to fetch employees');
      }
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Permission denied. You need Employee Management access.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const openPermModal = (userId: string, currentPerms: string[]) => {
    setPermUserId(userId);
    setPermChecked([...currentPerms].sort());
    setPermModalOpen(true);
  };

  const handlePermChange = (perm: string) => {
    setPermChecked(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  const savePermissions = async () => {
    if (permUserId == null) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Sort permissions to maintain consistent order
      const sortedPermissions = [...permChecked].sort();

      const response = await axios.patch(
        `${API_URL}/api/admin/employees/${permUserId}/permissions`,
        { permissions: sortedPermissions },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        }
      );

      if (response.data.success) {
        // Update local state with the sorted permissions
        setEmployees(prev => prev.map(emp =>
          emp._id === permUserId ? { ...emp, permissions: sortedPermissions } : emp
        ));
        
        // Show success message
        toast.success('Permissions updated successfully');
      } else {
        toast.error(response.data.message || 'Failed to update permissions');
      }
    } catch (err: any) {
      console.error('Error updating permissions:', err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        toast.error('Permission denied. You need Employee Management access.');
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setPermModalOpen(false);
      setPermUserId(null);
      setPermChecked([]);
    }
  };

  function handleRefresh() {
    setRefreshing(true);
    fetchEmployees().finally(() => {
      setTimeout(() => setRefreshing(false), 400);
    });
  }

  // Export to CSV
  function exportToCSV() {
    if (!employees.length) return;
    const headers = ["ID", "Username", "Email", "Role", "Status", "Permissions"];
    const rows = employees.map(emp => [
      emp.id,
      emp.username,
      emp.email,
      emp.role,
      emp.status,
      emp.permissions.join("; ")
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Delete employee function
  const deleteEmployee = async (employeeId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.delete(
        `${API_URL}/api/admin/employees/${employeeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        }
      );

      if (response.data.success) {
        // Remove employee from local state
        setEmployees(prev => prev.filter(e => e._id !== employeeId));
        
        // Show success message
        toast.success('Employee deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete employee');
      }
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        toast.error('Permission denied. You need Employee Management access.');
      } else {
        toast.error('Network error. Please try again.');
      }
    }
  };

  const handleStatusChange = async () => {
    if (!statusChangeUser) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await axios.patch(
        `${API_URL}/api/admin/employees/${statusChangeUser._id}/status`,
        { status: statusChangeUser.newStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setEmployees(prev =>
          prev.map(emp =>
            emp._id === statusChangeUser._id
              ? { ...emp, status: statusChangeUser.newStatus }
              : emp
          )
        );
        toast.success(`User status updated to ${statusChangeUser.newStatus}.`);
      } else {
        toast.error(response.data.message || 'Failed to update status.');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'An error occurred.');
    } finally {
      setStatusChangeModalOpen(false);
      setStatusChangeUser(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
        <p className="text-gray-500 text-sm">Manage all employees and their permissions.</p>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading employees...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
        <p className="text-gray-500 text-sm">Manage all employees and their permissions.</p>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchEmployees} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
      <p className="text-gray-500 text-sm">Manage all employees and their permissions.</p>
      <div className="flex items-center gap-2 mb-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 py-0 flex items-center gap-1"
          aria-label="Refresh"
          onClick={handleRefresh}
        >
          <RefreshCw className={`w-4 h-4 transition-transform duration-200 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 py-0 flex items-center gap-1"
          aria-label="Export"
          onClick={exportToCSV}
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button
          size="sm"
          variant="default"
          className="h-7 px-2 py-0 flex items-center gap-1"
          aria-label="Add User"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader>
            <DialogTitle className="text-base">Add User</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (form.password !== form.confirmPassword) {
                toast.error("Passwords do not match");
                return;
              }

              try {
                const token = localStorage.getItem('adminToken');
                if (!token) {
                  toast.error('No authentication token found');
                  return;
                }

                const response = await axios.post(
                  `${API_URL}/api/admin/employees`,
                  {
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                  },
                  {
                    headers: { 'Authorization': `Bearer ${token}` },
                  }
                );

                if (response.data.success) {
                  const newEmployee = response.data.employee;
                  
                  // Add a temporary 'id' for the key prop if your backend doesn't send it
                  if (!newEmployee.id) {
                    newEmployee.id = employees.length ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;
                  }

                  setEmployees(prev => sortEmployees([...prev, newEmployee]));
                  toast.success('Employee added successfully!');
                  
                  // Reset form and close modal
                  setForm({
                    username: "",
                    email: "",
                    type: "Admin",
                    role: "employee",
                    password: "",
                    confirmPassword: "",
                  });
                  setOpen(false);
                } else {
                  toast.error(response.data.message || "Failed to add employee");
                }
              } catch (err: any) {
                console.error("Error adding employee:", err);
                toast.error(err.response?.data?.message || 'An error occurred. Please try again.');
              }
            }}
            className="space-y-2"
          >
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Username</label>
              <Input
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                className="h-7 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="h-7 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Type</label>
              <Input value="Admin" disabled className="bg-gray-100 h-7 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Role</label>
              <Select
                value={form.role}
                onValueChange={role => setForm(f => ({ ...f, role }))}
              >
                <SelectTrigger className="w-full h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                  <SelectItem value="employee" className="text-xs">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="h-7 text-xs pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-0.5">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  className="h-7 text-xs pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 pt-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="default">
                Add User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader className="py-2 px-4">
          <CardTitle className="text-lg">Employees</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="p-1 text-xs">ID</TableHead>
                <TableHead className="p-1 text-xs">Username</TableHead>
                <TableHead className="p-1 text-xs">Email</TableHead>
                <TableHead className="p-1 text-xs">Role</TableHead>
                <TableHead className="p-1 text-xs">Status</TableHead>
                <TableHead className="p-1 text-xs">Permissions</TableHead>
                <TableHead className="p-1 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp, idx) => (
                <TableRow key={emp._id} className="h-8 text-xs">
                  <TableCell className="p-1 align-middle">{idx + 1}</TableCell>
                  <TableCell className="p-1 align-middle">{emp.username}</TableCell>
                  <TableCell className="p-1 align-middle">{emp.email}</TableCell>
                  <TableCell className="p-1 align-middle">
                    <Badge className={emp.role === "admin" ? "bg-blue-100 text-blue-800 px-1 py-0.5 text-[9px] h-4 min-w-10" : "bg-purple-100 text-purple-800 px-1 py-0.5 text-[9px] h-4 min-w-10"}>
                      {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-1 align-middle">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                          {getStatusBadge(emp.status)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-1" align="start">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs justify-start px-2"
                            disabled={emp.status === 'active'}
                            onClick={() => {
                              setStatusChangeUser({ _id: emp._id, username: emp.username, newStatus: 'active' });
                              setStatusChangeModalOpen(true);
                            }}
                          >
                            Set to Active
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs justify-start px-2"
                            disabled={emp.status === 'inactive'}
                            onClick={() => {
                              setStatusChangeUser({ _id: emp._id, username: emp.username, newStatus: 'inactive' });
                              setStatusChangeModalOpen(true);
                            }}
                          >
                            Set to Inactive
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="p-1 align-middle">
                    <div
                      className="max-w-[400px] truncate cursor-pointer"
                      title={emp.permissions && emp.permissions.length > 0 ? emp.permissions.sort().join(", ") : "No Permission"}
                    >
                      {emp.permissions && emp.permissions.length > 0 ? (
                        emp.permissions.sort().join(", ")
                      ) : (
                        <span className="text-gray-400 italic">No Permission</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-1 align-middle">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        className="h-6 px-2 py-0 text-[11px] flex items-center gap-1"
                        onClick={() => openPermModal(emp._id, emp.permissions)}
                      >
                        <Pencil className="w-3 h-3" />
                        Set Permissions
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setDeleteUserId(emp._id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <span className="sr-only">Delete</span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6m-6 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Set Permissions Modal */}
      <Dialog open={permModalOpen} onOpenChange={setPermModalOpen}>
        <DialogContent className="max-w-xs p-4">
          <DialogHeader>
            <DialogTitle className="text-base">Set Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {ALL_PERMISSIONS.map(perm => (
              <label key={perm} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={permChecked.includes(perm)}
                  onChange={() => handlePermChange(perm)}
                  className="accent-blue-600 h-3 w-3"
                />
                {perm}
              </label>
            ))}
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setPermModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" variant="default" onClick={savePermissions}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Status Change Confirmation Modal */}
      <Dialog open={statusChangeModalOpen} onOpenChange={setStatusChangeModalOpen}>
        <DialogContent className="max-w-xs p-4">
          <DialogHeader>
            <DialogTitle className="text-base">Confirm Status Change</DialogTitle>
          </DialogHeader>
          <div className="text-sm py-2">
            {statusChangeUser && (
              <p>
                
                {statusChangeUser.newStatus === 'active'
                  ? <>This will <b className="text-green-500">Enable</b> login for</>
                  : <>This will <b className="text-red-500">Disable</b> login for</>}
                <b>&nbsp;{statusChangeUser.username}</b>
              </p>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => { setStatusChangeModalOpen(false); setStatusChangeUser(null); }}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusChangeUser?.newStatus === 'inactive' ? 'destructive' : 'default'}
              onClick={handleStatusChange}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-xs p-4">
          <DialogHeader>
            <DialogTitle className="text-base">Delete Employee</DialogTitle>
          </DialogHeader>
          <div className="text-xs py-2">
            {(() => {
              const emp = employees.find(e => e._id === deleteUserId);
              if (!emp) return null;
              return (
                <span>
                  Are you sure you want to delete <b>{emp.username}</b> ({emp.email})?
                  <br />This action cannot be undone.
                </span>
              );
            })()}
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (deleteUserId) {
                  await deleteEmployee(deleteUserId);
                  setDeleteModalOpen(false);
                  setDeleteUserId(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 