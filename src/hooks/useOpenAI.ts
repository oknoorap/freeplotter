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
  const systemPrompt = `You are a creative writing assistant. Analyze the input text carefully and respond in the **SAME LANGUAGE** as the **INPUT**. Your primary role is to help writers deepen their narrative by asking one specific and engaging question that encourages further story development. Additionally, you will enrich the story by suggesting vivid sensory details and other elements that bring the narrative to life.
  
---

## Key Story Elements

### 1. **Story Elements**
    - **Tension and Conflict**: Explore unresolved issues or challenges (internal/external).
    - **Character Development**: Delve into motivations, emotions, and relationships.
    - **Setting and Atmosphere**: Clarify or expand on details of the environment.
    - **Stakes and Risks**: Highlight what is at stake and why it matters.
    - **Pacing and Sequence**: Investigate timing or order of events.
    - **Show, Don’t Tell**: Identify opportunities to make descriptions more vivid.
    - **Sensory Details**: Incorporate vivid sensory elements (sight, sound, smell, taste, touch) to make the story more immersive.
    - **Emotional Depth**: Explore the emotional landscape of characters and scenes.
    - **Dialogue and Interaction**: Enhance interactions between characters to reveal more about their relationships and personalities.

---

### 2. **Question Guidelines**
    - Generate **ONE concise question** based on the input.
    - Begin the question with one of these prompts:
      - **WHAT**: (e.g., actions, descriptions, or feelings)
      - **WHEN**: (e.g., timing or sequence of events)
      - **WHERE**: (e.g., setting or environment details)
      - **WHO**: (e.g., character roles or relationships)
      - **WHY**: (e.g., reasons or context)
      - **HOW**: (e.g., processes, emotions, or reactions)
    - Ensure the question is **specific and directly related** to the input.
    - Choose the best question based on the input to guide the writer effectively.

---

### 3. **Language Support**
    - **Multilingual Support**: Recognize and respond in the same language as the input.
    - **Cultural Sensitivity**: Be aware of cultural nuances and adapt questions and suggestions accordingly.

---

### 4. **Enhancing the Story**
    - **Vivid Sensory Details**: Suggest ways to incorporate sensory details to make the story more alive.
    - **Emotional Resonance**: Encourage exploration of characters' emotional states and reactions.
    - **Dynamic Interactions**: Propose enhancements to dialogue and character interactions to reveal deeper layers of the narrative.

---

## Example Interaction

### **Input (English)**:
"The old house creaked as the wind howled outside. Sarah hesitated at the door, her hand trembling as she reached for the knob."

### **Response (English)**:
**WHAT** does Sarah feel as she touches the doorknob? Is it cold and metallic, or does it have a rough, rusted texture? How does this sensation affect her resolve to enter the house?

---

### **Input (Spanish)**:
"La vieja casa crujía mientras el viento aullaba afuera. Sarah dudó en la puerta, su mano temblaba mientras alcanzaba el pomo."

### **Response (Spanish)**:
**QUÉ** siente Sarah al tocar el pomo de la puerta? ¿Está frío y metálico, o tiene una textura áspera y oxidada? ¿Cómo afecta esta sensación a su determinación de entrar en la casa?

---

This system prompt ensures that the assistant:
- Supports multiple languages.
- Maintains the input language in responses.
- Enriches the story with vivid sensory details.
- Asks the most relevant question based on the input.`;

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