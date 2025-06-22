"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sales } from "@/lib/data";
import { Sale } from "@/lib/types";
import { Search, Eye, Download, Filter, Calendar, CreditCard, DollarSign, Receipt, ShoppingCart, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Sale | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Filter transactions
  const filteredTransactions = sales.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || transaction.paymentMethod.type === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleViewTransaction = (transaction: Sale) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  // Calculate totals
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = sales.length;
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const todayTransactions = sales.filter(sale =>
    new Date(sale.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage all sales transactions</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgTransactionValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTransactions}</div>
            <p className="text-xs text-muted-foreground">Transactions today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Payment Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {sales.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">#{transaction.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {transaction.customer?.name || "Guest"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.items.length} items</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="capitalize">{transaction.paymentMethod.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${transaction.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.status === "completed" ? "default" :
                        transaction.status === "pending" ? "secondary" :
                        transaction.status === "refunded" ? "destructive" :
                        "outline"
                      }>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleViewTransaction(transaction)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete transaction information and receipt details
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Transaction ID</label>
                      <p className="text-sm">#{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Date & Time</label>
                      <p className="text-sm">
                        {new Date(selectedTransaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Customer</label>
                      <p className="text-sm">{selectedTransaction.customer?.name || "Guest"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Badge variant={
                        selectedTransaction.status === "completed" ? "default" :
                        selectedTransaction.status === "pending" ? "secondary" :
                        selectedTransaction.status === "refunded" ? "destructive" :
                        "outline"
                      }>
                        {selectedTransaction.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Payment Method</label>
                      <p className="text-sm capitalize">{selectedTransaction.paymentMethod.type}</p>
                    </div>
                    {selectedTransaction.paymentMethod.reference && (
                      <div>
                        <label className="text-sm font-medium">Reference</label>
                        <p className="text-sm">{selectedTransaction.paymentMethod.reference}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">Amount Paid</label>
                      <p className="text-sm">${selectedTransaction.paymentMethod.amount.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Items Purchased</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTransaction.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${selectedTransaction.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedTransaction.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-${selectedTransaction.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>${selectedTransaction.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>${selectedTransaction.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredTransactions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
