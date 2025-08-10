'use client';

import { EditorState } from "../types/editor-state";
import { ItemType } from "../types/material-ref";

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateEditorStateForCreation(editor: EditorState): ValidationResult {
  const errors: ValidationError[] = [];

  // 基础信息
  if (!editor?.program) {
    errors.push({ path: 'program', message: '缺少节目基础信息' });
  } else {
    if (!Number.isFinite(editor.program.width) || editor.program.width <= 0) {
      errors.push({ path: 'program.width', message: '节目宽度必须为正整数' });
    }
    if (!Number.isFinite(editor.program.height) || editor.program.height <= 0) {
      errors.push({ path: 'program.height', message: '节目高度必须为正整数' });
    }
  }

  const pages = editor?.pages || [];
  if (pages.length === 0) {
    errors.push({ path: 'pages', message: '至少需要一个页面' });
  }

  pages.forEach((page, pageIndex) => {
    const pagePath = `pages[${pageIndex}]`;
    // LoopType 与 AppointDuration 约束（LoopType=0 时要求 AppointDuration）
    if (page.loopType === 0) {
      if (!page.appointDuration || page.appointDuration <= 0) {
        errors.push({ path: `${pagePath}.appointDuration`, message: '页面为指定时长播放时，必须设置有效的 AppointDuration' });
      }
    }

    const regions = page?.regions || [];
    if (regions.length === 0) {
      errors.push({ path: `${pagePath}.regions`, message: '每个页面至少需要一个区域' });
      return;
    }

    regions.forEach((region, regionIndex) => {
      const regionPath = `${pagePath}.regions[${regionIndex}]`;
      const rect = region?.rect as any;
      if (!rect) {
        errors.push({ path: `${regionPath}.rect`, message: '区域缺少 Rect' });
      } else {
        const required = ['x', 'y', 'width', 'height', 'borderWidth'];
        for (const key of required) {
          if (rect[key] === undefined || rect[key] === null) {
            errors.push({ path: `${regionPath}.rect.${key}`, message: `Rect.${key} 必须填写` });
          }
        }
      }

      const items = region?.items || [];
      if (items.length === 0) {
        errors.push({ path: `${regionPath}.items`, message: '区域内至少需要一个素材' });
        return;
      }

      // 同步窗口限制（Name='sync_program'）
      if (typeof region.name === 'string' && region.name.trim() === 'sync_program') {
        for (let i = 0; i < items.length; i++) {
          const t = items[i].type as ItemType;
          if (![ItemType.IMAGE, ItemType.VIDEO, ItemType.GIF].includes(t)) {
            errors.push({ path: `${regionPath}.items[${i}].type`, message: '同步窗口仅可包含 图片/视频/GIF 素材' });
          }
        }
      }

      // 文本类必填
      items.forEach((item, itemIndex) => {
        const itemPath = `${regionPath}.items[${itemIndex}]`;
        if ([ItemType.SINGLE_LINE_TEXT, ItemType.MULTI_LINE_TEXT, ItemType.SINGLE_COLUMN_TEXT].includes(item.type as ItemType)) {
          const text = (item as any).properties?.text;
          if (!text || String(text).trim() === '') {
            errors.push({ path: `${itemPath}.properties.text`, message: '文本内容不能为空' });
          }
          const font = (item as any).properties?.font;
          if (!font || !Number.isFinite(font.size) || font.size <= 0) {
            errors.push({ path: `${itemPath}.properties.font.size`, message: '文本字体大小(lfHeight)必须大于0' });
          }
        }
      });
    });
  });

  return { isValid: errors.length === 0, errors };
}

