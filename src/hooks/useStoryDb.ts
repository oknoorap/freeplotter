import Dexie, { type EntityTable } from "dexie";
import { ulid } from "ulid";

export interface Story {
  id: string;
  title: string;
  context: string;
  date: string;
  sentences: string[];
  paragraphs: string[];
}

const db = new Dexie("StoryDatabase") as Dexie & {
  stories: EntityTable<Story, "id">;
};

db.version(1).stores({
  stories: "++id, title, context, date, sentences, paragraphs",
});

export const useStoryDb = () => {
  const getStories = async () => db.stories.orderBy("id").reverse().toArray();
  const getStory = async (id: string) => db.stories.get(id);
  const addStory = async (story: Omit<Story, "id">) =>
    db.stories.add({
      id: ulid(),
      ...story,
    });
  const updateStory = async (id: string, story: Story) =>
    db.stories.put(story, id);

  return {
    addStory,
    getStory,
    getStories,
    updateStory,
  };
};
