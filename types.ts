export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
export type Goal = 'lose' | 'gain' | 'maintain';
export type RegionalPreference = 'North Indian' | 'South Indian' | 'Pan-Indian Fusion';

export interface UserData {
  age: number;
  gender: Gender;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: ActivityLevel;
  goal: Goal;
  regionalPreference: RegionalPreference;
  targetWeight?: number;
  dietPreference: string;
  allergies: string[];
  includeSupplements: boolean;
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
}

export interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  benefit: string;
}

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
  totalCalories: number;
}

export interface DietPlan {
  weeklyPlan: DayPlan[];
  overview: {
    dailyCalorieTarget: number;
    macronutrientRatio: {
      protein: number;
      carbs: number;
      fats: number;
    };
    advice: string;
    supplements: Supplement[];
  };
}

export interface Stats {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
}