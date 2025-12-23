import { apiGet } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Select, SelectItem } from "@heroui/react";

interface FiltersProps {
  page: string;
}

export interface IFilter {
  label: string;
  value: string;
  options: { text: string; value: string }[];
}

export default function Filters({ page }: FiltersProps) {
  const [filters, setFilters] = useState<IFilter[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState(null);

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
