import thumbnails from '../assets/thumbnailMap.mjs';

export function getFeaturedVideo() {
  return {
    title: "Understanding GFET Design",
    description: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.",
    youtubeId: "bTqVqk7FSmY" // Replace with your actual featured video ID
  };
}

export function getLatestVideos() {
  return [
    {
      title: "GFET Layout Optimization",
      thumbnail: thumbnails['layout-opt'],
      youtubeId: "bTqVqk7FSmY",
      duration: "12:34",
      date: "2025-07-20",
    },
    {
      title: "Compact Model Extraction",
      thumbnail: thumbnails['compact-model'],
      youtubeId: "bTqVqk7FSmY",
      duration: "9:02",
      date: "2025-07-18",
    },
    {
      title: "AI-assisted Circuit Design",
      thumbnail: thumbnails['ai-circuit'],
      youtubeId: "bTqVqk7FSmY",
      duration: "14:58",
      date: "2025-07-15",
    },
    {
      title: "Charge Pump Simulation",
      thumbnail: thumbnails['charge-pump'],
      youtubeId: "bTqVqk7FSmY",
      duration: "11:21",
      date: "2025-07-14",
    },
    {
      title: "Intro to Metasurface Design",
      thumbnail:thumbnails['metasurface'],
      youtubeId: "bTqVqk7FSmY",
      duration: "13:45",
      date: "2025-07-13",
    },
    {
      title: "Rectenna Matching Networks",
      thumbnail: thumbnails['rectenna'],
      youtubeId: "bTqVqk7FSmY",
      duration: "10:50",
      date: "2025-07-11",
    },
    {
      title: "ML for GFET Optimization",
      thumbnail: thumbnails['ml-optimization'],
      youtubeId: "bTqVqk7FSmY",
      duration: "15:12",
      date: "2025-07-09",
    },
    {
      title: "DRC and LVS Basics",
      thumbnail: thumbnails['drc-lvs'],
      youtubeId: "bTqVqk7FSmY",
      duration: "8:59",
      date: "2025-07-07",
    },
    {
      title: "GFET Layout from Scratch",
      thumbnail: thumbnails['layout-from-scratch'],
      youtubeId: "bTqVqk7FSmY",
      duration: "16:04",
      date: "2025-07-05",
    },
    {
      title: "Capacitor Modeling Deep Dive",
      thumbnail: thumbnails['capacitor-model'],
      youtubeId: "bTqVqk7FSmY",
      duration: "10:30",
      date: "2025-07-03",
    },
    {
      title: "Energy Scavenging Circuits",
      thumbnail: thumbnails['energy-scavenging'],
      youtubeId: "bTqVqk7FSmY",
      duration: "14:11",
      date: "2025-07-01",
    },
    {
      title: "Graphene Bandgap Engineering",
      thumbnail: thumbnails['graphene-bandgap'],
      youtubeId: "bTqVqk7FSmY",
      duration: "9:47",
      date: "2025-06-28",
    },
  ];
}
