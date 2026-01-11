// Mapping des catégories vers des images Unsplash
const EVENT_IMAGES: Record<string, string[]> = {
  tech: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800"
  ],
  musique: [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800"
  ],
  sport: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800"
  ],
  theatre: [
    "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=800"
  ],
  voyage: [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800"
  ],
  exposition: [
    "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&q=80&w=800"
  ],
  festival: [
    "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800"
  ],
  conference: [
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800"
  ],
  itech: [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800"
  ],
  autre: [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800"
  ],
  default: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"
  ]
};

export function getEventImage(category: string): string {
  if (!category) return EVENT_IMAGES.default[0];

  let cleanCategory = category.toLowerCase().trim();
  
  // Suppression des accents
  cleanCategory = cleanCategory.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let images = EVENT_IMAGES[cleanCategory];

  if (!images) {
    const key = Object.keys(EVENT_IMAGES).find(k => cleanCategory.includes(k));
    images = key ? EVENT_IMAGES[key] : EVENT_IMAGES.default;
  }

  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}