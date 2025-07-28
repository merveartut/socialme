import { FaSearch } from "react-icons/fa";

export const SearchInput = ({
  value,
  onChange,
}: {
  value: any;
  onChange: any;
}) => {
  return (
    <div className="p-4">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </span>
        <input
          id="search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-zinc-600 text-white rounded-md h-10 w-full pl-10 pr-3 focus:outline-none"
          placeholder="Search..."
        />
      </div>
    </div>
  );
};
