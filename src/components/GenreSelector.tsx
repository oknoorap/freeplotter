import type { FC, SelectHTMLAttributes } from "react";

export interface GenreSelectorProps
  extends SelectHTMLAttributes<HTMLSelectElement> {}

export const GenreSelector: FC<GenreSelectorProps> = (props) => (
  <div className="w-full px-4 pl-0 py-1 bg-gray-800/50 rounded-xl cursor-pointer border border-gray-700 focus-within:ring-2 focus-within:ring-blue-500">
    <select
      id="genre"
      className="w-full cursor-pointer p-3 bg-transparent text-white placeholder-gray-500 outline-none border-none"
      {...props}
    >
      <option value="Adventure">Adventure</option>
      <option value="Alternate History">Alternate History</option>
      <option value="Apocalyptic Fiction">Apocalyptic Fiction</option>
      <option value="Chick Lit">Chick Lit</option>
      <option value="Children's Fiction">Children's Fiction</option>
      <option value="Classic Literature">Classic Literature</option>
      <option value="Comedy/Humor">Comedy/Humor</option>
      <option value="Coming of Age">Coming of Age</option>
      <option value="Contemporary Fiction">Contemporary Fiction</option>
      <option value="Crime">Crime</option>
      <option value="Cyberpunk">Cyberpunk</option>
      <option value="Dark Fantasy">Dark Fantasy</option>
      <option value="Dieselpunk">Dieselpunk</option>
      <option value="Dystopian">Dystopian</option>
      <option value="Epic Fantasy">Epic Fantasy</option>
      <option value="Fairy Tales">Fairy Tales</option>
      <option value="Fantasy">Fantasy</option>
      <option value="Gothic Fiction">Gothic Fiction</option>
      <option value="Grimdark">Grimdark</option>
      <option value="Hard Science Fiction">Hard Science Fiction</option>
      <option value="Heroic Fantasy">Heroic Fantasy</option>
      <option value="Historical Fiction">Historical Fiction</option>
      <option value="Horror">Horror</option>
      <option value="Legal Thriller">Legal Thriller</option>
      <option value="LGBTQ+ Fiction">LGBTQ+ Fiction</option>
      <option value="Light Novel">Light Novel</option>
      <option value="Literary Fiction">Literary Fiction</option>
      <option value="Magical Realism">Magical Realism</option>
      <option value="Military Science Fiction">Military Science Fiction</option>
      <option value="Mystery">Mystery</option>
      <option value="Mythology">Mythology</option>
      <option value="New Adult">New Adult</option>
      <option value="Paranormal">Paranormal</option>
      <option value="Philosophical Fiction">Philosophical Fiction</option>
      <option value="Political Fiction">Political Fiction</option>
      <option value="Portal Fantasy">Portal Fantasy</option>
      <option value="Psychological Fiction">Psychological Fiction</option>
      <option value="Psychological Thriller">Psychological Thriller</option>
      <option value="Romance">Romance</option>
      <option value="Romantic Comedy">Romantic Comedy</option>
      <option value="Science Fantasy">Science Fantasy</option>
      <option value="Science Fiction">Science Fiction</option>
      <option value="Slapstick Comedy">Slapstick Comedy</option>
      <option value="Space Opera">Space Opera</option>
      <option value="Steampunk">Steampunk</option>
      <option value="Superhero Fiction">Superhero Fiction</option>
      <option value="Suspense">Suspense</option>
      <option value="Thriller">Thriller</option>
      <option value="Urban Fantasy">Urban Fantasy</option>
      <option value="Young Adult (YA)">Young Adult (YA)</option>
    </select>
  </div>
);
