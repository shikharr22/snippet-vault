export interface IFilter {
  label: string;
  value: string;
  options: { text: string; value: string; disabled?: boolean }[];
  selectedValue: string;
}
