import { redirect } from 'next/navigation';

/**
 * 节目编辑器主页面 - 重定向到创建页面
 */
export default function ProgramEditorPage() {
  redirect('/dashboard/program-editor/create');
}