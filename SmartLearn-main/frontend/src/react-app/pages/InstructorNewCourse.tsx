import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/react-app/components/ui/select";
import { Save, Upload, Plus } from "lucide-react";

export default function InstructorNewCourse() {
    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Yeni Kurs Oluştur</h1>
                <p className="text-muted-foreground">Bilginizi dünyayla paylaşmaya başlayın.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Kurs Başlığı</Label>
                            <Input id="title" placeholder="Örn: Sıfırdan İleri Seviye React" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Kısa Açıklama</Label>
                            <Textarea id="desc" placeholder="Öğrencilerin neden bu kursu alması gerektiğini açıklayın." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dev">Yazılım</SelectItem>
                                    <SelectItem value="design">Tasarım</SelectItem>
                                    <SelectItem value="biz">İşletme</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Seviye</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Başlangıç">Başlangıç</SelectItem>
                                    <SelectItem value="Orta">Orta</SelectItem>
                                    <SelectItem value="İleri">İleri</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Fiyat ($)</Label>
                            <Input id="price" type="number" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Kurs Görseli</Label>
                        <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Upload className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium">Dosya yüklemek için tıklayın</p>
                                <p className="text-sm text-muted-foreground">SVG, PNG, JPG veya GIF (max. 800x400px)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t font-semibold">
                        <Button variant="ghost">İptal</Button>
                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2">
                                <Save className="w-4 h-4" /> Taslağı Kaydet
                            </Button>
                            <Button className="gap-2">
                                Devam Et
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
