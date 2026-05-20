// ═══════════════════════════════════════════════════════════════
// seed_feed_posts.js - Seed football posts for demo feed
// Run: node seed_feed_posts.js
// ═══════════════════════════════════════════════════════════════

const supabase = require('../db/supabase');

const FOOTBALL_POSTS = [
  {
    content: "⚽ What a match last night! The atmosphere was absolutely electric. Nothing beats the feeling of being in a packed stadium when your team scores in the last minute. Football is more than a game - it's a way of life! 🏟️🔥",
    image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80"
  },
  {
    content: "Training day vibes 💪 Hard work on the pitch pays off. Every great goal starts with hours of practice nobody sees. Keep grinding! #FootballLife #Training",
    image_url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80"
  },
  {
    content: "The beautiful game at sunset 🌅⚽ There's something magical about football under golden skies. Who else loves evening kickabouts with friends?",
    image_url: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80"
  },
  {
    content: "Match day! 🏆 The energy in the stands is unreal. Fan tokens are changing how we connect with our favorite clubs. The future of football fandom is here! 🎉\n\n#Paiecash #FanTokens #MatchDay",
    image_url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80"
  },
  {
    content: "Street football is where legends are born 🌟 No fancy pitches, no expensive boots - just raw talent and passion. Some of the greatest players started on streets just like this.",
    image_url: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80"
  },
  {
    content: "Champions League nights hit different 🌙✨ The anthem, the atmosphere, the stakes - there's nothing quite like European football under the floodlights. Which team are you backing this season?",
    image_url: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80"
  },
  {
    content: "The roar of 80,000 fans. The passion. The drama. Football stadiums are cathedrals of emotion. Every weekend, millions gather to witness the beautiful game unfold. What's your favorite stadium? 🏟️",
    image_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80"
  },
  {
    content: "Youth football - where dreams begin ⭐ Supporting grassroots football means investing in the future of the sport. Every professional was once a kid with a dream and a ball at their feet.",
    image_url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80"
  },
  {
    content: "Football brings people together like nothing else 🤝🌍 Different languages, different cultures, one universal love. That's the power of the beautiful game.\n\nJoin our community and connect with fans worldwide through PCC!",
    image_url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80"
  },
  {
    content: "Game analysis time 📊 Breaking down tactics and formations is half the fun of modern football. The way teams press, transition, and create chances - it's like chess on grass! Who else geeks out on football tactics?",
    image_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80"
  },
  {
    content: "Nothing beats a perfectly struck free kick curling into the top corner 🎯 The technique, the power, the precision - that's art in motion! Drop your favorite free kick taker below 👇",
    image_url: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80"
  },
  {
    content: "Derby day! 🔴🔵 The rivalry, the banter, the bragging rights - local derbies are what make football special. The city stops, and for 90 minutes, nothing else matters. What's the biggest derby in your country?",
    image_url: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80"
  },
  {
    content: "New boots, who dis? 👟⚡ There's no better feeling than lacing up a fresh pair of boots and stepping onto the pitch. What's your go-to brand - Nike, Adidas, or Puma?",
    image_url: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80"
  },
  {
    content: "The World Cup is the greatest show on earth 🌎🏆 Every four years, the whole planet unites around football. Which country will lift the trophy next? Share your predictions!",
    image_url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80"
  },
  {
    content: "Early morning training session ☀️ Champions are made when no one is watching. Woke up at 5 AM to get these reps in. The grind never stops! 💯\n\n#Motivation #FootballTraining #NeverGiveUp",
    image_url: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80"
  }
];

async function seed() {
  // Get existing users to distribute posts among them
  const { data: profiles, error: profilesError } = await supabase
    .from('chat_profiles')
    .select('user_id, username')
    .limit(10);

  if (profilesError || !profiles || profiles.length === 0) {
    console.error('❌ No users found in chat_profiles. Create some users first.');
    process.exit(1);
  }

  console.log(`\n👥 Found ${profiles.length} users: ${profiles.map(p => p.username).join(', ')}\n`);
  console.log(`📝 Seeding ${FOOTBALL_POSTS.length} football posts...\n`);

  let success = 0;
  for (let i = 0; i < FOOTBALL_POSTS.length; i++) {
    const post = FOOTBALL_POSTS[i];
    const user = profiles[i % profiles.length]; // Round-robin across users

    // Stagger created_at so posts appear in order (newest first)
    const minutesAgo = (FOOTBALL_POSTS.length - i) * 15; // 15 min apart
    const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.user_id,
        content: post.content,
        image_url: post.image_url,
        created_at: createdAt,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Post ${i + 1}: ${error.message}`);
    } else {
      console.log(`  ✅ Post ${i + 1} by ${user.username}: "${post.content.substring(0, 50)}..."`);
      success++;
    }
  }

  console.log(`\n🎉 Done! ${success}/${FOOTBALL_POSTS.length} posts seeded successfully.\n`);
  process.exit(0);
}

seed();
