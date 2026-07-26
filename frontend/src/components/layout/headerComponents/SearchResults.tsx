import { FoundSkills, FoundUsers } from "@/types/common";

import { Button } from "@/components/ui/button";

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
  if (foundUsers.length === 0 && foundSkills.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No results for this search.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {foundUsers.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold">Users</h4>
          {foundUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate text-sm">{user.name}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onCreateFriendRequest(user.id)}
              >
                Add friend
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      {foundSkills.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold">Skills</h4>
          {foundSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate text-sm">{skill.title}</span>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onAddLearn(skill.title, skill.id)}
                >
                  Add to learn
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`Dismiss ${skill.title}`}
                  onClick={() => onRemoveSkill(skill.id)}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SearchResults;
