import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '节目编辑器',
  description: 'LED节目可视化编辑器',
};

interface ProgramEditorLayoutProps {
  children: React.ReactNode;
}

/**
 * 节目编辑器布局组件
 */
export default function ProgramEditorLayout({
  children,
}: ProgramEditorLayoutProps) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
}