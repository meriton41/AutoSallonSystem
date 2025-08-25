"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Menu, X, User, Heart, Car, Moon, Sun } from "lucide-react";
import { RatingPopup } from "./ratinng-popup";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    if (user) {
      const userId = user.email;
      if (userId) {
        const hasRatedLocal = localStorage.getItem(`hasRated-${userId}`) === "true";
        setHasRated(hasRatedLocal);
      }
    }
  }, [user]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Vehicles", href: "/vehicles" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-sm transition-colors duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-primary dark:text-primary">
          Nitron
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </Button>

          {user && !hasRated && user.role === "User" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.dispatchEvent(new Event('open-rating-dialog'))}
              className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Rate Us
            </Button>
          )}

          {user && user.role === "Admin" && (
            <Link href="/dashboard">
              <Button variant="ghost" className="font-semibold dark:text-gray-200 dark:hover:bg-gray-800">Dashboard</Button>
            </Link>
          )}

          {user && user.role === "User" && (
            <Link href="/favorites" className="relative">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 dark:text-gray-200 dark:hover:bg-gray-800">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {user && user.role === "User" && (
            <Link href="/test-drive" className="relative">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 dark:text-gray-200 dark:hover:bg-gray-800">
                <Car className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {user && user.role === "User" && (
            <Link href="/leasing" className="relative">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 dark:text-gray-200 dark:hover:bg-gray-800">
                <span className="font-semibold">Leasing</span>
              </Button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="flex items-center gap-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              {user && user.role === "User" && (
                <Link href="/my-orders">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                    <Car className="h-4 w-4" />
                    My Orders
                  </Button>
                </Link>
              )}
              <Button variant="destructive" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="dark:text-gray-200">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setIsOpen(false)} />
        )}
        <div
          className={`fixed top-0 right-0 z-50 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-200 md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
            <span className="font-bold text-xl text-primary dark:text-primary">Nitron</span>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="dark:text-gray-200">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {user && !hasRated && user.role === "User" && (
              <Button 
                variant="outline"
                size="sm"
                className="w-full mt-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => {
                  window.dispatchEvent(new Event('open-rating-dialog'))
                  setIsOpen(false)
                }}
              >
                Rate Us
              </Button>
            )}

            {user && user.role === "Admin" && (
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full font-semibold mt-2 dark:text-gray-200 dark:hover:bg-gray-800">Dashboard</Button>
              </Link>
            )}

            {user && user.role === "User" && (
              <Link href="/favorites" className="relative" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 w-full justify-start dark:text-gray-200 dark:hover:bg-gray-800">
                  <Heart className="h-5 w-5 mr-2" /> Favorites
                </Button>
              </Link>
            )}

            {user && user.role === "User" && (
              <Link href="/test-drive" className="relative" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 w-full justify-start dark:text-gray-200 dark:hover:bg-gray-800">
                  <Car className="h-5 w-5 mr-2" /> Test Drive
                </Button>
              </Link>
            )}

            {user && user.role === "User" && (
              <Link href="/leasing" className="relative" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 w-full justify-start dark:text-gray-200 dark:hover:bg-gray-800">
                  <span className="font-semibold">Leasing</span>
                </Button>
              </Link>
            )}

            {user ? (
              <>
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex items-center gap-2 mt-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                    <User className="h-4 w-4" /> Profile
                  </Button>
                </Link>
                {user && user.role === "User" && (
                  <Link href="/my-orders" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-2 mt-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                      <Car className="h-4 w-4" /> My Orders
                    </Button>
                  </Link>
                )}
                <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => { logout(); setIsOpen(false); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full mt-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full mt-2">Register</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <RatingPopup />
    </header>
  );
}
