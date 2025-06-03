import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  User, 
  Settings, 
  Package, 
  Globe, 
  History, 
  MapPin, 
  Phone, 
  Mail,
  Edit,
  Save,
  ArrowLeft,
  Calendar,
  Star,
  X
} from "lucide-react";

// Langues supportées
const SUPPORTED_LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "bm", name: "Bamanankan", flag: "🇲🇱" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" }
];

// Traductions multilingues
const translations = {
  fr: {
    myAccount: "Mon Compte",
    profile: "Profil",
    orders: "Commandes",
    preferences: "Préférences",
    personalInfo: "Informations personnelles",
    language: "Langue",
    orderHistory: "Historique des commandes",
    noOrders: "Aucune commande trouvée",
    edit: "Modifier",
    save: "Enregistrer",
    cancel: "Annuler",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    country: "Pays",
    trackingNumber: "Numéro de suivi",
    status: "Statut",
    amount: "Montant",
    date: "Date",
    from: "De",
    to: "Vers",
    type: "Type",
    total: "Total",
    completed: "Terminé",
    pending: "En attente",
    inTransit: "En transit",
    cancelled: "Annulé",
    selectLanguage: "Sélectionner la langue",
    updateSuccess: "Mise à jour réussie",
    updateError: "Erreur de mise à jour",
    back: "Retour",
    totalOrders: "Commandes totales",
    completedOrders: "Commandes terminées",
    totalSpent: "Total dépensé",
    accountSummary: "Résumé du compte"
  },
  bm: {
    myAccount: "N ka Konti",
    profile: "Profil",
    orders: "Baarakɛlaw",
    preferences: "Fɛɛrɛw",
    personalInfo: "Mɔgɔ kunnafoniw",
    language: "Kan",
    orderHistory: "Baara kɔrɔlen",
    noOrders: "Baara si tɛ",
    edit: "Yɛlɛma",
    save: "Mara",
    cancel: "Ban",
    firstName: "Tɔgɔ fɔlɔ",
    lastName: "Tɔgɔ laban",
    email: "Bataki",
    phone: "Telefɔni",
    address: "Sigiyɔrɔ",
    country: "Jamana",
    trackingNumber: "Kɔlɔsili",
    status: "Cogoya",
    amount: "Wari hakɛ",
    date: "Don",
    from: "Ka bɔ",
    to: "Ka taa",
    type: "Cogoya",
    total: "Bɛɛ",
    completed: "A bannen",
    pending: "Ka makɔnɔ",
    inTransit: "Taama kɔnɔ",
    cancelled: "A banna",
    selectLanguage: "Kan sugandi",
    updateSuccess: "Yɛlɛma ɲuman",
    updateError: "Yɛlɛma fili",
    back: "Segin",
    totalOrders: "Baara bɛɛ",
    completedOrders: "Baara bannenw",
    totalSpent: "Wari bɛɛ",
    accountSummary: "Konti kunnafoni"
  },
  en: {
    myAccount: "My Account",
    profile: "Profile",
    orders: "Orders",
    preferences: "Preferences",
    personalInfo: "Personal Information",
    language: "Language",
    orderHistory: "Order History",
    noOrders: "No orders found",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    country: "Country",
    trackingNumber: "Tracking Number",
    status: "Status",
    amount: "Amount",
    date: "Date",
    from: "From",
    to: "To",
    type: "Type",
    total: "Total",
    completed: "Completed",
    pending: "Pending",
    inTransit: "In Transit",
    cancelled: "Cancelled",
    selectLanguage: "Select Language",
    updateSuccess: "Update successful",
    updateError: "Update error",
    back: "Back",
    totalOrders: "Total Orders",
    completedOrders: "Completed Orders",
    totalSpent: "Total Spent",
    accountSummary: "Account Summary"
  },
  ar: {
    myAccount: "حسابي",
    profile: "الملف الشخصي",
    orders: "الطلبات",
    preferences: "التفضيلات",
    personalInfo: "المعلومات الشخصية",
    language: "اللغة",
    orderHistory: "تاريخ الطلبات",
    noOrders: "لا توجد طلبات",
    edit: "تعديل",
    save: "حفظ",
    cancel: "إلغاء",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    address: "العنوان",
    country: "البلد",
    trackingNumber: "رقم التتبع",
    status: "الحالة",
    amount: "المبلغ",
    date: "التاريخ",
    from: "من",
    to: "إلى",
    type: "النوع",
    total: "المجموع",
    completed: "مكتمل",
    pending: "قيد الانتظار",
    inTransit: "في الطريق",
    cancelled: "ملغي",
    selectLanguage: "اختر اللغة",
    updateSuccess: "تم التحديث بنجاح",
    updateError: "خطأ في التحديث",
    back: "العودة",
    totalOrders: "إجمالي الطلبات",
    completedOrders: "الطلبات المكتملة",
    totalSpent: "إجمالي المنفق",
    accountSummary: "ملخص الحساب"
  }
};

export default function CustomerAccount() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [language, setLanguage] = useState("fr");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    country: ""
  });

  // Récupérer les commandes du client
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders/my"],
    retry: false
  });

  // Récupérer les préférences utilisateur
  const { data: preferences = {}, isLoading: preferencesLoading } = useQuery({
    queryKey: ["/api/user/preferences"],
    retry: false
  });

  // Initialiser les données utilisateur pour l'édition
  useEffect(() => {
    if (user) {
      setEditedUser({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        country: user.country || ""
      });
    }
  }, [user]);

  // Charger la langue sauvegardée
  useEffect(() => {
    const savedLanguage = preferences?.language || localStorage.getItem('makoexpress-language') || 'fr';
    setLanguage(savedLanguage);
  }, [preferences]);

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      const t = translations[language as keyof typeof translations] || translations.fr;
      toast({
        title: t.updateSuccess,
        description: "Vos informations ont été mises à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
    },
    onError: () => {
      const t = translations[language as keyof typeof translations] || translations.fr;
      toast({
        title: t.updateError,
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour les préférences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/user/preferences", data);
      return res.json();
    },
    onSuccess: () => {
      const t = translations[language as keyof typeof translations] || translations.fr;
      toast({
        title: t.updateSuccess,
        description: "Vos préférences ont été mises à jour.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
    },
    onError: () => {
      const t = translations[language as keyof typeof translations] || translations.fr;
      toast({
        title: t.updateError,
        description: "Impossible de mettre à jour les préférences.",
        variant: "destructive",
      });
    },
  });

  // Obtenir les traductions pour la langue actuelle
  const t = translations[language as keyof typeof translations] || translations.fr;

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editedUser);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('makoexpress-language', newLanguage);
    updatePreferencesMutation.mutate({ language: newLanguage });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: "bg-green-100 text-green-800", text: t.completed },
      pending: { color: "bg-yellow-100 text-yellow-800", text: t.pending },
      in_transit: { color: "bg-blue-100 text-blue-800", text: t.inTransit },
      cancelled: { color: "bg-red-100 text-red-800", text: t.cancelled }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'fr-FR');
  };

  // Calculer les statistiques
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const completedOrders = Array.isArray(orders) ? orders.filter((o: any) => o.status === 'completed').length : 0;
  const totalSpent = Array.isArray(orders) ? orders.reduce((sum: number, order: any) => sum + (order.price || 0), 0) : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.back}
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{t.myAccount}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {user.firstName} {user.lastName}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{t.profile}</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>{t.orders}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>{t.preferences}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>{t.personalInfo}</span>
                  </CardTitle>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      {t.edit}
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} size="sm" disabled={updateProfileMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {t.save}
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        {t.cancel}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t.firstName}</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editedUser.firstName}
                        onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{user.firstName || "-"}</div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t.lastName}</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editedUser.lastName}
                        onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{user.lastName || "-"}</div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">{t.email}</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        {user.email || "-"}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">{t.phone}</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedUser.phoneNumber}
                        onChange={(e) => setEditedUser({ ...editedUser, phoneNumber: e.target.value })}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        {user.phoneNumber || "-"}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">{t.address}</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={editedUser.address}
                        onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        {user.address || "-"}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">{t.country}</Label>
                    {isEditing ? (
                      <Input
                        id="country"
                        value={editedUser.country}
                        onChange={(e) => setEditedUser({ ...editedUser, country: e.target.value })}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border">{user.country || "-"}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Résumé du compte */}
            <Card>
              <CardHeader>
                <CardTitle>{t.accountSummary}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-900">{totalOrders}</div>
                    <div className="text-sm text-blue-600">{t.totalOrders}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Star className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-900">{completedOrders}</div>
                    <div className="text-sm text-green-600">{t.completedOrders}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-900">{formatCurrency(totalSpent)}</div>
                    <div className="text-sm text-purple-600">{t.totalSpent}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>{t.orderHistory}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p>Chargement...</p>
                  </div>
                ) : totalOrders === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{t.noOrders}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.trackingNumber}</TableHead>
                          <TableHead>{t.from}</TableHead>
                          <TableHead>{t.to}</TableHead>
                          <TableHead>{t.type}</TableHead>
                          <TableHead>{t.amount}</TableHead>
                          <TableHead>{t.status}</TableHead>
                          <TableHead>{t.date}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.trackingNumber}</TableCell>
                            <TableCell>{order.pickupAddress}</TableCell>
                            <TableCell>{order.deliveryAddress}</TableCell>
                            <TableCell>{order.packageType}</TableCell>
                            <TableCell>{formatCurrency(order.price)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>{t.language}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>{t.selectLanguage}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t.selectLanguage} />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center space-x-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}