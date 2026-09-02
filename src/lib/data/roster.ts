export type Position = "GK" | "DEF" | "MID" | "FWD";

export type Player = {
  number: number;
  name: string;
  position: Position;
  year: string;
  hometown: string;
  major?: string;
  /** Drop headshots in /public/images and reference them here, e.g. "/images/players/10.jpg" */
  photo?: string;
  captain?: boolean;
};

export const positionLabels: Record<Position, string> = {
  GK: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

export const positionOrder: Position[] = ["GK", "DEF", "MID", "FWD"];

/** TODO: replace with the real roster. */
export const roster: Player[] = [
  { number: 1, name: "Player One", position: "GK", year: "Junior", hometown: "San Diego, CA", major: "Cognitive Science" },
  { number: 12, name: "Player Two", position: "GK", year: "Freshman", hometown: "Sacramento, CA", major: "Biology" },
  { number: 2, name: "Player Three", position: "DEF", year: "Senior", hometown: "Irvine, CA", major: "Mechanical Engineering", captain: true },
  { number: 3, name: "Player Four", position: "DEF", year: "Sophomore", hometown: "Portland, OR", major: "Economics" },
  { number: 4, name: "Player Five", position: "DEF", year: "Junior", hometown: "Phoenix, AZ", major: "Data Science" },
  { number: 5, name: "Player Six", position: "DEF", year: "Senior", hometown: "San Jose, CA", major: "Political Science" },
  { number: 15, name: "Player Seven", position: "DEF", year: "Freshman", hometown: "Denver, CO", major: "Undeclared" },
  { number: 6, name: "Player Eight", position: "MID", year: "Junior", hometown: "Los Angeles, CA", major: "Computer Science" },
  { number: 8, name: "Player Nine", position: "MID", year: "Senior", hometown: "Seattle, WA", major: "Public Health", captain: true },
  { number: 10, name: "Player Ten", position: "MID", year: "Sophomore", hometown: "Austin, TX", major: "Mathematics" },
  { number: 14, name: "Player Eleven", position: "MID", year: "Junior", hometown: "Fresno, CA", major: "Communication" },
  { number: 16, name: "Player Twelve", position: "MID", year: "Freshman", hometown: "Chicago, IL", major: "Bioengineering" },
  { number: 7, name: "Player Thirteen", position: "FWD", year: "Sophomore", hometown: "Oakland, CA", major: "Business Psychology" },
  { number: 9, name: "Player Fourteen", position: "FWD", year: "Senior", hometown: "Boston, MA", major: "Structural Engineering" },
  { number: 11, name: "Player Fifteen", position: "FWD", year: "Junior", hometown: "Miami, FL", major: "International Studies" },
  { number: 17, name: "Player Sixteen", position: "FWD", year: "Freshman", hometown: "Honolulu, HI", major: "Undeclared" },
];

export type StaffMember = {
  name: string;
  role: string;
};

/** TODO: replace with the real staff and officers. */
export const staff: StaffMember[] = [
  { name: "Head Coach Name", role: "Head Coach" },
  { name: "Assistant Coach Name", role: "Assistant Coach" },
  { name: "Officer Name", role: "President" },
  { name: "Officer Name", role: "Vice President" },
  { name: "Officer Name", role: "Treasurer" },
  { name: "Officer Name", role: "Social Chair" },
];
