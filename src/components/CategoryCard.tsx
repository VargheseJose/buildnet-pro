
import * as React from 'react';
import { Icon, IconName } from './Icon';

interface CategoryCardProps {
  icon: IconName;
  title: string;
  description: string;
  count: number;
  color: string;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title, description, count, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-6 rounded-2xl text-white bg-gradient-to-br ${color} shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-xl flex flex-col`}
    >
      <div className="flex-grow">
        <div className="bg-white/20 rounded-full h-12 w-12 flex items-center justify-center mb-4">
          <Icon name={icon} className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-white/80 mt-1">{description}</p>
      </div>
      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
          {count} provider{count !== 1 ? 's' : ''}
        </span>
        <Icon name="bolt" className="h-5 w-5 text-white/80" />
      </div>
    </div>
  );
};
