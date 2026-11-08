#!/usr/bin/env bash
# Replays CHANGELOG.md as empty commits on top of the current branch, then commits the code.
# Run once from the repo root:  bash scripts/replay-history.sh
set -euo pipefail

if [ ! -d .git ]; then git init -q; fi
if git log --oneline 2>/dev/null | grep -q "Initial 3D Sapiens timeline"; then
  echo "History already replayed on this branch. Nothing to do." >&2
  exit 1
fi
if [ -z "$(git config user.name || true)" ] || [ -z "$(git config user.email || true)" ]; then
  echo "Git doesn't know who you are. Run these, then re-run this script:" >&2
  echo '  git config --global user.name "Your Name"' >&2
  echo '  git config --global user.email "you@example.com"' >&2
  exit 1
fi
git rev-parse --verify HEAD >/dev/null 2>&1 || git symbolic-ref HEAD refs/heads/main
echo "Creating commits..."

c() { git commit -q --allow-empty --no-verify -m "$1"; }

c "feat: Initial 3D Sapiens timeline: low-poly checkpoints per chapter, idle camera float, chapter info card"
c "feat: Add hamburger menu under the title with a slide-in contents index and close button"
c "style: Make the contents menu background more transparent"
c "feat: Add a time stamp to each chapter info box"
c "chore: Package the project as a Vite + npm app"
c "feat: Add \"Read more\" detail panel with abridged chapter content"
c "fix: Detail panel layout and interaction issues"
c "content: Add detailed chapter summaries from the book PDF"
c "fix: Detail panel rendering issues after summary update"
c "fix: Panel overflow and scroll issues"
c "feat: Add study-room intro: dark room, desk, warm study lamp, low-poly book, seated camera with idle float"
c "tweak: Raise default study-room camera height while keeping the book in view"
c "refactor: Centre the book at the world origin and compose desk, lamp and camera around it"
c "content: Merge Kurzgesagt \"Timeline of Humanity\" events; highlight inventions such as fire and tools"
c "fix: Detail panel now follows Next/Back chapter changes while open"
c "feat: Add a ground-level 3D timeline with date labels for each checkpoint"
c "feat: Replace blocky text with three.js TextGeometry extruded 3D text"
c "style: Metro-map style timeline with circular stations; move date labels below stations"
c "fix: Transit line rendering issues"
c "style: Use palette colours instead of red for highlighted stations; shrink date labels 10%"
c "fix: Move date labels clear of station markers"
c "style: Reduce date label size"
c "style: Reduce date label size by a further 22%"
c "style: Reduce date label size further"
c "fix: Remove the small jerk at the end of camera transitions"
c "fix: Align date labels with the curve direction of the timeline"
c "rebrand: Rename to \"Homo Sapiens: A Brief Interactive History of Humankind\"; remove author from title"
c "chore: Remove the \"Homo Sapiens\" 3D text at the start of the timeline"
c "content: Add milestones from Kurzgesagt \"What Happened Before History? Human Origins\", incl. generations"
c "style: Reduce per-checkpoint event date text by 90%"
c "fix: Start the timeline at the first humans (2.8M years ago) to match chapter dates"
c "style: Keep the timeline white; reached stations light their inner disc orange"
c "tweak: Tilt the desk lamp toward its own stand"
c "tweak: Reduce the lamp tilt"
c "tweak: Widen the lamp spotlight cone by 20%"
c "feat: Add world minimap showing known human settlements for the current period"
c "style: Move the minimap to the right edge under the menu"
c "feat: Add sub-checkpoints between chapters for dated events from \"Read more\""
c "feat: Zoom on sub-checkpoint click; add debug panel with camera FOV slider"
c "fix: Debug panel and zoom wiring issues"
c "fix: FOV slider applies per scene"
c "fix: Zoom keeps the clicked station centred in the viewport"
c "fix: Zoom targets the station on the timeline instead of the 3D model"
c "fix: Clicking a chapter model zooms to its timeline station"
c "feat: Move debug panel to top centre; time-scaled checkpoint spacing with a spacing slider (applies on reload)"
c "content: Add events from Kurzgesagt \"12,000 Years of Human Curiosity\" with six new icons"
c "feat: Add event arrow buttons (bottom centre) to step between sub-checkpoints; keyboard , and ."
c "fix: Event arrows stay clear of the detail panel on narrow screens"
c "fix: Event arrows no longer overlap Back/Next; stepping forward from a chapter goes straight to the next event"
c "fix: Stepping back onto a chapter station returns to the chapter overview zoom"
c "fix: Back/Next stay enabled while focused on a sub-checkpoint"
c "fix: Remove camera jitter at flight start; single-flight navigation (no detour via next chapter)"
c "refactor: Split the app into modules: data, core, world, room, camera rig, navigator, input, UI"
c "chore: Rebuild the Vite project from the modular source; d3 and topojson via npm"
c "fix: Grey out event arrows at the first and last checkpoint"

git add -A
git commit -q -m "chore: add full source for the current version

Code for all changes above. See CHANGELOG.md."
echo "Done: $(git rev-list --count HEAD) commits."
echo "Next: git push -u origin main"
