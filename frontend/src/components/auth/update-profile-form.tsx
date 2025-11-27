import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { uploadService } from "@/services/uploadService";
import { Camera, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

const updateProfileSchema = z.object({
  display_name: z.string().min(1, "Tên hiển thị là bắt buộc").max(50, "Tên hiển thị không được quá 50 ký tự"),
  bio: z.string().max(500, "Bio không được quá 500 ký tự").optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export function UpdateProfileForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const refresh = useAuthStore((state) => state.refresh);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarURL || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      display_name: user?.display_name || "",
      bio: user?.bio || "",
      phone: user?.phone || "",
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    try {
      setUploadingAvatar(true);
      await uploadService.uploadAvatar(avatarFile);
      await refresh();
      toast.success("Cập nhật avatar thành công!");
      setAvatarFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Upload avatar thất bại");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: UpdateProfileFormValues) => {
    try {
      // Upload avatar nếu có
      if (avatarFile) {
        await handleUploadAvatar();
      }

      const { message } = await useAuthStore.getState().updateProfile(
        data.display_name,
        data.bio || undefined,
        data.phone || undefined
      );
      toast.success(message || "Cập nhật thông tin thành công!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thông tin không thành công");
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header */}
              <div className="flex flex-col items-center text-center gap-2">
                <h1 className="text-2xl font-bold">Cập nhật thông tin</h1>
                <p className="text-muted-foreground text-balance">
                  Chỉnh sửa thông tin cá nhân của bạn
                </p>
              </div>

              {/* avatar upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || undefined} alt={user?.display_name} />
                    <AvatarFallback className="text-2xl bg-primary text-white">
                      {user?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                {avatarFile && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(user?.avatarURL || null);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadAvatar}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? "Đang tải..." : "Lưu avatar"}
                    </Button>
                  </div>
                )}
              </div>

              {/* display_name */}
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="display_name"
                  className="block text-sm"
                >
                  Tên hiển thị
                </Label>
                <Input
                  type="text"
                  id="display_name"
                  placeholder="Nguyễn Văn A"
                  {...register("display_name")}
                />
                {errors.display_name && (
                  <p className="text-destructive text-sm">
                    {errors.display_name.message}
                  </p>
                )}
              </div>

              {/* bio */}
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="bio"
                  className="block text-sm"
                >
                  Tiểu sử
                </Label>
                <Input
                  type="text"
                  id="bio"
                  placeholder="Một vài dòng về bạn..."
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className="text-destructive text-sm">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              {/* phone */}
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="phone"
                  className="block text-sm"
                >
                  Số điện thoại
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  placeholder="0123456789"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-destructive text-sm">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cập nhật
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
