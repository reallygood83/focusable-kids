'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="font-bold text-xl">집중력 강화 게임</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/screening" className="text-gray-600 hover:text-gray-900">
              스크리닝 테스트
            </Link>
            <Link href="/games" className="text-gray-600 hover:text-gray-900">
              게임
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              대시보드
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              소개
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">프로필</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/children">자녀 관리</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">로그인</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">회원가입</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link
                href="/screening"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                스크리닝 테스트
              </Link>
              <Link
                href="/games"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                게임
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                대시보드
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                소개
              </Link>
              {user ? (
                <div className="pt-4 border-t space-y-2">
                  <Link
                    href="/profile"
                    className="block text-gray-600 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    프로필
                  </Link>
                  <Link
                    href="/children"
                    className="block text-gray-600 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    자녀 관리
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="ghost" asChild className="flex-1">
                    <Link href="/auth/login">로그인</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/auth/register">회원가입</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}