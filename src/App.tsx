/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  UserCheck, 
  Users, 
  Languages, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles,
  RefreshCw,
  History,
  Info
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NEUTRAL = 'NEUTRAL'
}

enum Category {
  BENGALI = 'BENGALI',
  ENGLISH = 'ENGLISH',
  FANTASY = 'FANTASY',
  CORPORATE = 'CORPORATE'
}

interface GeneratedName {
  name: string;
  origin?: string;
  meaning?: string;
}

export default function App() {
  const [gender, setGender] = useState<Gender>(Gender.NEUTRAL);
  const [category, setCategory] = useState<Category>(Category.BENGALI);
  const [currentName, setCurrentName] = useState<GeneratedName | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<GeneratedName[]>([]);
  const [copied, setCopied] = useState(false);

  const generateName = useCallback(async () => {
    setIsLoading(true);
    setCopied(false);
    
    const prompt = `Generate 1 unique and diverse fake name for a person.
    Gender: ${gender}
    Category: ${category}
    The name should be creative and fit the category.
    If Bengali category, provide names in Bengali script.
    Return only a JSON object with 'name', 'origin' (optional), and 'meaning' (in Bengali, optional).`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              origin: { type: Type.STRING },
              meaning: { type: Type.STRING },
            },
            required: ["name"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}') as GeneratedName;
      if (data.name) {
        setCurrentName(data);
        setHistory(prev => [data, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [gender, category]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans p-4 md:p-8 selection:bg-black selection:text-white">
      <header className="max-w-2xl mx-auto mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-gray-200 mb-6 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium uppercase tracking-widest text-gray-500">AI চালিত নাম জেনারেটর</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-5xl md:text-6xl font-bold tracking-tight mb-4"
        >
          নামবন্ধু
        </motion.h1>
        <p className="text-gray-500 text-lg">আপনার প্রোজেক্ট বা কাল্পনিক চরিত্রের জন্য সঠিক নাম খুঁজে নিন</p>
      </header>

      <main className="max-w-xl mx-auto space-y-8">
        {/* Controls Card */}
        <section id="controls" className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="space-y-8">
            {/* Gender Selection */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4 block">লিঙ্গ নির্বাচন</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: Gender.MALE, label: 'পুরুষ', icon: User },
                  { id: Gender.FEMALE, label: 'মহিলা', icon: UserCheck },
                  { id: Gender.NEUTRAL, label: 'উভয়', icon: Users },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGender(item.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                      gender === item.id 
                        ? 'border-black bg-black text-white shadow-lg scale-105' 
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4 block">ক্যাটেগরি</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: Category.BENGALI, label: 'বাংলা নাম' },
                  { id: Category.ENGLISH, label: 'ইংরেজি/পাশ্চাত্য' },
                  { id: Category.FANTASY, label: 'কাল্পনিক/ফ্যান্টাসি' },
                  { id: Category.CORPORATE, label: 'পেশাগত/কর্পোরেট' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCategory(item.id)}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      category === item.id 
                        ? 'bg-gray-100 border-gray-300 text-black' 
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateName}
              disabled={isLoading}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl"
            >
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <RotateCcw className="w-5 h-5" />
                  নতুন নাম তৈরি করুন
                </>
              )}
            </button>
          </div>
        </section>

        {/* Result Area */}
        <AnimatePresence mode="wait">
          {currentName && (
            <motion.section
              key={currentName.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="bg-sky-50 text-sky-600 p-3 rounded-full">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
                  {currentName.name}
                </h2>
                
                {currentName.meaning && (
                  <p className="text-gray-500 italic mb-6 max-w-sm mx-auto">
                    "{currentName.meaning}"
                  </p>
                )}

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => copyToClipboard(currentName.name)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
                  </button>
                </div>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-50/50 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-50/50 rounded-full blur-3xl pointer-events-none" />
            </motion.section>
          )}
        </AnimatePresence>

        {/* History Section */}
        {history.length > 0 && (
          <section className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <History className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest leading-none">সাম্প্রতিক নামসমূহ</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((item, idx) => (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={`${item.name}-${idx}`}
                  onClick={() => {
                    setCurrentName(item);
                    setCopied(false);
                  }}
                  className="bg-white border border-gray-100 px-4 py-2 rounded-full text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-xs">
            <Info className="w-3 h-3" />
            <span>AI দ্বারা তাৎক্ষণিকভাবে তৈরি করা নাম</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

