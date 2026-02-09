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
    created_tours: ITour[];
    /** Tours the user has purchased; when present, "Start tour" is available in profile and on tour detail */
    booked_tours?: ITour[];
}