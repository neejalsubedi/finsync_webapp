import { IconType } from "react-icons";
import {
  MdWork,
  MdBusiness,
  MdLaptop,
  MdShowChart,
  MdSavings,
  MdHome,
  MdTrendingUp,
  MdCardGiftcard,
  MdReplay,
  MdHandyman,
  MdMoreHoriz,
  MdShoppingCart,
  MdReceipt,
  MdDirectionsBus,
  MdLocalHospital,
  MdMovie,
  MdShoppingBag,
  MdRestaurant,
  MdAirplanemodeActive,
  MdSchool,
  MdSpa,
  MdSecurity,
  MdHouse,
  MdElectricalServices,
  MdSubscriptions,
} from "react-icons/md";

export interface Category {
  name: string;
  icon: IconType;
}

// 💰 Income Categories
export const INCOME_CATEGORIES: Category[] = [
  { name: "Salary", icon: MdWork },
  { name: "Business", icon: MdBusiness },
  { name: "Freelance", icon: MdLaptop },
  { name: "Investments", icon: MdShowChart },
  { name: "Interest", icon: MdSavings },
  { name: "Rental Income", icon: MdHome },
  { name: "Dividends", icon: MdTrendingUp },
  { name: "Bonus", icon: MdCardGiftcard },
  { name: "Refunds", icon: MdReplay },
  { name: "Side Hustle", icon: MdHandyman },
  { name: "Others", icon: MdMoreHoriz },
];

// 💸 Expense Categories
export const EXPENSE_CATEGORIES: Category[] = [
  { name: "Groceries", icon: MdShoppingCart },
  { name: "Bills", icon: MdReceipt },
  { name: "Transportation", icon: MdDirectionsBus },
  { name: "Health", icon: MdLocalHospital },
  { name: "Entertainment", icon: MdMovie },
  { name: "Shopping", icon: MdShoppingBag },
  { name: "Food & Dining", icon: MdRestaurant },
  { name: "Travel", icon: MdAirplanemodeActive },
  { name: "Education", icon: MdSchool },
  { name: "Personal Care", icon: MdSpa },
  { name: "Gifts & Donations", icon: MdCardGiftcard },
  { name: "Insurance", icon: MdSecurity },
  { name: "Rent", icon: MdHouse },
  { name: "Utilities", icon: MdElectricalServices },
  { name: "Subscriptions", icon: MdSubscriptions },
  { name: "Others", icon: MdMoreHoriz },
];

export const getCategories = (type: "income" | "expense"): Category[] => {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

export const getCategoryIcon = (
  categoryName: string,
  type?: "income" | "expense"
): IconType | null => {
  if (!categoryName) return null;
  const normalizedName = categoryName.trim().toLowerCase();
  if (type) {
    const categories = getCategories(type);
    const cat = categories.find((c) => c.name.toLowerCase() === normalizedName);
    if (cat) return cat.icon;
  }
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  const cat = allCategories.find((c) => c.name.toLowerCase() === normalizedName);
  return cat ? cat.icon : null;
};
