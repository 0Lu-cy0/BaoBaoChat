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
import { useNavigate, useSearchParams } from "react-router";

const resetPasswordSchema = z.object({
  new_password: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirm_password: z.string().min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirm_password"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Token không hợp lệ");
      return;
    }

    try {
      await authService.resetPassword(token, data.new_password);
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/signin");
    } catch (error) {
      console.error(error);
      toast.error("Token không hợp lệ hoặc đã hết hạn");
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p className="text-destructive">Token không hợp lệ hoặc đã hết hạn</p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a
                  href="/"
                  className="mx-auto block w-fit text-center"
                >
                  <img
                    src="/Logo.png"
                    alt="logo"
                  />
                </a>

                <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
                <p className="text-muted-foreground text-balance">
                  Nhập mật khẩu mới cho tài khoản của bạn
                </p>
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

              {/* nút đặt lại */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                Đặt lại mật khẩu
              </Button>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className=" text-xs text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offetset-4">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và{" "}
        <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  );
}
