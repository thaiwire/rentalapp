

export interface IUser {
    id: string;
    name: string;
    email: string;
    profile_pic : string;
    password: string;
    role: "admin" | "user";
    is_active: boolean;
    created_at: Date;
}