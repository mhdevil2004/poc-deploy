"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Key, User } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormData,
  type ProfileFormData,
} from "@/lib/validations/loanSchema";
import { useTranslation } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { roleToKey } from "@/lib/permissions";
import type { NotificationPreferences } from "@/types";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailNotifications: true,
    loanUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department || "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateUser(data);
    setIsEditing(false);
  };

  const onPasswordSubmit = (_data: ChangePasswordFormData) => {
    passwordForm.reset();
  };

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DashboardLayout title={t('settings.title')} subtitle={t('settings.manageAccount')}>
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t('settings.profileInformation')}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{t('settings.manageDetails')}</p>
              </div>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                {t('settings.editProfile')}
              </Button>
            )}
          </CardHeader>

          <CardContent>
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">{t('settings.fullName')}</p>
                  <p className="font-medium text-gray-900 mt-1">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('settings.email')}</p>
                  <p className="font-medium text-gray-900 mt-1">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('settings.role')}</p>
                  <p className="font-medium text-gray-900 mt-1 capitalize">{user?.role ? t(`roles.${roleToKey(user.role)}` as TranslationKey) : ""}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('settings.department')}</p>
                  <p className="font-medium text-gray-900 mt-1">{user?.department || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('settings.phone')}</p>
                  <p className="font-medium text-gray-900 mt-1">{user?.phone || "—"}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('settings.fullName')}
                    error={profileForm.formState.errors.name?.message}
                    {...profileForm.register("name")}
                  />
                  <Input
                    label={t('settings.email')}
                    type="email"
                    error={profileForm.formState.errors.email?.message}
                    {...profileForm.register("email")}
                  />
                  <Input
                    label={t('settings.phone')}
                    {...profileForm.register("phone")}
                  />
                  <Input
                    label={t('settings.department')}
                    {...profileForm.register("department")}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit">{t('settings.saveChanges')}</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    {t('settings.cancel')}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Key className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle>{t('settings.changePassword')}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{t('settings.updatePasswordDesc')}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
              <Input
                label={t('settings.currentPassword')}
                type="password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register("currentPassword")}
              />
              <Input
                label={t('settings.newPassword')}
                type="password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register("newPassword")}
              />
              <Input
                label={t('settings.confirmNewPassword')}
                type="password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register("confirmPassword")}
              />
              <Button type="submit">{t('settings.updatePassword')}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-xl">
                <Bell className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle>{t('settings.notificationPreferences')}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{t('settings.manageNotifications')}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {(
                [
                  { key: "emailNotifications", label: t('settings.emailNotifications'), desc: t('settings.emailNotificationsDesc') },
                  { key: "loanUpdates", label: t('settings.loanUpdates'), desc: t('settings.loanUpdatesDesc') },
                  { key: "marketingEmails", label: t('settings.marketingEmails'), desc: t('settings.marketingEmailsDesc') },
                  { key: "securityAlerts", label: t('settings.securityAlerts'), desc: t('settings.securityAlertsDesc') },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification(item.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      notifications[item.key] ? "bg-primary" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notifications[item.key] ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
