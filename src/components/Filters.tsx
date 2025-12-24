import { apiGet } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Select, SelectItem } from "@heroui/react";

interface FiltersProps {
  page: string;
  onFiltersSelect: (selectedFilters: { [key: string]: string[] }) => void;
}

export interface IFilter {
  label: string;
  value: string;
  options: { text: string; value: string }[];
}

export default function Filters({ page, onFiltersSelect }: FiltersProps) {
  const [filters, setFilters] = useState<IFilter[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState(null);

  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string[];
  }>({});

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const url = `/api/filters?page=${page}`;
      const res = await apiGet(url);
      setFilters(res);
    } catch (err) {
      console.log("Error in fetching filters", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  return (
    <>
      <div>
        {filters?.map((filter) => (
          <Select
            className="max-w-xs"
            label={filter?.label}
            placeholder=""
            selectionMode="multiple"
            key={filter?.value}
            onSelectionChange={(selectedValue) => {
              const selectedValueArray = Array.from(selectedValue) as string[];

              setSelectedFilters((prev) => {
                const updatedSelectedFilters = {
                  ...prev,
                  [filter?.value]: selectedValueArray,
                };
                onFiltersSelect(updatedSelectedFilters);
                return updatedSelectedFilters;
              });
            }}
          >
            {(filter?.options ?? [])?.map((option) => (
              <SelectItem key={option?.value}>{option?.text}</SelectItem>
            ))}
          </Select>
        ))}
      </div>
    </>
  );
}
