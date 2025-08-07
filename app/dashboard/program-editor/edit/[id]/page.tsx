'use client';

interface EditProgramPageProps {
  params: {
    id: string;
  };
}

/**
 * 编辑现有节目页面
 */
export default function EditProgramPage({ params }: EditProgramPageProps) {
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <h1 className="text-lg font-semibold">编辑节目 - {params.id}</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">节目编辑器</h2>
            <p className="text-muted-foreground mt-2">
              正在加载编辑器组件...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}