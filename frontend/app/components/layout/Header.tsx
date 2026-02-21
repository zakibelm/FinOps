'use client'

import { Menu, Bell, User } from 'lucide-react'

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Menu size={20} />
        </button>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">CPA Cabinet Dupont</span>
          <span className="mx-2">•</span>
          <span>Plan Pro</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Stats rapides */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Analyses ce mois:</span>
            <span className="font-semibold text-blue-600">245</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Économies:</span>
            <span className="font-semibold text-green-600">-$1,240</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profil */}
        <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={18} />
          </div>
          <span className="hidden md:block text-sm font-medium">Jean Dupont</span>
        </button>
      </div>
    </header>
  )
}
