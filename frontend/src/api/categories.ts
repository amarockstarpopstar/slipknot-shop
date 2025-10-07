import { http } from './http';

export interface CategoryDto {
  id: number;
  name: string;
}

export const fetchCategories = async (): Promise<CategoryDto[]> => {
  const { data } = await http.get<CategoryDto[]>('/categories');
  return data.map((category) => ({
    id: category.id,
    name: category.name,
  }));
};
