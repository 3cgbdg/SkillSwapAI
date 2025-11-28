import { Search, X } from "lucide-react";
import SearchResults from "./SearchResults";
import { FoundSkills, FoundUsers } from "@/types/types";
import Spinner from "@/components/Spinner";
import { Dispatch, SetStateAction } from "react";

interface SearchInputProps {
    word: string;
    panel: string | null;
    foundUsers: FoundUsers[];
    foundSkills: FoundSkills[];
    onWordChange: (value: string) => void;
    onSearch: (chars: string) => Promise<void>;
    onAddLearn: (skill: string, skillId: string) => void;
    onCreateFriendRequest: (userId: string) => void;
    onRemoveSkill: (skillId: string) => void;
    onPanelChange: Dispatch<SetStateAction<"avatarMenu" | "search" | "notifs" | "navMenu" | null>>;
    isPending: boolean;
}

const SearchInput = ({
    word,
    isPending,
    panel,
    foundUsers,
    foundSkills,
    onWordChange,
    onSearch,
    onAddLearn,
    onCreateFriendRequest,
    onRemoveSkill,
    onPanelChange,
}: SearchInputProps) => {
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onWordChange(value);

        if (value.length >= 2) {
            await onSearch(value);
            onPanelChange("search");
        } else {
            onPanelChange(null);
        }
    };

    return (
        <div className=" items-center md:flex hidden gap-2 input">
            {panel === "search" ? (
                <button
                    className={`cursor-pointer panel flex items-center ${panel === "search" ? "text-primary" : ""} `}
                    onClick={() => {
                        onPanelChange(null);
                        onWordChange("");
                    }}
                >
                    <X />
                </button>
            ) : (
                <button
                    className="cursor-pointer flex items-center    transition-all hover:text-primary"
                >
                    <Search />
                </button>
            )}

            <input
                value={word}
                onChange={handleChange}
                type="text"
                className="outline-0"
                placeholder="Search for skills or users..."
            />

            {panel === "search" && (
                <div className="md:min-w-[250px] min-w-[300px] flex flex-col h-fit max-h-[260px] overflow-auto panel top-full bg-white z-10  left-0 absolute _border mt-1 bg-primary p-3 rounded-[6px]">
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
    );
};

export default SearchInput;
