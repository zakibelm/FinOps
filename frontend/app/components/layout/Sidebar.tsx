'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('chat')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'chat', label: 'Analyse IA', icon: MessageSquare, href: '/' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/documents' },
    { id: 'reports', label: 'Rapports', icon: BarChart3, href: '/reports' },
    { id: 'clients', label: 'Clients', icon: Users, href: '/clients' },
    { id: 'settings', label: 'Paramètres', icon: Settings, href: '/settings' },
  ]

  return (
    <aside
      className={`bg-gray-900 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-lg">
              💰
            </div>
            <span className="font-semibold">FinOps</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-800 rounded transition"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeItem === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 text-gray-400 hover:text-white transition">
          <LogOut size={20} />
          {isOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}
