import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";
import { Label } from "@/react-app/components/ui/label";
import { BookOpen, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import { apiService } from "@/react-app/lib/apiService";

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçersiz e-posta adresi"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string(),
  role: z.enum(["student", "instructor"]).default("student")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student"
    }
  });

  const roleValue = watch("role");

  const onSubmit = async (data: RegisterValues) => {
    try {
      setError(null);
      await apiService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      });
      // Optionally login the user immediately, but here we navigate to login
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Kayıt işlemi başarısız oldu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 mb-4 transition-transform hover:scale-105">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Hesap Oluştur</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Öğrenme yolculuğunuza bugün başlayın
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>Ad Soyad</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ahmet Yılmaz"
              className={errors.name ? "h-11 border-destructive focus-visible:ring-destructive" : "h-11"}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

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
            <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>Şifre</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className={errors.confirmPassword ? "text-destructive" : ""}>Şifreyi Onayla</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className={errors.confirmPassword ? "h-11 border-destructive focus-visible:ring-destructive" : "h-11"}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Hesap Türü</Label>
            <Select 
              value={roleValue} 
              onValueChange={(val: any) => setValue("role", val)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Hesap türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Öğrenci</SelectItem>
                <SelectItem value="instructor">Eğitmen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Hesap Oluştur"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Zaten bir hesabınız var mı?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
