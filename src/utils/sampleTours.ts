import { IAllTourItems } from "@/entities/tour";
import ICity from "@/entities/city";
import { ITourPlace } from "@/entities/tourPlace";

// Sample tour data to display when API is not working
export const getSampleTours = (): IAllTourItems[] => {
  return [
    {
      id: 1,
      name: "Paris Book Lover Tour",
      description: "A literary journey through Paris visiting famous bookstores, libraries, and literary landmarks. Perfect for book enthusiasts who want to explore the city's rich literary history.",
      average_rating: 4.8,
      tags: ["Cultural", "Books", "Historical"],
      prices: [89, 129, 199],
      city: {
        id: 1,
        name: "Paris",
        country: "France",
        longitude: 2.3522,
        latitude: 48.8566
      } as ICity,
      creator_id: null,
      status_id: 1,
      places: [
        {
          id: 1,
          name: "Shakespeare and Company",
          description: "The legendary English-language bookstore on the Left Bank, frequented by Hemingway, Fitzgerald, and other literary greats.",
          latitude: 48.8534,
          longitude: 2.3448,
          address: "37 Rue de la Bûcherie, 75005 Paris",
          order: 0,
          estimatedTime: 45,
          media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', description: 'Shakespeare and Company bookstore' }
          ]
        },
        {
          id: 2,
          name: "Bibliothèque Mazarine",
          description: "France's oldest public library, housing rare manuscripts and books in a stunning historic setting.",
          latitude: 48.8571,
          longitude: 2.3376,
          address: "23 Quai de Conti, 75006 Paris",
          order: 1,
          estimatedTime: 30,
          media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', description: 'Bibliothèque Mazarine interior' }
          ]
        },
        {
          id: 3,
          name: "Librairie Galignani",
          description: "The oldest English-language bookstore in continental Europe, established in 1801.",
          latitude: 48.8667,
          longitude: 2.3294,
          address: "224 Rue de Rivoli, 75001 Paris",
          order: 2,
          estimatedTime: 30,
          media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800', description: 'Librairie Galignani' }
          ]
        },
        {
          id: 4,
          name: "Café de Flore",
          description: "Historic café where intellectuals like Sartre and de Beauvoir wrote and discussed philosophy.",
          latitude: 48.8542,
          longitude: 2.3322,
          address: "172 Boulevard Saint-Germain, 75006 Paris",
          order: 3,
          estimatedTime: 60,
          media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800', description: 'Café de Flore' }
          ]
        }
      ] as ITourPlace[]
    },
    {
      id: 2,
      name: "Tokyo Food Adventure",
      description: "Discover the vibrant food scene of Tokyo with a local guide. Taste authentic sushi, ramen, and explore hidden izakayas in the bustling streets of Shibuya and Shinjuku.",
      average_rating: 4.9,
      tags: ["Food Tour", "Cultural", "Nightlife"],
      prices: [75, 110, 165],
      city: {
        id: 2,
        name: "Tokyo",
        country: "Japan",
        longitude: 139.6917,
        latitude: 35.6895
      } as ICity,
      creator_id: null,
      status_id: 1,
      places: [
        {
          id: 5,
          name: "Tsukiji Outer Market",
          description: "Explore the famous fish market area with fresh seafood, street food, and traditional Japanese snacks.",
          latitude: 35.6654,
          longitude: 139.7706,
          address: "Tsukiji, Chuo City, Tokyo",
          order: 0,
          estimatedTime: 60,
          media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800', description: 'Tsukiji Market' }
          ]
        },
        {
          id: 6,
          name: "Shibuya Crossing",
          description: "Experience the world's busiest pedestrian crossing, then explore nearby ramen shops.",
          latitude: 35.6598,
          longitude: 139.7006,
          address: "Shibuya City, Tokyo",
          order: 1,
          estimatedTime: 45,
          media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', description: 'Shibuya Crossing' }
          ]
        },
        {
          id: 7,
          name: "Golden Gai",
          description: "Visit the tiny bars and izakayas in this historic nightlife district of Shinjuku.",
          latitude: 35.6938,
          longitude: 139.7034,
          address: "1 Chome Kabukicho, Shinjuku City, Tokyo",
          order: 2,
          estimatedTime: 90,
          media: [
            { type: 'image', url: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800', description: 'Golden Gai bars' }
          ]
        }
      ] as ITourPlace[]
    },
    {
      id: 3,
      name: "Santorini Sunset Experience",
      description: "Witness the most beautiful sunsets in the world from the cliffs of Santorini. Explore white-washed villages, ancient ruins, and enjoy local wine tasting.",
      average_rating: 4.7,
      tags: ["Scenic", "Romantic", "Photography"],
      prices: [95, 145, 220],
      city: {
        id: 3,
        name: "Santorini",
        country: "Greece",
        longitude: 25.4615,
        latitude: 36.3932
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 4,
      name: "New York City Highlights",
      description: "Explore the Big Apple with a comprehensive tour covering Times Square, Central Park, Brooklyn Bridge, and the Statue of Liberty. Perfect for first-time visitors.",
      average_rating: 4.6,
      tags: ["City Tour", "Historical", "Iconic"],
      prices: [79, 119, 179],
      city: {
        id: 4,
        name: "New York",
        country: "USA",
        longitude: -74.0060,
        latitude: 40.7128
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 5,
      name: "Bali Tropical Paradise",
      description: "Immerse yourself in the beauty of Bali with visits to ancient temples, rice terraces, and pristine beaches. Experience traditional Balinese culture and cuisine.",
      average_rating: 4.8,
      tags: ["Beach", "Cultural", "Adventure"],
      prices: [65, 99, 149],
      city: {
        id: 5,
        name: "Bali",
        country: "Indonesia",
        longitude: 115.1889,
        latitude: -8.4095
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 6,
      name: "London Royal Heritage",
      description: "Discover the royal history of London with visits to Buckingham Palace, Tower of London, Westminster Abbey, and the British Museum. Includes afternoon tea experience.",
      average_rating: 4.7,
      tags: ["Historical", "Royal", "Cultural"],
      prices: [85, 125, 189],
      city: {
        id: 6,
        name: "London",
        country: "UK",
        longitude: -0.1278,
        latitude: 51.5074
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 7,
      name: "Rome Ancient Wonders",
      description: "Step back in time to ancient Rome. Explore the Colosseum, Roman Forum, Pantheon, and Vatican City. Experience the rich history and culture of the Eternal City.",
      average_rating: 4.9,
      tags: ["Historical", "Cultural", "Architecture"],
      prices: [95, 135, 210],
      city: {
        id: 7,
        name: "Rome",
        country: "Italy",
        longitude: 12.4964,
        latitude: 41.9028
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 8,
      name: "Dubai Desert Safari",
      description: "Experience the thrill of a desert safari in Dubai. Enjoy dune bashing, camel rides, traditional BBQ dinner, and mesmerizing belly dance performances under the stars.",
      average_rating: 4.6,
      tags: ["Adventure", "Desert", "Cultural"],
      prices: [120, 180, 250],
      city: {
        id: 8,
        name: "Dubai",
        country: "UAE",
        longitude: 55.2708,
        latitude: 25.2048
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 9,
      name: "Barcelona Art & Architecture",
      description: "Discover the artistic wonders of Barcelona. Visit Gaudi's masterpieces including Sagrada Familia and Park Güell, explore the Gothic Quarter, and enjoy tapas tours.",
      average_rating: 4.8,
      tags: ["Art", "Architecture", "Cultural"],
      prices: [88, 128, 195],
      city: {
        id: 9,
        name: "Barcelona",
        country: "Spain",
        longitude: 2.1734,
        latitude: 41.3851
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 10,
      name: "Iceland Northern Lights",
      description: "Chase the aurora borealis in Iceland. Experience geysers, glaciers, black sand beaches, and the magical Northern Lights in this land of fire and ice.",
      average_rating: 4.9,
      tags: ["Nature", "Adventure", "Photography"],
      prices: [150, 220, 320],
      city: {
        id: 10,
        name: "Reykjavik",
        country: "Iceland",
        longitude: -21.8278,
        latitude: 64.1466
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 11,
      name: "Marrakech Souks & Culture",
      description: "Immerse yourself in the vibrant culture of Marrakech. Explore the bustling souks, visit the Bahia Palace, enjoy traditional Moroccan cuisine, and experience a hammam spa.",
      average_rating: 4.7,
      tags: ["Cultural", "Shopping", "Food"],
      prices: [70, 105, 160],
      city: {
        id: 11,
        name: "Marrakech",
        country: "Morocco",
        longitude: -7.9811,
        latitude: 31.6295
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 12,
      name: "Sydney Harbor & Opera House",
      description: "Explore the iconic landmarks of Sydney. Visit the Opera House, climb the Harbor Bridge, relax at Bondi Beach, and enjoy the vibrant food scene.",
      average_rating: 4.8,
      tags: ["Iconic", "Beach", "City Tour"],
      prices: [100, 145, 210],
      city: {
        id: 12,
        name: "Sydney",
        country: "Australia",
        longitude: 151.2093,
        latitude: -33.8688
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 13,
      name: "Amsterdam Canal Cruise",
      description: "Discover Amsterdam from its famous canals. Visit the Anne Frank House, explore the Van Gogh Museum, enjoy Dutch cheese tastings, and experience the vibrant nightlife.",
      average_rating: 4.6,
      tags: ["Cultural", "Historical", "Museums"],
      prices: [82, 118, 175],
      city: {
        id: 13,
        name: "Amsterdam",
        country: "Netherlands",
        longitude: 4.9041,
        latitude: 52.3676
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 14,
      name: "Prague Old Town Magic",
      description: "Step into a fairy tale in Prague. Explore the Old Town Square, Charles Bridge, Prague Castle, and enjoy traditional Czech beer and cuisine in historic pubs.",
      average_rating: 4.7,
      tags: ["Historical", "Architecture", "Cultural"],
      prices: [68, 98, 145],
      city: {
        id: 14,
        name: "Prague",
        country: "Czech Republic",
        longitude: 14.4378,
        latitude: 50.0755
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 15,
      name: "Cairo Pyramids & Sphinx",
      description: "Journey to ancient Egypt. Visit the Great Pyramids of Giza, the Sphinx, explore the Egyptian Museum, and take a Nile River cruise at sunset.",
      average_rating: 4.8,
      tags: ["Historical", "Ancient", "Cultural"],
      prices: [90, 130, 190],
      city: {
        id: 15,
        name: "Cairo",
        country: "Egypt",
        longitude: 31.2357,
        latitude: 30.0444
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 16,
      name: "Lisbon Hills & Trams",
      description: "Explore the charming hills of Lisbon. Ride the historic trams, visit Belém Tower, enjoy pastéis de nata, and experience Fado music in traditional taverns.",
      average_rating: 4.7,
      tags: ["Cultural", "Historical", "Food"],
      prices: [75, 110, 165],
      city: {
        id: 16,
        name: "Lisbon",
        country: "Portugal",
        longitude: -9.1393,
        latitude: 38.7223
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 17,
      name: "Bangkok Street Food Tour",
      description: "Taste the best of Bangkok's street food scene. Explore vibrant markets, visit the Grand Palace, take a boat tour on the Chao Phraya River, and experience Thai massage.",
      average_rating: 4.8,
      tags: ["Food Tour", "Cultural", "Adventure"],
      prices: [55, 85, 130],
      city: {
        id: 17,
        name: "Bangkok",
        country: "Thailand",
        longitude: 100.5018,
        latitude: 13.7563
      } as ICity,
      creator_id: null,
      status_id: 1
    },
    {
      id: 18,
      name: "Vienna Classical Music",
      description: "Experience the musical heritage of Vienna. Attend a classical concert, visit Schönbrunn Palace, explore the historic center, and enjoy Viennese coffee culture.",
      average_rating: 4.7,
      tags: ["Cultural", "Music", "Historical"],
      prices: [92, 135, 200],
      city: {
        id: 18,
        name: "Vienna",
        country: "Austria",
        longitude: 16.3738,
        latitude: 48.2082
      } as ICity,
      creator_id: null,
      status_id: 1
    }
  ];
};
