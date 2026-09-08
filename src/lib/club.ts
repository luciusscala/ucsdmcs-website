/**
 * The club's own words and contacts, in one place because more than one page
 * needs them — the homepage today, Contact and FAQ once those are filled in.
 * Nothing here comes from the database: it changes once a year at most, and a
 * table would only add a query and a failure mode.
 */

/** Listed by office rather than in the order they were handed over. */
export const OFFICERS = [
  { role: "President", name: "Dayne Kovatchev", email: "dkovatchev@ucsd.edu" },
  {
    role: "Vice President",
    name: "Patrick Machado",
    email: "pmachado@ucsd.edu",
  },
  { role: "Treasurer", name: "Pedro Teixeira", email: "pteixeira@ucsd.edu" },
] as const;

export const TEAM_EMAIL = "ucsdmcs@gmail.com";

export const ACCOLADES = [
  "NIRSA Open Division National Champions",
  "NIRSA Regional VI Champions",
  "WCSA Playoff Finalists",
  "Aztec Cup Champions",
] as const;

/**
 * The club's description of itself, one string per paragraph. Kept as prose
 * rather than marked-up copy so it stays editable by whoever holds the office.
 */
export const ABOUT = [
  "Want to keep playing competitive, high-level soccer in college and still have time for your school and social life? Then UC San Diego Club Soccer is right for you!",
  "We are a student-run Sports Club in the UC San Diego Recreation department competing in the SoCal conference of the West Coast Soccer Association Premier Division, now organized and run by US College Club Soccer (USCCS). Representing UC San Diego, we play league matches against teams like San Diego State, UC Los Angeles, University of San Diego, Cal Poly SLO, and more. We also play in several other tournaments over the course of the year, such as NIRSA Regionals, Aztec Cup, and the Triton Invitational (which we hosted last year with the Women’s Club Soccer team).",
  "The busiest part of the season is during the Fall Quarter, where we will have league games mixed in with Aztec Cup and, subject to qualification, NIRSA Regionals and NIRSA Nationals. The Winter Quarter usually consists of league games and our Triton Invitational, while the focus of the Spring Quarter is WCSA Playoffs in April.",
  "We train two or three times during the week in the evenings, and our competitions mostly take place on the weekends. Consistent participation is expected, as are annual player fees that recently have been about $500 (assistance with these fees is available, if need be). We tend to carry around 25 or so players on our roster and like to have a mix of all years (graduate students are welcome too).",
  "If all of this sounds good to you, we typically hold tryouts during Week 0 (i.e., Welcome Week) of the Fall Quarter. More information about tryouts will be posted on our team website as well as on our social media. Feel free to contact the team leaders at the emails above with any further questions or comments.",
] as const;

/**
 * Fall 2026 tryouts, held in Week 0 as the club description says. Times differ
 * by day, so each session carries its own rather than sharing one.
 */
export const TRYOUT_LOCATION = "RIMAC Field";

export const TRYOUTS = [
  { day: "Day 1", date: "Tuesday, September 22", time: "6–8 PM" },
  { day: "Day 2", date: "Wednesday, September 23", time: "7–9 PM" },
  { day: "Day 3", date: "Thursday, September 24", time: "7–9 PM" },
] as const;

/** Cash is "preferred" rather than required, so the wording stays soft. */
export const TRYOUT_KIT = [
  "Cleats",
  "Shin guards",
  "White shirt",
  "$20 — cash preferred",
] as const;

/** The registration form, also encoded in `public/tryouts-qr.svg`. Changing
 *  one without regenerating the other would leave the QR pointing elsewhere. */
export const TRYOUT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfOPFUQ8zbGAANGAsZcdJ7A8EWDtTrHo8dV3XBnGmDC6E9UNA/viewform?usp=header";
