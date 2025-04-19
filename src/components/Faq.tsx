import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggle: () => void;
}
const FaqItem = ({
  question,
  answer,
  isOpen,
  toggle
}: FaqItemProps) => {
  return <div className="border-b border-newsprint/10 last:border-0">
      <button onClick={toggle} className="flex justify-between items-center w-full py-5 text-left font-display font-semibold focus:outline-none my-0 mx-0 px-[20px]">
        <span>{question}</span>
        <span>{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
        <p className="text-newsprint-light px-[20px] py-0">{answer}</p>
      </div>
    </div>;
};
const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [{
    question: "How does Paperboy select papers for me?",
    answer: "Paperboy uses a combination of AI and machine learning to analyze your research interests, career goals, and reading patterns. We match these with papers from top academic journals and conferences to find the most relevant content for you personally."
  }, {
    question: "Can I customize the types of papers I receive?",
    answer: "Yes! During onboarding, you'll create a detailed research profile specifying your field, subfields of interest, preferred journals, and even specific authors you follow. You can update these preferences anytime."
  }, {
    question: "How many papers will I receive each day?",
    answer: "By default, we send 3-5 highly relevant papers daily. You can adjust this number in your settings based on your reading capacity and interests."
  }, {
    question: "Do I get full access to the papers?",
    answer: "Yes, Paperboy includes full-text access to all papers we recommend. We partner with publishers and use institutional access methods to provide complete papers, not just abstracts."
  }, {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. You can cancel your subscription at any time with no questions asked. We'll continue your access until the end of your current billing period."
  }, {
    question: "Is there a mobile app?",
    answer: "We offer a responsive web interface that works beautifully on mobile devices. A dedicated iOS and Android app is currently in development and will be released soon."
  }];
  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return <section id="faq" className="py-20 bg-paper">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center newspaper-headline mb-12">Frequently Asked Questions</h2>
          
          <div className="bg-paper-aged border border-newsprint/10 rounded-sm shadow-md">
            {faqs.map((faq, index) => <FaqItem key={index} question={faq.question} answer={faq.answer} isOpen={openIndex === index} toggle={() => toggleFaq(index)} />)}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg">Still have questions?</p>
            <a href="mailto:help@paperboy.com" className="text-newsprint-red font-medium">
              Contact our support team
            </a>
          </div>
        </div>
      </div>
    </section>;
};
export default Faq;