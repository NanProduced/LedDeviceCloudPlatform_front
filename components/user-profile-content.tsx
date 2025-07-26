'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { userApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Users, 
  Shield, 
  Calendar,
  Key,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function UserProfileContent() {
  const { user, updateUserInfo } = useUser();
  const { t } = useLanguage();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // 处理密码修改
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 基本验证
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: 'error',
        message: t('passwordNotMatch')
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        message: '新密码长度至少6位'
      });
      return;
    }

    try {
      await userApi.modifyPassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordMessage({
        type: 'success',
        message: t('passwordSuccess')
      });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error) {
      setPasswordMessage({
        type: 'error',
        message: t('passwordError')
      });
    }
  };

  // 获取账号状态显示
  const getAccountStatus = () => {
    if (!user) return '';
    return user.active === 0 ? t('active') : t('inactive');
  };

  // 获取账号状态颜色
  const getAccountStatusColor = () => {
    if (!user) return 'default';
    return user.active === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">用户信息加载失败</h3>
            <p className="text-slate-600 dark:text-slate-400">无法获取用户信息，请刷新页面重试</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('profile')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">管理您的个人信息和账户设置</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 用户基本信息 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {t('userInfo')}
              </CardTitle>
              <CardDescription>您的个人基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('username')}
                  </Label>
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    value={user.email || '未设置'}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('phone')}
                  </Label>
                  <Input
                    id="phone"
                    value={user.phone || '未设置'}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {t('accountStatus')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge className={getAccountStatusColor()}>
                      {getAccountStatus()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 组织信息 */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                组织信息
              </CardTitle>
              <CardDescription>您所属的组织和用户组信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {t('organization')}
                  </Label>
                  <Input
                    value={user.orgName || '未分配'}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('userGroup')}
                  </Label>
                  <Input
                    value={user.ugName || '未分配'}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('roles')}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role.rid} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {role.displayName}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">暂未分配角色</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 密码修改 */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-600" />
                {t('changePassword')}
              </CardTitle>
              <CardDescription>修改您的登录密码</CardDescription>
            </CardHeader>
            <CardContent>
              {!isChangingPassword ? (
                <Button 
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full md:w-auto"
                >
                  {t('changePassword')}
                </Button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">{t('oldPassword')} *</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      required
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('newPassword')} *</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirmPassword')} *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>

                  {passwordMessage.message && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${
                      passwordMessage.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {passwordMessage.type === 'success' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm">{passwordMessage.message}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit">
                      {t('submit')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsChangingPassword(false)}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 账户信息侧边栏 */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                账户详情
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">用户ID</Label>
                <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {user.uid}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t('createdAt')}
                </Label>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : '未知'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t('updatedAt')}
                </Label>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {user.updatedAt ? format(new Date(user.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '未知'}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">组织ID</Label>
                <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {user.oid}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">用户组ID</Label>
                <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {user.ugid}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 安全提示 */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                安全提示
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <p>• 定期更换密码以保护账户安全</p>
                <p>• 不要在公共设备上保存密码</p>
                <p>• 发现异常活动请及时联系管理员</p>
                <p>• 谨慎分享个人账户信息</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}