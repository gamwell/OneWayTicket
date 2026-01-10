export const eventImages: Record<string, string[]> = {
  tech: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800"

  ],

  musique: [
 "https://images.unsplash.com/photo-1514525253361-bee8718a340b?auto=format&fit=crop&q=80&w=800",
"https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800",
"https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800",
"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800"

  ],

  sport: [
         "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=800",
	   "https://images.unsplash.com/photo-1461896756970-f0939d9f12df?auto=format&fit=crop&q=80&w=800",
        "https//image.unsplash.com/63962-0c623066013b?auto=format&fit=crop&q=80&w=800"
"https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800"
  ],

  theatre: [
  "https://images.unsplash.com/photo-1503095396549-807a8bc36675?auto=format&fit=crop&q=80&w=800",
"https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800",
"https://images.unsplash.com/photo-1516307364728-25b36c5f4002?auto=format&fit=crop&q=80&w=800",
"https://images.unsplash.com/photo-1626125348201-9037190059e8?auto=format&fit=crop&q=80&w=800",
"https://images.unsplash.com/photo-1525923838299-2312b60f6d69?auto=format&fit=crop&q=80&w=800"
  ],

  voyage: [   
"https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=800"
  ],

  default: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"

  ]
};

export function getEventImage(category: string): string {
  const images = eventImages[category] || eventImages.default;
  return images[Math.floor(Math.random() * images.length)];
}
