import ICity from "./city";

export interface ITour{
    tour_id:number;
    tour_name:string;
}
export interface IAllTourItems{
    id:number;
    city: ICity;
    name:string;
    description:string;
    average_rating:number;
    tags:string[];
    prices:number[];
}
export interface IAllTour{
total:number;
page:number;
per_page:number;
items:IAllTourItems[];
}