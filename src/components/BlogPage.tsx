import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface BlogPageProps {
  onBack: () => void;
  onBlogClick?: (blogId: string) => void;
}

const blogPosts = [
  {
    id: '1',
    title: 'उर्दू को हिंदी स्क्रिप्ट में कैसे लिखें और पढ़ें',
    excerpt:
      'अगर आपको पता चलता है कि आप कभी शाइर नहीं हो सकते तो क्या मानव जाति का आगे बढ़कर कर रहे हैं, हराम की ज़िन्दगी की तलब क्यों है आपको। जाइए कुछ और रोज़गार देखिए।',
    author: {
      name: 'Vibhat Kumar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    date: 'August 9, 2022',
    gradient: 'from-rose-300 via-orange-200 to-green-300',
    decorativeText: 'उर्दू शायरी',
  },
  {
    id: '2',
    title: 'Ghazal Writing: A Beginner\'s Guide',
    excerpt:
      'Learn the art of writing ghazals, understanding the structure, meter, and traditional themes that make this form timeless.',
    author: {
      name: 'Ayesha Rahman',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    date: 'February 18, 2023',
    gradient: 'from-purple-300 via-pink-200 to-amber-200',
    decorativeText: 'Poetry Guide',
  },
  {
    id: '3',
    title: 'The Power of Metaphor in Urdu Poetry',
    excerpt:
      'Explore how metaphors and imagery create emotional depth in Urdu poetry and connect with readers on a deeper level.',
    author: {
      name: 'Faraz Ahmed',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    date: 'March 15, 2023',
    gradient: 'from-blue-300 via-cyan-200 to-emerald-200',
    decorativeText: 'شاعری',
  },
  {
    id: '4',
    title: 'Modern Nazm: Breaking Traditional Boundaries',
    excerpt:
      'How contemporary poets are reimagining the nazm form while respecting its classical roots.',
    author: {
      name: 'Zara Malik',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    date: 'April 22, 2023',
    gradient: 'from-indigo-300 via-purple-200 to-pink-200',
    decorativeText: 'Modern Poetry',
  },
  {
    id: '5',
    title: 'Mushaira Etiquette: A Complete Guide',
    excerpt:
      'Everything you need to know about attending and participating in a mushaira, from traditional customs to modern practices.',
    author: {
      name: 'Ibrahim Hassan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    date: 'May 10, 2023',
    gradient: 'from-amber-300 via-rose-200 to-purple-200',
    decorativeText: 'مشاعرہ',
  },
  {
    id: '6',
    title: 'Poetry as Therapy: Healing Through Words',
    excerpt:
      'Discover how writing and reading poetry can be a powerful tool for emotional healing and self-expression.',
    author: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    },
    date: 'June 5, 2023',
    gradient: 'from-green-300 via-teal-200 to-blue-200',
    decorativeText: 'Healing',
  },
];

export function BlogPage({ onBack, onBlogClick }: BlogPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-12">
          <div className="inline-block mb-2">
            <span className="text-gray-500">Blogs &gt; </span>
            <span className="text-gray-900">शायरी सीखें</span>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="space-y-12">
          {blogPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => onBlogClick?.(post.id)}
              className="w-full text-left group"
            >
              {/* Author & Date */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10 ring-2 ring-white">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-gray-900">{post.author.name}</p>
                </div>
                <p className="text-gray-500 text-sm">{post.date}</p>
              </div>

              {/* Blog Header Image */}
              <div
                className={`relative bg-gradient-to-br ${post.gradient} rounded-2xl overflow-hidden mb-6 h-80 flex items-center justify-center group-hover:shadow-2xl transition-all`}
              >
                {/* Decorative Text - Urdu/Hindi Characters */}
                <div className="absolute right-8 top-8 opacity-20 text-right">
                  <div className="text-7xl space-y-3" style={{ fontFamily: 'serif', lineHeight: '1.2' }}>
                    {post.decorativeText.split(' ').map((word, i) => (
                      <div key={i} className="text-gray-900">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Title on Image */}
                <div className="relative z-10 text-center px-12 max-w-3xl">
                  {post.id === '1' && (
                    <>
                      <p className="text-xl text-gray-800 mb-4">
                        उर्दू को हिंदी स्क्रिप्ट में कैसे
                      </p>
                      <h2 className="text-5xl text-gray-900 group-hover:scale-105 transition-transform">
                        लिखें और पढ़ें?
                      </h2>
                    </>
                  )}
                  {post.id !== '1' && (
                    <h2 className="text-4xl text-gray-900 group-hover:scale-105 transition-transform">
                      {post.title}
                    </h2>
                  )}
                </div>
              </div>

              {/* Blog Title & Excerpt */}
              <h3 className="text-2xl text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>

              {/* Divider */}
              <div className="mt-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </button>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            Load more articles
          </Button>
        </div>
      </div>
    </div>
  );
}
