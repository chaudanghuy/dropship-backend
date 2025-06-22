"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { products, customers, categories, storeSettings } from "@/lib/data";
import type { Product, CartItem, Customer, PaymentMethod } from "@/lib/types";
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, Calculator, Receipt, User, ScanLine, Package } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import Image from "next/image";

export default function SalesPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod["type"]>("cash");
  const [amountPaid, setAmountPaid] = useState<string>("");

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.barcode?.includes(searchQuery);
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.isActive;
    });
  }, [searchQuery, selectedCategory]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxAmount = (subtotal - discountAmount) * storeSettings.taxRate;
  const total = subtotal - discountAmount + taxAmount;

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);

      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price
              }
            : item
        );
      }
      return [...prevCart, {
        productId: product.id,
        product,
        quantity: 1,
        price: product.price,
        discount: 0,
        total: product.price
      }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscountPercent(0);
    setAmountPaid("");
    toast.success("Cart cleared");
  };

  const processPayment = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const paidAmount = Number.parseFloat(amountPaid) || 0;
    if (paymentMethod === "cash" && paidAmount < total) {
      toast.error("Insufficient payment amount");
      return;
    }

    // Create sale object (in a real app, this would be saved to database)
    const sale = {
      id: `SALE-${Date.now()}`,
      customerId: selectedCustomer?.id,
      customer: selectedCustomer,
      items: cart,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total,
      paymentMethod: {
        type: paymentMethod,
        amount: total,
        reference: paymentMethod === "card" ? `CARD-${Date.now()}` : undefined
      },
      status: "completed" as const,
      createdAt: new Date(),
      completedAt: new Date()
    };

    // Process the sale
    toast.success(`Sale completed! Total: $${total.toFixed(2)}`);

    // Clear the cart and close checkout
    clearCart();
    setIsCheckoutOpen(false);

    // In a real app, you would print the receipt here
    console.log("Sale processed:", sale);
  };

  const change = paymentMethod === "cash" ? Math.max(0, Number.parseFloat(amountPaid) - total) : 0;

  return (
    <div className="flex h-screen">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Sales</h1>
            <p className="text-muted-foreground">Point of Sale Interface</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, SKU, or barcode..."
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
          <Button variant="outline" size="icon">
            <ScanLine className="h-4 w-4" />
          </Button>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square mb-2 bg-muted rounded-md overflow-hidden">
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
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{product.sku}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                    <Badge variant={product.stock > product.minStock ? "secondary" : "destructive"}>
                      {product.stock}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 border-l bg-muted/30 flex flex-col">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length})
            </h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="mb-4">
            <Label className="text-sm font-medium">Customer</Label>
            <Select
              value={selectedCustomer?.id || ""}
              onValueChange={(value) => {
                const customer = customers.find(c => c.id === value);
                setSelectedCustomer(customer || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Walk-in Customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {customer.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto px-6">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-sm">Add products to start a sale</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <Card key={item.productId}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                        <p className="font-medium">${item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary and Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t">
            {/* Discount */}
            <div className="mb-4">
              <Label className="text-sm font-medium">Discount (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                placeholder="0"
              />
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax ({(storeSettings.taxRate * 100).toFixed(1)}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Checkout
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Payment</DialogTitle>
                  <DialogDescription>
                    Complete the sale for ${total.toFixed(2)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value: PaymentMethod["type"]) => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Card
                          </div>
                        </SelectItem>
                        <SelectItem value="digital">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Digital Wallet
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === "cash" && (
                    <div>
                      <Label>Amount Paid</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder={total.toFixed(2)}
                      />
                      {change > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Change: ${change.toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={processPayment}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Complete Sale
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
