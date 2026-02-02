/* eslint-disable @typescript-eslint/no-explicit-any */
import { ITour } from "./tour";

export default interface IUserInfo{
    id: number;
    email: string;
    name: string;
    city: string;
    active: boolean;
    role: string;
    member_circles: any[];
    created_circles: any[];
    created_tours: ITour[]
}