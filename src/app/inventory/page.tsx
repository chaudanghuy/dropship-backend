"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { products as initialProducts, categories } from "@/lib/data";
import { Product } from "@/lib/types";
import { Search, Plus, Minus, AlertTriangle, Package, TrendingDown, TrendingUp, Edit, FileUp, Download, Filter } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";

interface StockAdjustment {
  id: string;
  productId: string;
  product: Product;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: Date;
  notes?: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock = stockFilter === "all" ||
                        (stockFilter === "low" && product.stock <= product.minStock) ||
                        (stockFilter === "out" && product.stock === 0) ||
                        (stockFilter === "normal" && product.stock > product.minStock);

    return matchesSearch && matchesCategory && matchesStock && product.isActive;
  });

  // Calculate stats
  const totalProducts = products.filter(p => p.isActive).length;
  const lowStockItems = products.filter(p => p.stock <= p.minStock && p.isActive).length;
  const outOfStockItems = products.filter(p => p.stock === 0 && p.isActive).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const handleStockAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setIsAdjustDialogOpen(true);
  };

  const processAdjustment = () => {
    if (!selectedProduct || !adjustmentQuantity || !adjustmentReason) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quantity = parseInt(adjustmentQuantity);
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    // Update product stock
    setProducts(prev => prev.map(p => {
      if (p.id === selectedProduct.id) {
        const newStock = adjustmentType === 'in'
          ? p.stock + quantity
          : Math.max(0, p.stock - quantity);

        return {
          ...p,
          stock: newStock,
          updatedAt: new Date()
        };
      }
      return p;
    }));

    // In a real app, you would also save the adjustment record
    const adjustment: StockAdjustment = {
      id: `ADJ-${Date.now()}`,
      productId: selectedProduct.id,
      product: selectedProduct,
      type: adjustmentType,
      quantity: quantity,
      reason: adjustmentReason,
      date: new Date(),
      notes: adjustmentNotes
    };

    toast.success(`Stock ${adjustmentType === 'in' ? 'increased' : 'decreased'} successfully`);

    // Reset form
    setIsAdjustDialogOpen(false);
    setSelectedProduct(null);
    setAdjustmentQuantity("");
    setAdjustmentReason("");
    setAdjustmentNotes("");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Unavailable items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">At retail prices</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Stock Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>
            Showing {filteredProducts.length} of {products.filter(p => p.isActive).length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Stock Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockValue = product.stock * product.price;
                  const stockStatus = product.stock === 0 ? 'out' :
                                    product.stock <= product.minStock ? 'low' : 'normal';

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div className="font-medium">{product.stock}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground">{product.minStock}</div>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>${stockValue.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          stockStatus === 'out' ? 'destructive' :
                          stockStatus === 'low' ? 'secondary' :
                          'default'
                        }>
                          {stockStatus === 'out' ? 'Out of Stock' :
                           stockStatus === 'low' ? 'Low Stock' :
                           'In Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStockAdjustment(product)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
            <DialogDescription>
              Adjust stock levels for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="text-sm">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Stock</Label>
                  <p className="text-sm font-bold">{selectedProduct.stock}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">SKU</Label>
                  <p className="text-sm">{selectedProduct.sku}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Min Stock</Label>
                  <p className="text-sm">{selectedProduct.minStock}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Adjustment Type</Label>
                  <Select value={adjustmentType} onValueChange={(value: 'in' | 'out') => setAdjustmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-green-600" />
                          Stock In (Add)
                        </div>
                      </SelectItem>
                      <SelectItem value="out">
                        <div className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-red-600" />
                          Stock Out (Remove)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <Label>Reason *</Label>
                  <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {adjustmentType === 'in' ? (
                        <>
                          <SelectItem value="purchase">New Purchase</SelectItem>
                          <SelectItem value="return">Customer Return</SelectItem>
                          <SelectItem value="found">Stock Found</SelectItem>
                          <SelectItem value="correction">Count Correction</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="theft">Theft/Loss</SelectItem>
                          <SelectItem value="return">Return to Supplier</SelectItem>
                          <SelectItem value="correction">Count Correction</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={adjustmentNotes}
                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                    placeholder="Additional notes about this adjustment"
                  />
                </div>

                {adjustmentQuantity && (
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">Preview</Label>
                    <p className="text-sm">
                      Current: {selectedProduct.stock} → New: {
                        adjustmentType === 'in'
                          ? selectedProduct.stock + parseInt(adjustmentQuantity || '0')
                          : Math.max(0, selectedProduct.stock - parseInt(adjustmentQuantity || '0'))
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processAdjustment}>
              {adjustmentType === 'in' ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Stock
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
