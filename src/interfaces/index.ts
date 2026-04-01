

export interface IUser {
    id: string;
    name: string;
    email: string;
    profile_pic : string;
    password: string;
    role: "admin" | "user" | "support";
    is_active: boolean;
    created_at: Date;
}

export interface ICategory {
  id: string;
  name: string;
  description: string;
  image: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

export interface ItemInterface {
  id: string;
  name: string;
  description: string;
  images : string[];
  rent_per_day: number;
  available_quantity : number;
  total_quantity : number;
  category_id: string; 
  created_at: Date;
  updated_at: Date;
  
}