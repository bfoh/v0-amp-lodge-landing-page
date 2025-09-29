export interface GalleryImage {
  id: string
  name: string
  alt: string
  category: "room" | "amenity" | "exterior" | "dining"
  src: string
}

export const galleryImages: GalleryImage[] = [
  {
    id: "outdoor-gazebo",
    name: "outdoor-gazebo",
    alt: "Outdoor gazebo with stone pillars and tropical landscaping",
    category: "amenity",
    src: "/amp-lodge-outdoor-gazebo.png",
  },
  {
    id: "room-mint-green",
    name: "room-mint-green",
    alt: "Hotel room with mint green walls and modern amenities",
    category: "room",
    src: "/amp-lodge-room-mint-green.png",
  },
  {
    id: "room-geometric-bedding",
    name: "room-geometric-bedding",
    alt: "Comfortable room with geometric patterned bedding",
    category: "room",
    src: "/amp-lodge-room-geometric-bedding.png",
  },
  {
    id: "room-orange-walls",
    name: "room-orange-walls",
    alt: "Hotel room with warm orange walls and modern furnishings",
    category: "room",
    src: "/amp-lodge-room-orange-walls.png",
  },
  {
    id: "main-building",
    name: "main-building",
    alt: "AMP Lodge main building exterior",
    category: "exterior",
    src: "/amp-lodge-main-building.png",
  },
  {
    id: "standard-room",
    name: "standard-room",
    alt: "Standard room with comfortable bedding",
    category: "room",
    src: "/amp-lodge-standard-room.png",
  },
  {
    id: "deluxe-room",
    name: "deluxe-room",
    alt: "Deluxe room with modern amenities",
    category: "room",
    src: "/amp-lodge-deluxe-room.png",
  },
  {
    id: "executive-suite",
    name: "executive-suite",
    alt: "Executive suite with separate living area",
    category: "room",
    src: "/amp-lodge-executive-suite.png",
  },
  {
    id: "staircase",
    name: "staircase",
    alt: "Hotel staircase with elegant railings and yellow walls",
    category: "amenity",
    src: "/amp-lodge-staircase.png",
  },
  {
    id: "lounge",
    name: "lounge",
    alt: "Luxurious lounge area with red leather chairs and marble flooring",
    category: "amenity",
    src: "/amp-lodge-lounge.png",
  },
  {
    id: "lobby-reception",
    name: "lobby-reception",
    alt: "Hotel lobby and reception area with modern design and warm lighting",
    category: "amenity",
    src: "/amp-lodge-lobby-reception.png",
  },
  {
    id: "hotel-corridor",
    name: "hotel-corridor",
    alt: "Hotel corridor with African-inspired artwork and decorative elements",
    category: "amenity",
    src: "/amp-lodge-hotel-corridor.png",
  },
  {
    id: "exterior-night",
    name: "exterior-night",
    alt: "AMP Lodge exterior at night with illuminated signage and flags",
    category: "exterior",
    src: "/amp-lodge-exterior-night.png",
  },
  {
    id: "restaurant-dining",
    name: "restaurant-dining",
    alt: "Hotel restaurant dining area with red chairs and elegant decor",
    category: "dining",
    src: "/amp-lodge-restaurant-dining.png",
  },
  {
    id: "security-monitoring",
    name: "security-monitoring",
    alt: "Security monitoring room with multiple CCTV camera feeds",
    category: "amenity",
    src: "/amp-lodge-security-monitoring.png",
  },
  {
    id: "bathroom-modern",
    name: "bathroom-modern",
    alt: "Modern bathroom with marble tiles and glass shower enclosure",
    category: "room",
    src: "/amp-lodge-bathroom-modern.png",
  },
]
