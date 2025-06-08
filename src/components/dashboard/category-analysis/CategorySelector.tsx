
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { categoryIcons } from "./CategoryIcon";

interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div>
      <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-2">
        Selecione uma categoria para ver detalhes:
      </label>
      <Select 
        value={selectedCategory} 
        onValueChange={onCategoryChange}
      >
        <SelectTrigger className="w-full md:w-[300px]">
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {categories.map(category => (
            <SelectItem key={category} value={category} className="flex items-center gap-2">
              {categoryIcons[category] && (
                <span className="mr-2">{categoryIcons[category]}</span>
              )}
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
