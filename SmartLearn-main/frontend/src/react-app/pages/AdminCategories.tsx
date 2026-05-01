import { useState } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Badge } from "@/react-app/components/ui/badge";
import { Plus, Pencil, Trash2, FolderEdit } from "lucide-react";
import { categories as initialCategories } from "@/data/courses";

export default function AdminCategories() {
    const [categories, setCategories] = useState(initialCategories);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Kategori Yönetimi</h1>
                    <p className="text-muted-foreground">Kurs kategorilerini düzenleyin ve yeni alanlar ekleyin.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Yeni Kategori
                </Button>
            </div>

            <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <Card key={cat} className="p-4 flex items-center justify-between border-border/60 hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <FolderEdit className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-foreground">{cat}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>
        </div>
    );
}
