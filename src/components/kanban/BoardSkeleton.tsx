export function BoardSkeleton({ columnCount = 5 }: { columnCount?: number }) {
  const columns = Array.from({ length: columnCount }, (_, i) => i);

  return (
    <div className="flex w-full h-full min-w-0 overflow-hidden bg-muted/30">
      <div className="flex-1 h-full overflow-x-auto overflow-y-hidden px-4 py-6">
        <div className="flex gap-6 h-full pb-6" style={{ width: 'fit-content', minWidth: '100%' }}>
          {columns.map((_, i) => (
            <div key={i} className="flex-shrink-0" style={{ flex: '0 0 340px' }}>
              <div className="bg-background rounded-xl border border-border h-full flex flex-col overflow-hidden animate-pulse">
                <div className="flex-shrink-0 flex items-center justify-between gap-2 px-3.5 py-3 border-b border-border border-t-[3px]" style={{ borderTopColor: 'hsl(var(--primary))' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-[9px] h-[9px] rounded-full shrink-0 bg-primary" />
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-4 w-16 bg-muted rounded shrink-0" />
                    <div className="h-4 w-20 bg-muted rounded shrink-0" />
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <div className="h-7 w-7 bg-muted rounded" />
                    <div className="h-7 w-7 bg-muted rounded" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="bg-muted rounded-xl p-3.5 border border-border">
                      <div className="absolute top-2 right-2 flex items-center gap-0.5">
                        <div className="h-6 w-6 bg-muted rounded" />
                        <div className="h-6 w-6 bg-muted rounded" />
                      </div>
                      <div className="flex items-start gap-3 mb-2.5 pr-14">
                        <div className="w-[34px] h-[34px] shrink-0 rounded-full bg-muted" />
                        <div className="min-w-0 flex-1">
                          <div className="h-4 w-40 bg-muted rounded mb-1" />
                          <div className="h-3 w-24 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="h-8 w-3/4 bg-muted rounded mb-2.5" />
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-20 bg-muted rounded-full" />
                        <div className="h-5 w-16 bg-muted rounded-full" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <div className="h-5 w-16 bg-muted rounded-full" />
                        <div className="h-5 w-12 bg-muted rounded-full" />
                      </div>
                      <div className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-muted rounded" />
                          <div className="h-3 w-24 bg-muted rounded" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-muted rounded" />
                          <div className="h-3 w-16 bg-muted rounded" />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="h-10 bg-muted/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center" />
                </div>
              </div>
            </div>
          ))}

          <div className="flex-shrink-0 w-80">
            <div className="bg-muted/50 rounded-xl p-6 h-full border-2 border-dashed border-border flex flex-col items-center justify-center animate-pulse">
              <div className="w-12 h-12 rounded-full bg-muted mb-3" />
              <div className="h-4 w-24 bg-muted rounded mb-1" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}