import { Annotation, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PROFILE_SKILLS_PROMPT } from '../prompts';
import { skillsOutputSchema, SkillsOutput } from '../schemas/skills.schema';

const SkillsState = Annotation.Root({
  skillsToLearn: Annotation<string[]>(),
  knownSkills: Annotation<string[]>(),
  result: Annotation<SkillsOutput | undefined>(),
});

export function buildSkillsGraph(model: ChatOpenAI) {
  const structuredModel = model.withStructuredOutput(skillsOutputSchema, {
    name: 'skill_suggestions',
  });

  return new StateGraph(SkillsState)
    .addNode('generate', async (state) => ({
      result: await structuredModel.invoke([
        new SystemMessage(PROFILE_SKILLS_PROMPT),
        new HumanMessage(
          `skills user wants to learn: ${JSON.stringify(state.skillsToLearn)}, skills user already knows: ${JSON.stringify(state.knownSkills)}`,
        ),
      ]),
    }))
    .addEdge('__start__', 'generate')
    .addEdge('generate', '__end__')
    .compile();
}
