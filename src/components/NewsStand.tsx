
import { useState } from 'react';
import { Calendar, Clock, Bookmark, Book, Search } from 'lucide-react';

const NewsStand = () => {
  const [activePublication, setActivePublication] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const publications = [
    {
      title: "Machine Learning Advances",
      excerpt: "New neural network architectures outperform traditional models in complex prediction tasks.",
      date: "Today",
      category: "AI & Machine Learning",
      image: "ml-paper"
    },
    {
      title: "Sustainable Material Science",
      excerpt: "Biodegradable polymers show promise for reducing plastic waste in oceans.",
      date: "Yesterday",
      category: "Materials Science",
      image: "materials-paper"
    },
    {
      title: "Quantum Computing Breakthrough",
      excerpt: "Researchers achieve error correction milestone, bringing practical quantum computing closer.",
      date: "2 days ago",
      category: "Quantum Physics",
      image: "quantum-paper"
    }
  ];

  const handlePaperClick = (index: number) => {
    setActivePublication(index);
  };

  return (
    <section id="how-it-works" className="py-20 bg-paper-dark overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-center mb-16 newspaper-headline">Your Personal Research Newsstand</h2>
        
        <div className="newspaper-stand max-w-5xl mx-auto rounded-xl p-6 md:p-10 relative">
          {/* Display stand top */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-amber-700 rounded-t-xl"></div>
          
          {/* Publications rack */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 pt-6 items-stretch">
            {publications.map((pub, index) => (
              <div 
                key={index}
                className={`relative newspaper-issue cursor-pointer transition-all duration-300 transform
                  ${index === activePublication ? 'md:-translate-y-4 shadow-lg z-10 scale-[1.02]' : 'hover:-translate-y-2'}
                  ${index === 0 ? 'rotate-1' : index === 2 ? '-rotate-1' : ''}`}
                onClick={() => handlePaperClick(index)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="newspaper-fold left-[20%]"></div>
                <div className="newspaper-fold right-[20%]"></div>
                
                <div className="border-b border-newsprint/10 mb-3 flex justify-between items-center">
                  <div className="font-mono text-xs text-newsprint/60">{pub.date}</div>
                  <div className="font-mono text-xs text-newsprint-red">{pub.category}</div>
                </div>
                
                <h3 className="font-display text-lg font-bold mb-2 leading-tight">{pub.title}</h3>
                <p className="text-sm text-newsprint-light">{pub.excerpt}</p>
                
                {index === activePublication && (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-newsprint-red rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md animate-pulse">
                    <Bookmark size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Stand base with controls */}
          <div className="bg-amber-900 -mx-6 md:-mx-10 -mb-10 mt-4 p-4 rounded-b-xl shadow-inner flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-amber-950 p-2 rounded-full">
                <Calendar size={20} className="text-amber-300" />
              </div>
              <div className="bg-amber-950 p-2 rounded-full">
                <Book size={20} className="text-amber-300" />
              </div>
              <div className="bg-amber-950 p-2 rounded-full">
                <Search size={20} className="text-amber-300" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-amber-300" />
              <span className="text-amber-300 text-sm">Updated daily</span>
            </div>
          </div>
        </div>
        
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h3 className="font-display text-2xl mb-4">How It Works</h3>
          <ol className="text-left space-y-6">
            <li className="flex gap-4 items-start">
              <span className="bg-newsprint-red text-white font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0">1</span>
              <div>
                <h4 className="font-bold text-lg mb-1">Sign up and create your research profile</h4>
                <p className="text-newsprint-light">Tell us about your field, interests, and professional goals.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <span className="bg-newsprint-red text-white font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0">2</span>
              <div>
                <h4 className="font-bold text-lg mb-1">Our AI scans thousands of academic publications</h4>
                <p className="text-newsprint-light">We analyze the latest research papers across reputable journals and conferences.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <span className="bg-newsprint-red text-white font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0">3</span>
              <div>
                <h4 className="font-bold text-lg mb-1">Receive personalized research digests</h4>
                <p className="text-newsprint-light">Every morning, get a curated selection of the most relevant papers delivered to your inbox.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default NewsStand;
