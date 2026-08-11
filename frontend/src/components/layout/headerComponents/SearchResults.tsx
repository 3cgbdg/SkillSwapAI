import { FoundSkills, FoundUsers } from "@/types/common";

import { UserRow } from "@/components/composites";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";

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
            <UserRow
              key={user.id}
              className="p-1"
              media={<UserAvatar name={user.name} size="sm" />}
              title={user.name}
              actions={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateFriendRequest(user.id)}
                >
                  Add friend
                </Button>
              }
            />
          ))}
        </div>
      ) : null}
      {foundSkills.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold">Skills</h4>
          {foundSkills.map((skill) => (
            <UserRow
              key={skill.id}
              className="p-1"
              media={
                <span className="text-lg" aria-hidden>
                  📚
                </span>
              }
              title={skill.title}
              actions={
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
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SearchResults;
