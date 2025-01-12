'use client'

import * as React from 'react'

const tabs = [
    { id: 'posts', label: '推文' },
    { id: 'replies', label: '回复' },
    { id: 'highlights', label: '精选' },
    { id: 'articles', label: '文章' },
    { id: 'media', label: '媒体' },
    { id: 'likes', label: '喜欢' },
]

interface ProfileTabsProps {
    activeTab: string
    onTabChange: (tabId: string) => void
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    return (
        <div className="border-b px-4">
            <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex-1 min-w-[4rem] px-4 py-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 relative ${activeTab === tab.id ? 'text-foreground font-semibold' : ''}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

