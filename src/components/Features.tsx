
import { BookOpen, Mail, Brain, Tag, Clock, Award } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <BookOpen className="w-10 h-10 text-newsprint-red mb-4" />,
      title: "Curated Research",
      description: "Access to the latest papers from top-tier academic journals and conferences across all disciplines."
    },
    {
      icon: <Mail className="w-10 h-10 text-newsprint-red mb-4" />,
      title: "Daily Delivery",
      description: "Fresh research delivered to your inbox every morning, ready for your coffee-time reading."
    },
    {
      icon: <Brain className="w-10 h-10 text-newsprint-red mb-4" />,
      title: "AI-Powered Matching",
      description: "Our algorithms learn your preferences over time, improving recommendations with each paper you read."
    },
    {
      icon: <Tag className="w-10 h-10 text-newsprint-red mb-4" />,
      title: "Career-Focused",
      description: "Papers selected based on your career path and goals, not just general interest topics."
    },
    {
      icon: <Clock className="w-10 h-10 text-newsprint-red mb-4" />,
      title: "Time-Saving",
      description: "No more hours wasted searching through databases. We find the needle in the haystack for you."
    },
    {
      icon: <Award className="w-10 h-10 text-newsprint-red mb-4" />,
      title: "Expert Summaries",
      description: "Each paper comes with a concise, accessible summary to help you quickly grasp key findings."
    }
  ];

  return (
    <section id="features" className="py-20 bg-paper">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="newspaper-headline">Stay at the Forefront of Your Field</h2>
          <p className="text-xl text-newsprint-light">Paperboy delivers the research that matters to your inbox, so you can focus on what you do best.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-paper-aged p-6 rounded-sm border border-newsprint/10 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                {feature.icon}
                <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
                <p className="text-newsprint-light">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
