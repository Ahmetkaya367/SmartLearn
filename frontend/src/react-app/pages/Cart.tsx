import { Link, useNavigate } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore } from "@/react-app/store/useCartStore";
import { useAuthStore } from "@/react-app/store/useAuthStore";
import { apiService } from "@/react-app/lib/apiService";
import { useState } from "react";

export default function Cart() {
  const { items, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setLoading(true);
    try {
      const courseIds = items.map(item => item.id);
      await apiService.checkoutCart(user.id, courseIds);
      clearCart();
      navigate("/student"); // Go back to student dashboard
    } catch (error) {
      console.error("Checkout failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8" />
          Shopping Cart
        </h1>
        
        {items.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-card">
            <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Looks like you haven't added anything to your cart yet. Discover some amazing courses and start learning today!
            </p>
            <Button asChild size="lg" className="h-12 px-8">
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <p className="text-lg font-medium text-muted-foreground">{items.length} Course{items.length !== 1 ? 's' : ''} in Cart</p>
              {items.map(item => (
                <Card key={item.id} className="p-4 flex flex-col sm:flex-row gap-6 border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors">
                  <div className="w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-muted shrink-0 shadow-inner">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center text-xs">
                        <ShoppingCart className="w-6 h-6 mb-1 opacity-50" />
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between w-full">
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-2 hover:text-primary transition-colors cursor-pointer">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">Instructor: <span className="font-medium text-slate-300">{item.instructor}</span></p>
                    </div>
                    <div className="flex items-center gap-4 text-sm mt-4 w-full justify-between sm:justify-start">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-0 h-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between font-bold text-2xl text-primary w-full sm:w-auto">
                     {item.price} ₺
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="relative">
              <Card className="p-6 sticky top-24 border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-sm">
                <h2 className="text-lg font-bold border-b border-border/50 pb-4 mb-6">Order Summary</h2>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-400">Original Price:</span>
                  <span className="text-muted-foreground line-through">{(getTotalPrice() * 1.2).toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between items-end mb-6">
                  <span className="text-slate-400">Total:</span>
                  <span className="text-4xl font-bold text-white">{getTotalPrice().toFixed(2)} ₺</span>
                </div>
                
                <Button 
                  className="w-full h-14 text-lg font-bold shadow-lg flex items-center justify-center gap-2 group" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      Checkout
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed">
                  By confirming your purchase you agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  30-Day Money-Back Guarantee
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
