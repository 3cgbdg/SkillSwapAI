export interface IMatch {
    compatibility: number;
    aiExplanation?: string;
    keyBenefits: string[];
    id: string;
    isFriend?: boolean;
    other: {
        id: string;
        name: string;
        firstName?: string;
        lastName?: string;
        imageUrl: string;
        knownSkills: { title: string }[];
        skillsToLearn: { title: string }[];
    };
}
