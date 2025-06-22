"use client";

import * as React from "react";
import {
  BarChart3,
  Calculator,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Home,
  FileText,
  Warehouse,
  CreditCard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
      },
      {
        title: "Sales",
        url: "/sales",
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        title: "Products",
        url: "/products",
        icon: Package,
      },
      {
        title: "Inventory",
        url: "/inventory",
        icon: Warehouse,
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Reports",
        url: "/reports",
        icon: BarChart3,
      },
      {
        title: "Transactions",
        url: "/transactions",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Calculator className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-semibold">POS System</h1>
            <p className="text-xs text-muted-foreground">Point of Sale</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          <p>v1.0.0</p>
          <p>Your Store Name</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
