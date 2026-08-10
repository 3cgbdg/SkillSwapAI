import { Annotation, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { MATCH_ACTIVE_PROMPT } from '../prompts';
import { matchOutputSchema, MatchOutput } from '../schemas/match.schema';

interface FormattedUser {
  id: string;
  name: string;
  knownSkills: string[];
  skillsToLearn: string[];
}

const MatchState = Annotation.Root({
  user1: Annotation<FormattedUser>(),
  user2: Annotation<FormattedUser>(),
  result: Annotation<MatchOutput | undefined>(),
});

export function buildMatchGraph(model: ChatOpenAI) {
  const structuredModel = model.withStructuredOutput(matchOutputSchema, {
    name: 'skill_match_plan',
  });

  return new StateGraph(MatchState)
    .addNode('generate', async (state) => ({
      result: await structuredModel.invoke([
        new SystemMessage(MATCH_ACTIVE_PROMPT),
        new HumanMessage(
          `myProfile: ${JSON.stringify(state.user1)}, otherProfile: ${JSON.stringify(state.user2)}`,
        ),
      ]),
    }))
    .addEdge('__start__', 'generate')
    .addEdge('generate', '__end__')
    .compile();
}
