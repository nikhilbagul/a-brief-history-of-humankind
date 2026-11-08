# Changelog

Reconstructed from the design conversation, oldest first. Earlier file versions weren't kept, so these entries describe changes; the full code is in the final commit.

01. **feat:** Initial 3D Sapiens timeline: low-poly checkpoints per chapter, idle camera float, chapter info card
02. **feat:** Add hamburger menu under the title with a slide-in contents index and close button
03. **style:** Make the contents menu background more transparent
04. **feat:** Add a time stamp to each chapter info box
05. **chore:** Package the project as a Vite + npm app
06. **feat:** Add "Read more" detail panel with abridged chapter content
07. **fix:** Detail panel layout and interaction issues
08. **content:** Add detailed chapter summaries from the book PDF
09. **fix:** Detail panel rendering issues after summary update
10. **fix:** Panel overflow and scroll issues
11. **feat:** Add study-room intro: dark room, desk, warm study lamp, low-poly book, seated camera with idle float
12. **tweak:** Raise default study-room camera height while keeping the book in view
13. **refactor:** Centre the book at the world origin and compose desk, lamp and camera around it
14. **content:** Merge Kurzgesagt "Timeline of Humanity" events; highlight inventions such as fire and tools
15. **fix:** Detail panel now follows Next/Back chapter changes while open
16. **feat:** Add a ground-level 3D timeline with date labels for each checkpoint
17. **feat:** Replace blocky text with three.js TextGeometry extruded 3D text
18. **style:** Metro-map style timeline with circular stations; move date labels below stations
19. **fix:** Transit line rendering issues
20. **style:** Use palette colours instead of red for highlighted stations; shrink date labels 10%
21. **fix:** Move date labels clear of station markers
22. **style:** Reduce date label size
23. **style:** Reduce date label size by a further 22%
24. **style:** Reduce date label size further
25. **fix:** Remove the small jerk at the end of camera transitions
26. **fix:** Align date labels with the curve direction of the timeline
27. **rebrand:** Rename to "Homo Sapiens: A Brief Interactive History of Humankind"; remove author from title
28. **chore:** Remove the "Homo Sapiens" 3D text at the start of the timeline
29. **content:** Add milestones from Kurzgesagt "What Happened Before History? Human Origins", incl. generations
30. **style:** Reduce per-checkpoint event date text by 90%
31. **fix:** Start the timeline at the first humans (2.8M years ago) to match chapter dates
32. **style:** Keep the timeline white; reached stations light their inner disc orange
33. **tweak:** Tilt the desk lamp toward its own stand
34. **tweak:** Reduce the lamp tilt
35. **tweak:** Widen the lamp spotlight cone by 20%
36. **feat:** Add world minimap showing known human settlements for the current period
37. **style:** Move the minimap to the right edge under the menu
38. **feat:** Add sub-checkpoints between chapters for dated events from "Read more"
39. **feat:** Zoom on sub-checkpoint click; add debug panel with camera FOV slider
40. **fix:** Debug panel and zoom wiring issues
41. **fix:** FOV slider applies per scene
42. **fix:** Zoom keeps the clicked station centred in the viewport
43. **fix:** Zoom targets the station on the timeline instead of the 3D model
44. **fix:** Clicking a chapter model zooms to its timeline station
45. **feat:** Move debug panel to top centre; time-scaled checkpoint spacing with a spacing slider (applies on reload)
46. **content:** Add events from Kurzgesagt "12,000 Years of Human Curiosity" with six new icons
47. **feat:** Add event arrow buttons (bottom centre) to step between sub-checkpoints; keyboard , and .
48. **fix:** Event arrows stay clear of the detail panel on narrow screens
49. **fix:** Event arrows no longer overlap Back/Next; stepping forward from a chapter goes straight to the next event
50. **fix:** Stepping back onto a chapter station returns to the chapter overview zoom
51. **fix:** Back/Next stay enabled while focused on a sub-checkpoint
52. **fix:** Remove camera jitter at flight start; single-flight navigation (no detour via next chapter)
53. **refactor:** Split the app into modules: data, core, world, room, camera rig, navigator, input, UI
54. **chore:** Rebuild the Vite project from the modular source; d3 and topojson via npm
55. **fix:** Grey out event arrows at the first and last checkpoint
56. **chore:** Replay history on top of existing repo commits; keep original README intro
