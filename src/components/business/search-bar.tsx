"use client"

import * as React from "react"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"

interface SearchBarProps {
    onSearch: (query: string) => void
    className?: string
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
    const [query, setQuery] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(query)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value
        setQuery(newQuery)
        onSearch(newQuery) // Trigger search on each change for real-time filtering
    }

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-[18px] w-[18px]" />
                <Input
                    type="search"
                    placeholder="搜索帖子..."
                    value={query}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 h-11 rounded-full bg-muted/60 border-none text-base placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/20"
                />
            </div>
        </form>
    )
}

