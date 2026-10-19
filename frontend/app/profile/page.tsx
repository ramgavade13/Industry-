import DashboardLayout from "@/components/DashboardLayout";
import type { Role } from "@/components/DashboardLayout";
import { PasswordForm, ProfileForm } from "@/components/ProfileForms";
import { fetchProfile } from "@/lib/usersApi";
import { ROLE_LABEL } from "@/lib/userTypes";
import { formatDate } from "@/lib/taskStyles";

export default async function ProfilePage() {
  const profile = await fetchProfile();

  return (
    <DashboardLayout role={profile.role as Role} title="My Profile" subtitle="Your account details and password">
      <div className="bg-[#161C2C] border border-[#242B3D] rounded-lg p-6 mb-6 max-w-5xl">
        <div className="text-lg font-semibold text-[#E7E4DC]">{profile.name}</div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-[#8B93A7]">Role</div>
            <div className="text-[#E7E4DC]">{ROLE_LABEL[profile.role] ?? profile.role}</div>
          </div>
          <div>
            <div className="text-xs text-[#8B93A7]">Username</div>
            <div className="text-[#E7E4DC]">{profile.username}</div>
          </div>
          <div>
            <div className="text-xs text-[#8B93A7]">Member since</div>
            <div className="text-[#E7E4DC]">{formatDate(profile.date_joined)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        <ProfileForm profile={profile} />
        <PasswordForm />
      </div>
    </DashboardLayout>
  );
}