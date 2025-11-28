import { Plus, Handshake } from "lucide-react";
import Link from "next/link";
import { Found, FoundSkills, FoundUsers } from "@/types/types";
import { Dispatch, SetStateAction } from "react";

interface SearchResultsProps {
  foundSkills: FoundSkills[];
  foundUsers: FoundUsers[];
  onAddLearn: (skill: string, skillId: string) => void;
  onCreateFriendRequest: (userId: string) => void;
  onRemoveSkill: (skillId: string) => void;
}

const SearchResults = ({
  foundSkills,
  foundUsers,
  onAddLearn,
  onCreateFriendRequest,
  onRemoveSkill,
}: SearchResultsProps) => {
  return (
    <div className="flex flex-col gap-4 items-start text-sm font-semibold">
      {foundSkills.length > 0 && (
        <div className="flex flex-col gap-2 pb-4 not-last:border-b-[1px] border-neutral-300 w-full">
          <h3 className="text-xl md:text-lg leading-9 md:leading-7 font-semibold md:font-medium">
            Skills
          </h3>
          <div className="flex flex-col gap-1  border-neutral-300">
            {foundSkills.map((skill, index) => {
              return (
                <div key={index} className="flex gap-2 items-center">
                  <div className="  w-fit _border p-1 rounded-xl transition-all text-lg md:text-sm">
                    {skill.title}
                  </div>
                  <button
                    onClick={() => {
                      onAddLearn(skill.title, skill.id);
                      onRemoveSkill(skill.id);
                    }}
                    className="btn  w-fit _border p-1 rounded-xl cursor-pointer transition-all hover:bg-green-400 outline-0"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {foundUsers.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xl md:text-lg leading-9 md:leading-7 font-semibold md:font-medium">
            Users
          </h3>
          <div className="flex flex-col  gap-1  border-neutral-300">
            {foundUsers.map((user, index) => {
              return (
                <div key={index} className="flex gap-2 items-center">
                  <Link
                    href={`/profiles/${user.id}`}
                    className="btn  w-fit _border p-1 rounded-xl transition-all hover:bg-blue-200 outline-0 text-lg md:text-sm"
                  >
                    {user.name}
                  </Link>
                  <button
                    onClick={() => onCreateFriendRequest(user.id)}
                    className="btn cursor-pointer  w-fit _border p-1 rounded-xl transition-all hover:bg-green-400 outline-0"
                  >
                    <Handshake size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {foundSkills.length == 0 && foundUsers.length == 0 && (
        <span className="">Not found!</span>
      )}
    </div>
  );
};

export default SearchResults;
