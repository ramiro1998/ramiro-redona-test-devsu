import { Product } from "./product.interface";

export interface ApiResponse<T> {
    data: T;
}