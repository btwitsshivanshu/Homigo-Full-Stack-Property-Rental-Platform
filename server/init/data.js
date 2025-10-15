const simplifiedListings = [
  {
    title: "Cozy Beachfront Cottage",
    description: "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
    price: 1500,
    location: "Malibu",
    country: "United States",
    image: {
      url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1552733407-5d5c46c3bb3b"
    }
  },
  {
    title: "Modern Loft in Downtown",
    description: "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
    price: 1200,
    location: "New York City",
    country: "United States",
    image: {
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1501785888041-af3ef285b470"
    }
  },
  {
    title: "Mountain Retreat",
    description: "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
    price: 1000,
    location: "Aspen",
    country: "United States",
    image: {
      url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60",
      filename: "photo-1504384308090-c894fdcc538d"
    }

  },
  {
    title: "Historic Villa in Tuscany",
    description: "Experience the charm of Tuscany in this beautifully restored villa. Explore the rolling hills and vineyards.",
    price: 2500,
    location: "Florence",
    country: "Italy",
    image: {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1566073771259-6a8506099945"
    }
  },
  {
    title: "Secluded Treehouse Getaway",
    description: "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
    price: 800,
    location: "Portland",
    country: "United States",
    image: {
      url: "https://images.unsplash.com/photo-1505842465776-3d90f6163108?auto=format&fit=crop&w=800&q=60",
      filename: "photo-1505842465776-3d90f6163108"
    }

  },
  {
    title: "Beachfront Paradise",
    description: "Step out of your door onto the sandy beach. This beachfront condo offers the ultimate relaxation.",
    price: 2000,
    location: "Cancun",
    country: "Mexico",
    image: {
      url: "https://images.unsplash.com/photo-1582719478145-bb4c1d0d3281?auto=format&fit=crop&w=800&q=60",
      filename: "photo-1582719478145-bb4c1d0d3281"
    }

  },
  {
    title: "Rustic Cabin by the Lake",
    description: "Spend your days fishing and kayaking on the serene lake. This cozy cabin is perfect for outdoor enthusiasts.",
    price: 900,
    location: "Lake Tahoe",
    country: "United States",
    image: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1464822759023-fed622ff2c3b"
    }
  },
  {
    title: "Luxury Penthouse with City Views",
    description: "Indulge in luxury living with panoramic city views from this stunning penthouse apartment.",
    price: 3500,
    location: "Los Angeles",
    country: "United States",
    image: {
      url: "https://images.unsplash.com/photo-1586105251261-72a756497a12?auto=format&fit=crop&w=800&q=60",
      filename: "photo-1586105251261-72a756497a12"
    }

  },
  {
    title: "Ski-In/Ski-Out Chalet",
    description: "Hit the slopes right from your doorstep in this ski-in/ski-out chalet in the Swiss Alps.",
    price: 3000,
    location: "Verbier",
    country: "Switzerland",
    image: {
      url: "https://images.unsplash.com/photo-1608889175189-e458baf37bc9?auto=format&fit=crop&w=800&q=60",
      filename: "photo-1608889175189-e458baf37bc9"
    }

  },
  {
    title: "Safari Lodge in the Serengeti",
    description: "Experience the thrill of the wild in a comfortable safari lodge. Witness the Great Migration up close.",
    price: 4000,
    location: "Serengeti National Park",
    country: "Tanzania",
    image: {
      url: "https://images.unsplash.com/photo-1559583984-6c9a4f6e2b92?auto=format&fit=crop&w=800&q=60",
      filename: "photo-1559583984-6c9a4f6e2b92"
    }

  },
  {
    title: "Charming Canal House",
    description: "Stay in this picturesque canal house in the heart of Amsterdam. Perfect for romantic getaways and sightseeing.",
    price: 1800,
    location: "Amsterdam",
    country: "Netherlands",
    image: {
      url: "https://images.unsplash.com/photo-1582482017409-bb3af9b4fe7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1582482017409-bb3af9b4fe7b"
    }
  },
  {
    title: "Desert Dome Retreat",
    description: "Reconnect with nature in this eco-friendly dome set in the middle of the Mojave Desert. Stargazing like never before.",
    price: 1100,
    location: "Joshua Tree",
    country: "United States",
    image: {
      url: "https://images.unsplash.com/photo-1606788075765-1b556cd7d39c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1606788075765-1b556cd7d39c"
    }
  },
  {
    title: "Floating Bungalow",
    description: "Relax in this floating bungalow above crystal-clear waters in a tropical paradise. Pure bliss awaits.",
    price: 3200,
    location: "Bora Bora",
    country: "French Polynesia",
    image: {
      url: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1546483875-ad9014c88eba"
    }
  },
  {
    title: "Icelandic Aurora Cabin",
    description: "Watch the Northern Lights dance across the sky from your cozy glass-roofed cabin in Iceland.",
    price: 2700,
    location: "Reykjavik",
    country: "Iceland",
    image: {
      url: "https://images.unsplash.com/photo-1578252097874-f5d4be6fa6d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1578252097874-f5d4be6fa6d0"
    }
  },
  {
    title: "Traditional Ryokan Inn",
    description: "Immerse yourself in Japanese culture with this authentic ryokan experience. Tatami mats, hot springs, and tranquility.",
    price: 1900,
    location: "Kyoto",
    country: "Japan",
    image: {
      url: "https://images.unsplash.com/photo-1600490043043-6c447d00d5e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1600490043043-6c447d00d5e6"
    }
  },
  {
    title: "Jungle Eco Lodge",
    description: "Stay deep in the rainforest with all the comforts of modern living. A must for adventurous spirits.",
    price: 1000,
    location: "Costa Rica",
    country: "Costa Rica",
    image: {
      url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1580587771525-78b9dba3b914"
    }
  },
  {
    title: "Mediterranean Cliffside Villa",
    description: "Bask in the sun and enjoy panoramic sea views from this luxurious villa perched on the cliffs.",
    price: 2900,
    location: "Santorini",
    country: "Greece",
    image: {
      url: "https://images.unsplash.com/photo-1604579763957-77c8ad61f7ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1604579763957-77c8ad61f7ec"
    }
  },
  {
    title: "Classic English Countryside Cottage",
    description: "Slow down and enjoy tea time in this cozy cottage surrounded by rolling hills and flower gardens.",
    price: 1300,
    location: "Cotswolds",
    country: "United Kingdom",
    image: {
      url: "https://images.unsplash.com/photo-1561489426-4d5d5a6a0de3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1561489426-4d5d5a6a0de3"
    }
  },
  {
    title: "Urban Studio with Skyline Views",
    description: "Perfect for business or pleasure, this studio offers sleek design and unbeatable views of the skyline.",
    price: 1600,
    location: "Toronto",
    country: "Canada",
    image: {
      url: "https://images.unsplash.com/photo-1593958004083-93f97b430597?auto=format&fit=crop&w=800&q=60",
      filename: "photo-1593958004083-93f97b430597"
    }

  },
  {
    title: "Tropical Garden Bungalow",
    description: "Relax in a private garden oasis just steps from the beach. Lush greenery and peaceful vibes.",
    price: 1400,
    location: "Bali",
    country: "Indonesia",
    image: {
      url: "https://images.unsplash.com/photo-1585129734095-e4e0765fbd3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      filename: "photo-1585129734095-e4e0765fbd3b"
    }
  }
  
];

module.exports = { data: simplifiedListings };
