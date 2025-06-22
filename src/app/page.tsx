"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardStats, products } from "@/lib/data";
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, Eye } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

export default function Dashboard() {
  const stats = dashboardStats;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your POS system overview</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTransactions}</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.topProducts.map((item, index) => (
              <div key={item.product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest sales activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.customer?.name || "Guest"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${transaction.total.toFixed(2)}</p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.paymentMethod.type}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/transactions">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Transactions
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-orange-700">
              The following products are running low and need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {product.stock} left
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min: {product.minStock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/inventory">
                  View Inventory
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            <Button asChild>
              <Link href="/sales">
                <ShoppingCart className="h-4 w-4 mr-2" />
                New Sale
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">
                <Package className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/customers">
                <Eye className="h-4 w-4 mr-2" />
                View Customers
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/reports">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
