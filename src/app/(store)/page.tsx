import { redirect } from 'next/navigation';

// Open the complete, standalone green design from the branch homepage.
// A full-page redirect keeps its styles, scripts, and scrolling isolated
// from the existing store layout.
export default function HomePage() {
  redirect('/green-ui/index.html');
}
