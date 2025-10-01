'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCurrentUserContext } from '@/features/auth/context/current-user-context';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useMe } from '@/features/auth/hooks/useMe';

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useCurrentUserContext();
  const { mutate: logout } = useLogout();
  const { data: meData } = useMe();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">체험단</div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive('/') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              홈
            </Link>
            {isAuthenticated && meData?.role === 'influencer' && (
              <>
                <Link
                  href="/my/applications"
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    isActive('/my/applications') ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  내 지원목록
                </Link>
                <Link
                  href="/my/profile"
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    isActive('/my/profile') ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  내 프로필
                </Link>
              </>
            )}
            {isAuthenticated && meData?.role === 'advertiser' && (
              <Link
                href="/my/campaigns"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive('/my/campaigns') ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                내 체험단
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden md:inline">
                  {user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
