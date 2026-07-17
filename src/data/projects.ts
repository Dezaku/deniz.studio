/*
 * RIGHT-COLUMN PROJECTS — this list controls what shows and in what order.
 *
 * Each entry is one case-study section (a headline + its image gallery), rendered
 * top-to-bottom in the order below.
 *
 *   • ADD a project:     create a folder at  src/images/projects/<folder>/  with
 *                        numbered files (1.png, 2.png, …), then add a line here.
 *   • REORDER:           move the lines up/down.
 *   • HIDE (keep files):  comment out the line  (put // in front).
 *   • HEADLINE:          the `title` is the headline shown above that gallery.
 *
 * Shorthand: a plain string uses the folder name as the headline, e.g. 'scalerail'.
 */

export type Project = { folder: string; title?: string } | string;

export const projects: Project[] = [
  { folder: 'notra', title: 'Notra - AI marketing pipeline' },
  {folder: 'scalerail', title: 'Scalerail - Infrastructure & devtools' },
  {folder: 'luecke', title: 'Luecke - Café (concept)' },

];
