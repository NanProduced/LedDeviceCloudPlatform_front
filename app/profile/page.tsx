'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { userApi } from '@/lib/api';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

// UI组件
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  UserIcon,
  Mail,
  Phone,
  Building,
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const { t, language } = useLanguage();
  const router = useRouter();
  
  // 密码修改状态
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 日期格式化
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp', { locale: language === 'zh' ? zhCN : enUS });
    } catch {
      return dateString;
    }
  };

  // 处理密码修改
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    
    // 验证密码
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordNotMatch'));
      return;
    }
    
    try {
      setIsSubmitting(true);
      await userApi.modifyPassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      // 清空表单
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('修改密码失败:', err);
      setPasswordError(t('passwordError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 如果正在加载用户信息，显示加载状态
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600"></div>
      </div>
    );
  }

  // 如果没有用户信息，可能未登录
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('profile')}
        </h1>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          返回
        </Button>
      </div>

      {/* 用户信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-blue-600" />
            {t('userInfo')}
          </CardTitle>
          <CardDescription>
            查看和管理您的个人信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 用户名 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <UserIcon className="h-4 w-4" />
                {t('username')}
              </div>
              <p className="text-lg font-medium">{user.username}</p>
            </div>

            {/* 邮箱 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="h-4 w-4" />
                {t('email')}
              </div>
              <p className="text-lg font-medium">{user.email || '-'}</p>
            </div>

            {/* 电话 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone className="h-4 w-4" />
                {t('phone')}
              </div>
              <p className="text-lg font-medium">{user.phone || '-'}</p>
            </div>

            {/* 组织 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Building className="h-4 w-4" />
                {t('organization')}
              </div>
              <p className="text-lg font-medium">{user.orgName}</p>
            </div>

            {/* 用户组 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                {t('userGroup')}
              </div>
              <p className="text-lg font-medium">{user.ugName}</p>
            </div>

            {/* 账号状态 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                {t('accountStatus')}
              </div>
              <div>
                {user.active === 0 ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    {t('active')}
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    {t('inactive')}
                  </Badge>
                )}
              </div>
            </div>

            {/* 创建时间 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                {t('createdAt')}
              </div>
              <p className="text-sm">{formatDate(user.createdAt)}</p>
            </div>

            {/* 更新时间 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                {t('updatedAt')}
              </div>
              <p className="text-sm">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
          
          {/* 角色列表 */}
          <div className="mt-6">
            <h3 className="mb-2 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              {t('roles')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <Badge key={role.rid} variant="outline" className="bg-slate-100">
                    {role.displayName || role.roleName}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">无角色</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 修改密码卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            {t('changePassword')}
          </CardTitle>
          <CardDescription>
            修改您的账户密码
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {/* 旧密码 */}
              <div className="space-y-2">
                <Label htmlFor="oldPassword">{t('oldPassword')} <span className="text-red-500">*</span></Label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              {/* 新密码 */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('newPassword')} <span className="text-red-500">*</span></Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              {/* 确认密码 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')} <span className="text-red-500">*</span></Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* 错误和成功消息 */}
              {passwordError && (
                <div className="rounded bg-red-100 p-2 text-sm text-red-600">
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="rounded bg-green-100 p-2 text-sm text-green-600">
                  {t('passwordSuccess')}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white"></div>
                  处理中...
                </>
              ) : (
                t('submit')
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 