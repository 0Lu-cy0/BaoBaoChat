import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";

const changePasswordSchema = z.object({
  old_password: z.string().min(6, "Mật khẩu cũ phải có ít nhất 6 ký tự"),
  new_password: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirm_password: z.string().min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirm_password"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await authService.changePassword(data.old_password, data.new_password);
      toast.success("Đổi mật khẩu thành công!");
      reset();
      navigate("/");
    } catch (error) {
      console.error(error);

      // 2. Kiểm tra xem lỗi có phải từ Axios không
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.message || "Đổi mật khẩu không thành công";
        toast.error(msg);
      } else {
        // Lỗi khác (không phải từ API)
        toast.error("Đã có lỗi không mong muốn xảy ra");
      }
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
                <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
                <p className="text-muted-foreground text-balance">
                  Cập nhật mật khẩu của bạn để bảo mật tài khoản
                </p>
              </div>

              {/* old password */}
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="old_password"
                  className="block text-sm"
                >
                  Mật khẩu cũ
                </Label>
                <Input
                  type="password"
                  id="old_password"
                  {...register("old_password")}
                />
                {errors.old_password && (
                  <p className="text-destructive text-sm">
                    {errors.old_password.message}
                  </p>
                )}
              </div>

              {/* new password */}
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="new_password"
                  className="block text-sm"
                >
                  Mật khẩu mới
                </Label>
                <Input
                  type="password"
                  id="new_password"
                  {...register("new_password")}
                />
                {errors.new_password && (
                  <p className="text-destructive text-sm">
                    {errors.new_password.message}
                  </p>
                )}
              </div>

              {/* confirm password */}
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="confirm_password"
                  className="block text-sm"
                >
                  Xác nhận mật khẩu mới
                </Label>
                <Input
                  type="password"
                  id="confirm_password"
                  {...register("confirm_password")}
                />
                {errors.confirm_password && (
                  <p className="text-destructive text-sm">
                    {errors.confirm_password.message}
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
                  Đổi mật khẩu
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
