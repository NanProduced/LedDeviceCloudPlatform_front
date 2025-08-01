'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logout } from '@/config/auth';
import { Settings, LogOut } from 'lucide-react';

export function UserAvatar() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { t } = useLanguage();

  console.log('UserAvatar渲染 - 用户数据:', user);
  console.log('UserAvatar渲染 - 加载状态:', loading);

  // 获取用户名首字母作为头像回退显示
  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // 处理导航到账户设置页面
  const handleAccountSettingsClick = () => {
    router.push('/dashboard/settings');
  };

  // 处理退出登录
  const handleLogout = () => {
    logout();
  };

  // 如果正在加载用户信息，显示加载状态
  if (loading) {
    return (
      <Avatar className="cursor-pointer">
        <AvatarFallback className="bg-slate-700 text-slate-300 animate-pulse">
          ...
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-9 w-9">
          <AvatarFallback className="bg-blue-600 text-white">
            {getInitials(user?.username)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAccountSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>账户设置</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 