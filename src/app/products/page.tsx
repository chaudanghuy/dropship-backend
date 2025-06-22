"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products as initialProducts, categories, storeSettings } from "@/lib/data";
import { type Product, Category } from "@/lib/types";
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, Eye, Filter, MoreHorizontal, Save, X } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import Image from "next/image";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    sku: "",
    barcode: "",
    category: "",
    stock: "",
    minStock: "",
    image: "",
    isActive: true
  });

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesLowStock = !showLowStock || product.stock <= product.minStock;
      const matchesActiveStatus = showInactive || product.isActive;

      return matchesSearch && matchesCategory && matchesLowStock && matchesActiveStatus;
    });
  }, [searchQuery, selectedCategory, showLowStock, showInactive, products]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      cost: "",
      sku: "",
      barcode: "",
      category: "",
      stock: "",
      minStock: "",
      image: "",
      isActive: true
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.price || !formData.sku || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newProduct: Product = {
      id: `PROD-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      cost: Number.parseFloat(formData.cost) || 0,
      sku: formData.sku,
      barcode: formData.barcode,
      category: formData.category,
      stock: Number.parseInt(formData.stock) || 0,
      minStock: Number.parseInt(formData.minStock) || 0,
      image: formData.image,
      isActive: formData.isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setProducts(prev => [...prev, newProduct]);
    toast.success("Product created successfully");
    resetForm();
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      cost: product.cost.toString(),
      sku: product.sku,
      barcode: product.barcode || "",
      category: product.category,
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      image: product.image || "",
      isActive: product.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.sku || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedProduct: Product = {
      ...editingProduct,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      cost: Number.parseFloat(formData.cost) || 0,
      sku: formData.sku,
      barcode: formData.barcode,
      category: formData.category,
      stock: Number.parseInt(formData.stock) || 0,
      minStock: Number.parseInt(formData.minStock) || 0,
      image: formData.image,
      isActive: formData.isActive,
      updatedAt: new Date()
    };

    setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
    toast.success("Product updated successfully");
    resetForm();
    setIsEditDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success("Product deleted successfully");
  };

  const lowStockCount = products.filter(p => p.stock <= p.minStock && p.isActive).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your inventory and product catalog</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Create a new product in your inventory</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Product SKU"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price * ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Product barcode"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Min Stock Level</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                />
                <Label htmlFor="isActive">Active Product</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setIsCreateDialogOpen(false); }}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                <Save className="h-4 w-4 mr-2" />
                Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              {products.filter(p => !p.isActive).length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">At retail prices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">At cost prices</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
                placeholder="Search products by name, SKU, category, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            <div className="flex items-center gap-4">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowStock"
                checked={showLowStock}
                onCheckedChange={(checked) => setShowLowStock(checked as boolean)}
              />
              <Label htmlFor="lowStock">Show only low stock items</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inactive"
                checked={showInactive}
                onCheckedChange={(checked) => setShowInactive(checked as boolean)}
              />
              <Label htmlFor="inactive">Include inactive products</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square mb-2 bg-muted rounded-md overflow-hidden relative">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(product)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">${product.price.toFixed(2)}</span>
                    <Badge variant={product.stock > product.minStock ? "secondary" : "destructive"}>
                      {product.stock}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{product.category}</span>
                    {!product.isActive && <Badge variant="outline">Inactive</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Products Table</CardTitle>
            <CardDescription>
              Showing {filteredProducts.length} of {products.length} products
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
                    <TableHead>Price</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-md overflow-hidden">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>${product.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > product.minStock ? "secondary" : "destructive"}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "outline"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
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
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU *</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Product SKU"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price * ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Cost ($)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-barcode">Barcode</Label>
                <Input
                  id="edit-barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Product barcode"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minStock">Min Stock Level</Label>
                <Input
                  id="edit-minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
              />
              <Label htmlFor="edit-isActive">Active Product</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsEditDialogOpen(false); setEditingProduct(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              <Save className="h-4 w-4 mr-2" />
              Update Product
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
