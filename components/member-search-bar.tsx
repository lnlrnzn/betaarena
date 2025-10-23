'use client';

interface MemberSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalMembers: number;
  filteredCount: number;
}

export function MemberSearchBar({
  searchQuery,
  onSearchChange,
  totalMembers,
  filteredCount,
}: MemberSearchBarProps) {
  return (
    <div className="border-4 border-border bg-card p-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="flex-1 w-full">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search members by username or name..."
              className="w-full px-4 py-3 pl-12 border-4 border-border bg-background text-foreground font-mono text-sm focus:border-primary focus:outline-none"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              🔍
            </div>
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {searchQuery ? (
            <>
              <span className="font-bold text-foreground">{filteredCount}</span> of{' '}
              <span className="font-bold text-foreground">{totalMembers}</span> members
            </>
          ) : (
            <>
              <span className="font-bold text-foreground">{totalMembers}</span> total members
            </>
          )}
        </div>
      </div>
    </div>
  );
}
