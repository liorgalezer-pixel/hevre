import { KeyRound, Car, Wind, Flame, HardHat, Sparkles, ShoppingCart, MoreHorizontal } from "lucide-react";

export const CATEGORIES = [
  { id: "locksmith", label: "לוקסמיט", icon: KeyRound },
  { id: "garage", label: "גראז", icon: Car },
  { id: "airduct", label: "אייר-דק", icon: Wind },
  { id: "chimney", label: "צ'ימני", icon: Flame },
  { id: "construction", label: "קונסטרשן", icon: HardHat },
  { id: "carpets", label: "ניקוי שטיחים", icon: Sparkles },
  { id: "sales", label: "עגלות/מכירות", icon: ShoppingCart },
  { id: "other", label: "אחר", icon: MoreHorizontal },
] as const;
