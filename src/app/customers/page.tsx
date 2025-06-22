"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { customers as initialCustomers, sales } from "@/lib/data";
import type { Customer } from "@/lib/types";
import { Search, Plus, Edit, Trash2, Users, Eye, Mail, Phone, MapPin, Calendar, DollarSign, Save, Award, Star } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           customer.phone?.includes(searchQuery) ||
                           customer.address?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, customers]);

  // Customer purchase history
  const getCustomerPurchases = (customerId: string) => {
    return sales.filter(sale => sale.customerId === customerId);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: ""
    });
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast.error("Customer name is required");
      return;
    }

    const newCustomer: Customer = {
      id: `CUST-${Date.now()}`,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      loyaltyPoints: 0,
      totalSpent: 0,
      createdAt: new Date(),
      lastVisit: undefined
    };

    setCustomers(prev => [...prev, newCustomer]);
    toast.success("Customer created successfully");
    resetForm();
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingCustomer || !formData.name) {
      toast.error("Customer name is required");
      return;
    }

    const updatedCustomer: Customer = {
      ...editingCustomer,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined
    };

    setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
    toast.success("Customer updated successfully");
    resetForm();
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    toast.success("Customer deleted successfully");
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const totalCustomers = customers.length;
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
  const loyaltyMembers = customers.filter(c => c.loyaltyPoints > 0).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database and relationships</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Create a new customer profile</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1-555-0123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Customer address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setIsCreateDialogOpen(false); }}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                <Save className="h-4 w-4 mr-2" />
                Create Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyMembers}</div>
            <p className="text-xs text-muted-foreground">With loyalty points</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email, phone, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            Showing {filteredCustomers.length} of {customers.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Member since {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${customer.totalSpent.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {customer.loyaltyPoints > 0 ? (
                          <>
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{customer.loyaltyPoints}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.lastVisit ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(customer.lastVisit).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(customer)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(customer.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Customer Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-0123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Customer address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsEditDialogOpen(false); setEditingCustomer(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              <Save className="h-4 w-4 mr-2" />
              Update Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>Complete customer profile and purchase history</DialogDescription>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm">{viewingCustomer.name}</p>
                    </div>
                    {viewingCustomer.email && (
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{viewingCustomer.email}</p>
                      </div>
                    )}
                    {viewingCustomer.phone && (
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm">{viewingCustomer.phone}</p>
                      </div>
                    )}
                    {viewingCustomer.address && (
                      <div>
                        <Label className="text-sm font-medium">Address</Label>
                        <p className="text-sm">{viewingCustomer.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Total Spent</Label>
                      <p className="text-lg font-bold">${viewingCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Loyalty Points</Label>
                      <p className="text-lg font-bold flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {viewingCustomer.loyaltyPoints}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p className="text-sm">{new Date(viewingCustomer.createdAt).toLocaleDateString()}</p>
                    </div>
                    {viewingCustomer.lastVisit && (
                      <div>
                        <Label className="text-sm font-medium">Last Visit</Label>
                        <p className="text-sm">{new Date(viewingCustomer.lastVisit).toLocaleDateString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Purchase History</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const purchases = getCustomerPurchases(viewingCustomer.id);
                    return purchases.length > 0 ? (
                      <div className="space-y-3">
                        {purchases.map((purchase) => (
                          <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <p className="font-medium">Transaction #{purchase.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(purchase.createdAt).toLocaleDateString()} - {purchase.items.length} items
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${purchase.total.toFixed(2)}</p>
                              <Badge variant="outline">{purchase.paymentMethod.type}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No purchase history available
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No customers found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
