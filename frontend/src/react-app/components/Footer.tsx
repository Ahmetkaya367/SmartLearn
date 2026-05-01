import { Link } from "react-router";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Learnify</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Dünya çapında öğrencileri premium çevrimiçi eğitimle güçlendiriyoruz.
            </p>
          </div>


          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Destek</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Yardım Merkezi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Bize Ulaşın
                </Link>
              </li>

            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Yasal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Learnify. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
