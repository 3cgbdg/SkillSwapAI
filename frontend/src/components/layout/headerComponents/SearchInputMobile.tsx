import { Search, X } from "lucide-react";
import SearchResults from "./SearchResults";
import { FoundSkills, FoundUsers } from "@/types/types";
import Spinner from "@/components/Spinner";
import { Dispatch, SetStateAction } from "react";

interface SearchInputMobileProps {
  word: string;
  panel: string | null;
  isSearchOpen: boolean;
  foundUsers: FoundUsers[];
  foundSkills: FoundSkills[];
  onWordChange: (value: string) => void;
  onSearch: (chars: string) => Promise<void>;
  onAddLearn: (skill: string, skillId: string) => void;
  onCreateFriendRequest: (userId: string) => void;
  onRemoveSkill: (skillId: string) => void;
  onPanelChange: Dispatch<SetStateAction<"avatarMenu" | "search" | "notifs" | "navMenu" | null>>
  onSearchOpenChange: (isOpen: boolean) => void;
  isPending: boolean;
}

const SearchInputMobile = ({
  word,
  isPending,
  panel,
  isSearchOpen,
  foundUsers,
  foundSkills,
  onWordChange,
  onSearch,
  onAddLearn,
  onCreateFriendRequest,
  onRemoveSkill,
  onPanelChange,
  onSearchOpenChange,
}: SearchInputMobileProps) => {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onWordChange(value);
    if (value.length >= 2) {
      await onSearch(value);
      onPanelChange("search");
    }
  };

  return (
    <>
      {/* search input for sm< */}
      <div
        className={`absolute panel _border top-full bg-white ${isSearchOpen && panel == "search" ? "" : "hidden"} md:hidden p-4 left-0 z-100  w-full`}
      >
        <input
          value={word}
          onChange={handleChange}
          type="text"
          className="outline-0 w-full"
          placeholder="Search for skills or users..."
        />
        {panel === "search" && (
          <div className=" w-full flex flex-col h-fit max-h-[265px] overflow-auto top-full panel bg-white z-10  left-0 absolute _border bg-primary p-3 rounded-b-[6px]">
            {isPending ? (
              <Spinner color="blue" size={24} />
            ) : (
              <SearchResults
                foundSkills={foundSkills}
                foundUsers={foundUsers}
                onAddLearn={onAddLearn}
                onCreateFriendRequest={onCreateFriendRequest}
                onRemoveSkill={onRemoveSkill}
              />
            )}
          </div>
        )}
      </div>

      {/* search button for sm< */}
      <div className="md:hidden mx-4">
        {panel === "search" && isSearchOpen ? (
          <button
            className={`cursor-pointer flex items-center  ${panel === "search" ? "text-primary" : ""}  `}
            onClick={() => {
              onPanelChange(null);
              onWordChange("");
              onSearchOpenChange(false);
            }}
          >
            <X size={26} className="" />
          </button>
        ) : (
          <button
            className="cursor-pointer flex items-center "
            onClick={() => {}}
          >
            <Search
              size={28}
              className=""
              onClick={() => {
                onSearchOpenChange(true);
                onPanelChange("search");
              }}
            />
          </button>
        )}
      </div>
    </>
  );
};

export default SearchInputMobile;
