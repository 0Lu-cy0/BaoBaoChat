import { UpdateProfileForm } from "@/components/auth/update-profile-form";

export default function ProfilePage() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdateProfileForm />
      </div>
    </div>
  );
}
