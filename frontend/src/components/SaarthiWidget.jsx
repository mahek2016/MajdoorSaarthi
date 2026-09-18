import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import styles from './SaarthiWidget.module.css';

const SAARTHI_RESPONSES = {
  en: {
    welcome: "Hello! I am Saarthi. How can I help you today?",
    actions: [
      { id: 'find_job', label: "Find Work" },
      { id: 'hire_worker', label: "Hire a Worker" },
      { id: 'how_works', label: "How does this work?" },
      { id: 'need_help', label: "I need help" },
      { id: 'change_lang', label: "Change Language" }
    ],
    replies: {
      find_job: "You can register as a worker to browse nearby jobs. Click 'Find Work' below to sign up!",
      hire_worker: "You can register as a contractor or company to post job requirements and hire workers. Click 'Hire Workers' below to sign up!",
      how_works: "MajdoorSaarthi connects skilled workers with employers. Click 'See How It Works' on the homepage to view detailed workflows.",
      need_help: "I can guide you! Are you looking for work, or looking to hire?",
      change_lang: "You can change the language using the globe icon in the navigation bar at the top.",
      plumber_ask_area: "Absolutely! In which location are you looking for work?",
      hire_plumber_ask_area: "Sure. Are you a Contractor or Company?",
      fallback: "I am Saarthi, your digital assistant. You can chat with me or select one of the suggested quick actions below."
    }
  },
  hi: {
    welcome: "नमस्ते! मैं सारथी हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
    actions: [
      { id: 'find_job', label: "काम ढूंढें" },
      { id: 'hire_worker', label: "कामगार नियुक्त करें" },
      { id: 'how_works', label: "यह कैसे काम करता है?" },
      { id: 'need_help', label: "मुझे मदद चाहिए" },
      { id: 'change_lang', label: "भाषा बदलें" }
    ],
    replies: {
      find_job: "आप आस-पास के काम देखने के लिए कामगार के रूप में पंजीकरण कर सकते हैं। पंजीकरण के लिए 'काम खोजें' पर क्लिक करें!",
      hire_worker: "आप काम की आवश्यकताएं पोस्ट करने और कामगारों को नियुक्त करने के लिए ठेकेदार या कंपनी के रूप में पंजीकरण कर सकते हैं।",
      how_works: "मजदूरसारथी कुशल कामगारों को नियोक्ताओं से जोड़ता है। विस्तृत कार्यप्रवाह देखने के लिए होमपेज पर 'See How It Works' पर क्लिक करें।",
      need_help: "मैं आपका मार्गदर्शन कर सकता हूँ! क्या आप काम की तलाश में हैं, या कामगार नियुक्त करना चाहते हैं?",
      change_lang: "आप ऊपर नेविगेशन बार में ग्लोब आइकन का उपयोग करके भाषा बदल सकते हैं।",
      plumber_ask_area: "बिल्कुल! आप किस लोकेशन में काम ढूंढ रहे हो?",
      hire_plumber_ask_area: "Sure. आप Contractor हैं या Company?",
      fallback: "मैं सारथी हूँ, आपका डिजिटल सहायक। आप मुझसे चैट कर सकते हैं या नीचे दिए गए सुझावों में से चुन सकते हैं।"
    }
  },
  mr: {
    welcome: "नमस्कार! मी सारथी आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
    actions: [
      { id: 'find_job', label: "काम शोधा" },
      { id: 'hire_worker', label: "कामगार नियुक्त करा" },
      { id: 'how_works', label: "हे कसे काम करते?" },
      { id: 'need_help', label: "मला मदत हवी आहे" },
      { id: 'change_lang', label: "भाषा बदला" }
    ],
    replies: {
      find_job: "तुम्ही जवळचे काम शोधण्यासाठी कामगार म्हणून नोंदणी करू शकता. नोंदणी करण्यासाठी 'काम शोधा' वर क्लिक करा!",
      hire_worker: "तुम्ही कामाची आवश्यकता पोस्ट करण्यासाठी आणि कामगारांना नियुक्त करण्यासाठी ठेकेदार किंवा कंपनी म्हणून नोंदणी करू शकता।",
      how_works: "मजदूरसारथी कुशल कामगारांना नियोक्त्यांशी जोडते. तपशीलवार कार्यप्रवाह पाहण्यासाठी होमपेजवर 'See How It Works' वर क्लिक करा.",
      need_help: "मी तुम्हाला मदत करू शकतो! तुम्ही काम शोधत आहात की कामगार नियुक्त करू इच्छिता?",
      change_lang: "तुम्ही वरच्या नेव्हिगेशन बारमधील ग्लोब आयकॉनचा वापर करून भाषा बदलू शकता.",
      plumber_ask_area: "नक्कीच! तुम्ही कोणत्या ठिकाणी काम शोधत आहात?",
      hire_plumber_ask_area: "Sure. आपण Contractor आहात की Company?",
      fallback: "मी सारथी आहे, तुमचा डिजिटल सहाय्यक. तुम्ही माझ्याशी गप्पा मारू शकता किंवा खालील सूचनांमधून निवडू शकता."
    }
  }
};

export default function SaarthiWidget() {
  const { language } = useLanguage();
  const { role, token } = useAuth();
  const isLoggedIn = !!token && !!role;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [state, setState] = useState({ flow: null, step: 0 });
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const dict = SAARTHI_RESPONSES[language] || SAARTHI_RESPONSES.en;

  // Listen to window events to open from Landing page Meet Saarthi section
  useEffect(() => {
    const handleOpenEvent = (e) => {
      setIsOpen(true);
      if (e.detail?.voice) {
        setTimeout(() => {
          handleVoice();
        }, 300);
      }
    };
    window.addEventListener('saarthi-open', handleOpenEvent);
    return () => window.removeEventListener('saarthi-open', handleOpenEvent);
  }, [language]);

  // Stop listening when closed or unmounted
  useEffect(() => {
    if (!isOpen) {
      stopListening();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Initialize chat messages when the widget is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { sender: 'assistant', text: dict.welcome }
      ]);
    }
  }, [isOpen, language]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleVoice = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "Voice input is not supported in this browser. Please use Chrome or Edge."
      }]);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (text) {
          // Put the recognized text into the message input normally (allow user to edit/send)
          setInput(text);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        let errorMsg = '';
        if (event.error === 'not-allowed') {
          errorMsg = "Microphone permission was denied. Please allow microphone access in your browser.";
        } else if (event.error === 'audio-capture') {
          errorMsg = "No microphone was detected.";
        } else if (event.error === 'network') {
          errorMsg = "Voice recognition needs a network connection.";
        } else if (event.error === 'no-speech') {
          errorMsg = "I couldn't hear anything. Please try again.";
        } else if (event.error === 'aborted') {
          stopListening();
          return;
        } else {
          errorMsg = `Voice recognition error: ${event.error}`;
        }
        
        if (errorMsg) {
          setMessages(prev => [...prev, { sender: 'assistant', text: errorMsg }]);
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  const getContextActions = () => {
    if (!isLoggedIn) {
      return dict.actions;
    }
    
    if (role === 'WORKER') {
      return [
        { id: 'find_jobs', label: language === 'hi' ? 'नौकरियां खोजें' : language === 'mr' ? 'नोकऱ्या शोधा' : 'Find Jobs' },
        { id: 'my_applications', label: language === 'hi' ? 'मेरे आवेदन' : language === 'mr' ? 'माझे अर्ज' : 'My Applications' },
        { id: 'my_profile', label: language === 'hi' ? 'मेरी प्रोफ़ाइल' : language === 'mr' ? 'माझी प्रोफाईल' : 'My Profile' },
        { id: 'help', label: language === 'hi' ? 'मदद' : language === 'mr' ? 'मदत' : 'Help' }
      ];
    } else if (role === 'CONTRACTOR') {
      return [
        { id: 'post_job', label: language === 'hi' ? 'नौकरी पोस्ट करें' : language === 'mr' ? 'नोकरी पोस्ट करा' : 'Post Job' },
        { id: 'find_workers', label: language === 'hi' ? 'कामगार खोजें' : language === 'mr' ? 'कामगार शोधा' : 'Find Workers' },
        { id: 'my_jobs', label: language === 'hi' ? 'मेरी नौकरियां' : language === 'mr' ? 'माझ्या नोकऱ्या' : 'My Jobs' },
        { id: 'help', label: language === 'hi' ? 'मदद' : language === 'mr' ? 'मदत' : 'Help' }
      ];
    } else if (role === 'COMPANY') {
      return [
        { id: 'find_workers_co', label: language === 'hi' ? 'कामगार खोजें' : language === 'mr' ? 'कामगार शोधा' : 'Find Workers' },
        { id: 'workforce_co', label: language === 'hi' ? 'कार्यबल' : language === 'mr' ? 'कार्यबल' : 'Workforce' },
        { id: 'analytics_co', label: language === 'hi' ? 'विश्लेषण' : language === 'mr' ? 'विश्लेषण' : 'Analytics' },
        { id: 'help_co', label: language === 'hi' ? 'मदद' : language === 'mr' ? 'मदत' : 'Help' }
      ];
    }
    return dict.actions;
  };

  const getContextReplies = (actionId) => {
    const repliesMap = {
      // Worker
      find_jobs: {
        text: language === 'hi' ? "आप डैशबोर्ड से सभी नौकरियां देख सकते हैं और आवेदन कर सकते हैं।" : language === 'mr' ? "तुम्ही डॅशबोर्डवरून सर्व नोकऱ्या पाहू शकता आणि अर्ज करू शकता." : "You can browse and apply for all available jobs near you.",
        cta: { label: language === 'hi' ? 'नौकरियां देखें' : language === 'mr' ? 'नोकऱ्या पहा' : 'View Jobs', link: '/worker/jobs' }
      },
      my_applications: {
        text: language === 'hi' ? "अपने सभी आवेदनों की स्थिति यहाँ ट्रैक करें।" : language === 'mr' ? "तुमच्या सर्व अर्जांची स्थिती येथे ट्रॅक करा." : "Track the status of all your applications here.",
        cta: { label: language === 'hi' ? 'आवेदन देखें' : language === 'mr' ? 'अर्ज पहा' : 'My Applications', link: '/worker/applications' }
      },
      my_profile: {
        text: language === 'hi' ? "अपना अनुभव, कौशल और स्थान यहाँ से अपडेट करें।" : language === 'mr' ? "तुमचा अनुभव, कौशल्य आणि स्थान येथून अपडेट करा." : "Update your skills, experience, and profile details here.",
        cta: { label: language === 'hi' ? 'प्रोफ़ाइल' : language === 'mr' ? 'प्रोफाईल' : 'Profile', link: '/worker/profile' }
      },
      help: {
        text: language === 'hi' ? "मैं आपकी सहायता के लिए तैयार हूँ। काम खोजने या अपनी शिफ्ट शुरू करने के लिए चेक-इन बटन का उपयोग करें।" : language === 'mr' ? "मी तुम्हाला मदत करण्यास तयार आहे. काम शोधण्यासाठी किंवा तुमची शिफ्ट सुरू करण्यासाठी चेक-इन बटणाचा वापर करा." : "I am here to guide you. Go to your dashboard to check in for your active shifts, or browse matching jobs."
      },
      // Contractor
      post_job: {
        text: language === 'hi' ? "नए काम के लिए आवश्यकताओं को यहाँ दर्ज करें।" : language === 'mr' ? "नवीन कामासाठी आवश्यकता येथे प्रविष्ट करा." : "Post a new job requirement to hire workers.",
        cta: { label: language === 'hi' ? 'नौकरी पोस्ट करें' : language === 'mr' ? 'नोकरी पोस्ट करा' : 'Post Job', link: '/contractor/post-job' }
      },
      find_workers: {
        text: language === 'hi' ? "आप अपने पास उपलब्ध कामगारों की सूची देख सकते हैं।" : language === 'mr' ? "तुम्ही तुमच्या क्षेत्रातील कामगारांची यादी पाहू शकता." : "Search and filter through the verified worker directory.",
        cta: { label: language === 'hi' ? 'कामगार खोजें' : language === 'mr' ? 'कामगार शोधा' : 'Find Workers', link: '/contractor/workers' }
      },
      my_jobs: {
        text: language === 'hi' ? "अपने पोस्ट किए गए सभी काम यहाँ प्रबंधित करें।" : language === 'mr' ? "तुमच्या पोस्ट केलेल्या सर्व नोकऱ्या येथे व्यवस्थापित करा." : "View and manage all your posted jobs and matches.",
        cta: { label: language === 'hi' ? 'नौकरियां प्रबंधित करें' : language === 'mr' ? 'नोकऱ्या व्यवस्थापित करा' : 'My Jobs', link: '/contractor/jobs' }
      },
      // Company
      find_workers_co: {
        text: language === 'hi' ? "परियोजनाओं के अनुसार कामगारों की संख्या देखें।" : language === 'mr' ? "प्रकल्पानुसार कामगारांची संख्या पहा." : "Check the list of workers allocated to your projects.",
        cta: { label: language === 'hi' ? 'कार्यबल सूची' : language === 'mr' ? 'कार्यबल सूची' : 'Workforce List', link: '/company/workforce' }
      },
      workforce_co: {
        text: language === 'hi' ? "परियोजना और कौशल के अनुसार कार्यबल की स्थिति देखें।" : language === 'mr' ? "प्रकल्प आणि कौशल्य विभागणीनुसार कार्यबल पहा." : "Monitor worker allocations across contractor teams.",
        cta: { label: language === 'hi' ? 'कार्यबल विवरण' : language === 'mr' ? 'कार्यबल तपशील' : 'Workforce Details', link: '/company/workforce' }
      },
      analytics_co: {
        text: language === 'hi' ? "उपस्थिति और कौशल वितरण का लाइव विश्लेषण देखें।" : language === 'mr' ? "उपस्थिती आणि कौशल्य वितरणाचे विश्लेषण पहा." : "Analyze project statistics, check-ins, and present vs absent ratios.",
        cta: { label: language === 'hi' ? 'डैशबोर्ड' : language === 'mr' ? 'डॅशबोर्ड' : 'Dashboard', link: '/company/dashboard' }
      },
      help_co: {
        text: language === 'hi' ? "परियोजनाओं की उपस्थिति और कुशल श्रम विभाजन पर लाइव आंकड़े देखने के लिए डॅशबोर्ड पर जाएं।" : language === 'mr' ? "प्रकल्पांची उपस्थिती आणि कौशल्य विभागणी पाहण्यासाठी डॅशबोर्डला भेट द्या." : "Visit your company dashboard to see overview counts, check contractor ratios, and track project metrics."
      }
    };
    
    return repliesMap[actionId] || { text: dict.replies[actionId] || dict.replies.fallback };
  };

  const handleActionClick = (actionId) => {
    const actions = getContextActions();
    const actionLabel = actions.find(a => a.id === actionId)?.label || actionId;
    
    const newMsgs = [...messages, { sender: 'user', text: actionLabel }];
    setMessages(newMsgs);

    setTimeout(() => {
      let replyObj = getContextReplies(actionId);
      setMessages(prev => [...prev, { sender: 'assistant', text: replyObj.text, cta: replyObj.cta }]);
    }, 500);
  };

  const handleSendMessage = (textToSend = input) => {
    const text = textToSend.trim();
    if (!text) return;

    const newMsgs = [...messages, { sender: 'user', text }];
    setMessages(newMsgs);
    setInput('');

    setTimeout(() => {
      let replyText = '';
      let cta = null;
      let options = null;
      const lower = text.toLowerCase();

      // Rule-based dialogue tree mapping
      if (lower.includes('plumber') && (lower.includes('kaam') || lower.includes('chahiye') || lower.includes('job') || lower.includes('काम') || lower.includes('हवे'))) {
        replyText = dict.replies.plumber_ask_area;
        setState({ flow: 'find_plumber', step: 1 });
      } else if (lower.includes('worker') && (lower.includes('hire') || lower.includes('chahiye') || lower.includes('नियुक्त') || lower.includes('हवे'))) {
        replyText = "Sure. Aap Contractor hain ya Company?";
        options = [
          { label: 'Contractor', text: 'Contractor' },
          { label: 'Company', text: 'Company' }
        ];
        setState({ flow: 'hire_plumber', step: 1 });
      } else if ((state.flow === 'find_plumber' || state.flow === 'hire_plumber') && state.step === 1 && (lower.includes('virar') || lower.includes('विरार'))) {
        if (state.flow === 'find_plumber') {
          replyText = "Virar mein plumber के available jobs check करने के लिए Find Work से continue करें।";
          cta = { label: 'Find Work', link: '/signup?type=find-work' };
        } else {
          replyText = "Great. Click below to register and hire plumbers in Virar:";
          cta = { label: 'Hire Workers', link: '/signup?type=hire-workers' };
        }
        setState({ flow: null, step: 0 });
      } else if (lower.includes('contractor')) {
        replyText = "Great! Register as a Contractor to find and hire workers.";
        cta = { label: 'Hire Workers', link: '/signup?type=hire-workers' };
        setState({ flow: null, step: 0 });
      } else if (lower.includes('company') || lower.includes('कंपनी')) {
        replyText = "Great! Register as a Company to manage projects and track allocations.";
        cta = { label: 'Manage Workforce', link: '/signup?type=hire-workers' };
        setState({ flow: null, step: 0 });
      } else {
        replyText = dict.replies.fallback;
      }

      setMessages(prev => [...prev, { sender: 'assistant', text: replyText, cta, options }]);
    }, 600);
  };

  return (
    <div className={styles.container}>
      {/* Floating Action Button (Always Visible) */}
      <button 
        type="button"
        className={styles.floatBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Saarthi Assistant" : "Open Saarthi Assistant"}
      >
        🤖 Saarthi
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div className={styles.headerBrand}>
              <span className={styles.headerIcon}>🤖</span>
              <span className={styles.headerTitle}>Saarthi</span>
            </div>
            <button 
              type="button" 
              className={styles.closeBtn} 
              onClick={() => setIsOpen(false)}
              aria-label="Close Saarthi Assistant"
            >
              &times;
            </button>
          </div>
          <div className={styles.subtitle}>
            Your digital assistant
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.msg} ${msg.sender === 'user' ? styles.userMsg : styles.assistantMsg}`}>
                <div>{msg.text}</div>
                {msg.cta && (
                  <a href={msg.cta.link} className={styles.ctaBtn}>
                    {msg.cta.label}
                  </a>
                )}
                {msg.options && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {msg.options.map((opt) => (
                      <button
                        type="button"
                        key={opt.label}
                        onClick={() => handleSendMessage(opt.text)}
                        style={{
                          background: 'var(--color-navy)',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Quick Actions */}
          <div className={styles.quickActions}>
            {getContextActions().map(action => (
              <button 
                type="button" 
                key={action.id} 
                className={styles.actionBtn} 
                onClick={() => handleActionClick(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <input
              type="text"
              className={styles.input}
              placeholder={isListening ? "Listening..." : (language === 'hi' ? 'संदेश लिखें...' : language === 'mr' ? 'संदेश लिहा...' : 'Type a message...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              disabled={isListening}
            />
            
            <button 
              type="button" 
              className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`} 
              onClick={handleVoice}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title="Voice Input"
            >
              🎙️
            </button>

            <button 
              type="button"
              className={styles.sendBtn} 
              onClick={() => handleSendMessage()}
              disabled={isListening}
            >
              ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
