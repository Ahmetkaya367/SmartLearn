import { useState, useEffect } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { FolderEdit, Plus, Trash2, Loader2, Edit2, Check, X } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function AdminCategories() {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [adding, setAdding] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await apiService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newCategoryName.trim()) return;
        if (categories.includes(newCategoryName)) {
            alert("Bu kategori zaten mevcut.");
            return;
        }

        try {
            setAdding(true);
            // Veri tabanına kalıcı olarak ekle
            await apiService.addCategory(newCategoryName);
            await fetchCategories(); // Listeyi yenile
            setNewCategoryName("");
        } catch (err) {
            alert("Kategori eklenirken bir hata oluştu.");
        } finally {
            setAdding(false);
        }
    };

    const startEditing = (index: number, name: string) => {
        setEditingIndex(index);
        setEditValue(name);
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditValue("");
    };

    const handleRename = async (oldName: string) => {
        if (!editValue.trim() || editValue === oldName) {
            cancelEditing();
            return;
        }

        try {
            setLoading(true);
            // Hem master listeyi hem de kursları güncelle
            await apiService.renameCategory(oldName, editValue);
            await fetchCategories(); // Listeyi yenile
            alert(`'${oldName}' ismi '${editValue}' olarak değiştirildi ve tüm kurslar güncellendi.`);
        } catch (err) {
            alert("Güncelleme sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
            cancelEditing();
        }
    };

    const handleDelete = async (name: string) => {
        if (!window.confirm(`'${name}' kategorisini kalıcı olarak silmek istediğinize emin misiniz?`)) return;
        
        try {
            setLoading(true);
            await apiService.deleteCategory(name);
            await fetchCategories();
        } catch (err: any) {
            alert(err.message || "Kategori silinirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Kategori Yönetimi</h1>
                    <p className="text-muted-foreground">Bağımsız kategori listesini yönetin (Düzenleme tüm kursları günceller).</p>
                </div>
                <div className="flex gap-2">
                    <Input 
                        placeholder="Yeni kategori adı..." 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <Button className="gap-2 shrink-0" onClick={handleAdd} disabled={adding || !newCategoryName.trim()}>
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Ekle
                    </Button>
                </div>
            </div>

            <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat, index) => (
                        <Card key={index} className="p-4 flex items-center justify-between border-border/60 hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3 flex-1 mr-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <FolderEdit className="w-5 h-5" />
                                </div>
                                {editingIndex === index ? (
                                    <Input 
                                        value={editValue} 
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="h-8"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="font-medium text-foreground truncate">{cat}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {editingIndex === index ? (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => handleRename(cat)}>
                                            <Check className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={cancelEditing}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => startEditing(index, cat)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>
        </div>
    );
}
