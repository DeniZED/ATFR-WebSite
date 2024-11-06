import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}

export default function FeatureCard({ icon: Icon, title, description, delay }: FeatureCardProps) {
  return (
    <div 
      className="bg-gray-800 p-6 rounded-lg transform transition-all duration-300 hover:scale-105"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Icon className="h-8 w-8 text-red-500 mb-4" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}