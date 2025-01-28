import { useState, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import OpenAI from 'openai';

export const useOpenAI = () => {
  const [apiKey, setApiKey] = useLocalStorage<string | null>('openai_api_key', null, {
    serializer: JSON.stringify,
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.warn('Error parsing stored API key, resetting to null');
        return null;
      }
    },
  });
  const [client, setClient] = useState<OpenAI | null>(null);

  useEffect(() => {
    if (apiKey) {
      const newClient = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
      setClient(newClient);
    } else {
      setClient(null);
    }
  }, [apiKey]);

  const generateNextPrompt = async (sentences: string[], isParagraphPrompt = false): Promise<string> => {
    if (!client) throw new Error('OpenAI client not initialized');

    const text = sentences.join(' ');
    const systemPrompt = `
You are a creative writing assistant. Analyze the input text carefully and respond in the **SAME LANGUAGE** as the **INPUT**. Your primary role is to help writers deepen their narrative by asking one specific and engaging question that encourages further story development.

## Key Story Elements

1. **Story Elements**:
   - **Tension and Conflict**: Explore unresolved issues or challenges (internal/external).
   - **Character Development**: Delve into motivations, emotions, and relationships.
   - **Setting and Atmosphere**: Clarify or expand on details of the environment.
   - **Stakes and Risks**: Highlight what is at stake and why it matters.
   - **Pacing and Sequence**: Investigate timing or order of events.
   - **Show, Don’t Tell**: Identify opportunities to make descriptions more vivid.

2. **Question Guidelines**:
   - Generate **ONE concise question** based on the input.
   - Begin the question with one of these prompts:
     - **WHAT**: (e.g., actions, descriptions, or feelings)
     - **WHEN**: (e.g., timing or sequence of events)
     - **WHERE**: (e.g., setting or environment details)
     - **WHO**: (e.g., character roles or relationships)
     - **WHY**: (e.g., reasons or context)
     - **HOW**: (e.g., processes, emotions, or reactions)
   - Ensure the question is **specific and directly related** to the input.

Keep the question concise, specific, and directly related to developing the story's current moment. The response should be in the same language as the input.`;

    const userPrompt = isParagraphPrompt
      ? `Analyze this paragraph: "${text}"

Consider:
1. What narrative elements need development?
2. Which story aspects could be expanded?
3. What's missing from the scene?

Generate ONE specific question starting with what/when/where/who/why/how that will help develop the next paragraph.`
      : `Based on: "${text}"

Consider:
1. What's happening in this moment?
2. What details could enrich the scene?
3. What's the immediate tension or conflict?

Generate ONE specific question starting with what/when/where/who/why/how that will naturally lead to the next sentence.`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "What happens next in your story?";
    } catch (error) {
      console.error('Error generating prompt:', error);
      return "What would you like to write about next?";
    }
  };

  return {
    apiKey,
    setApiKey,
    generateNextPrompt,
    isInitialized: !!client
  };
};