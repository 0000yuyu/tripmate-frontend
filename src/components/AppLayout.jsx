/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainHeader } from './MainHeader';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#333333] flex flex-col font-sans select-none overflow-x-hidden">
      <MainHeader />
      <div className="flex-1 w-full overflow-x-hidden">
        <main className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-6 sm:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
