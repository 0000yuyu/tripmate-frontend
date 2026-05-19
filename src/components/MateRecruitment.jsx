/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { fetchMatePosts } from '../lib/api';
import { MateCard } from './MateCard';

export const MateRecruitment = ({ onSelectPost }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      const data = await fetchMatePosts();
      setPosts(data);
    };
    loadPosts();
  }, []);

  const handlePostAnnouncement = () => {
    alert("Recruitment posting will be available once you verify your account!");
  };

  return (
    <div className="mt-12 md:mt-20 border-t border-brown-deep/5 pt-10 md:pt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-brown-deep tracking-tight">Travel Mate Posts</h2>
          <p className="text-sm md:text-base text-brown-light font-medium mt-1 italic">"Journey is better together"</p>
        </div>
        <button 
          onClick={handlePostAnnouncement}
          className="w-full md:w-auto px-6 py-3 bg-brown-deep text-white rounded-2xl font-bold text-sm hover:bg-mint transition-colors shadow-lg shadow-brown-deep/20"
        >
          Post Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {posts.map((post) => (
          <MateCard key={post.id} post={post} onSelect={onSelectPost} />
        ))}
      </div>
    </div>
  );
};
