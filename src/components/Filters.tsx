import { apiGet } from "@/lib/utils";
import { useEffect, useState } from "react";

interface FiltersProps {
  page: string;
}

export interface IFilter {
  label: string;
  value: string;
  options: { text: string; value: string }[];
}

export default function Filters({ page }: FiltersProps) {
  const [filters, setFilters] = useState<{ [key: string]: IFilter } | null>(
    null
  );
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
      <div>Filters</div>
    </>
  );
}
