import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";
import { Label } from "@/react-app/components/ui/label";
import { BookOpen, Loader2 } from "lucide-react";
import { useAuthStore } from "@/react-app/store/useAuthStore";
import { apiService } from "@/react-app/lib/apiService";

const loginSchema = z.object({
  email: z.string().email("Geçersiz e-posta adresi"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname || `/${user.role}`;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const onSubmit = async (data: LoginValues) => {
    try {
      setError(null);
      const result = await apiService.login(data.email, data.password);
      login(result.user, result.token);
    } catch (err: any) {
      setError(err.message || "Geçersiz kimlik bilgileri");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 mb-4 transition-transform hover:scale-105">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Tekrar Hoş Geldiniz</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Öğrenme yolculuğunuza devam etmek için giriş yapın
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              className={errors.email ? "h-11 border-destructive focus-visible:ring-destructive" : "h-11"}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>Şifre</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Şifremi Unuttum?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className={errors.password ? "h-11 border-destructive focus-visible:ring-destructive" : "h-11"}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Giriş Yap"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
